import axios from 'axios';
import * as cheerio from 'cheerio';

// Types
export interface ListingSummary {
    address: string;
    detailUrl: string;
}

export interface FloorplanResult {
    floorplanUrl: string;
    listingAddress: string;
    listingUrl: string;
}

// TODO: Replace with the actual property listing site URL
// Example: 'https://www.rightmove.co.uk'
const BASE_URL = 'https://www.rightmove.co.uk';

// Cache
const cache = new Map<string, { data: FloorplanResult; timestamp: number }>();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

// Helper: Fetch HTML
async function fetchHtml(url: string): Promise<string> {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
            timeout: 10000,
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching URL: ${url}`, error);
        throw new Error(`Failed to fetch HTML from ${url}`);
    }
}

// 2. Search Listings
export async function searchListings(postcode: string): Promise<Array<ListingSummary>> {
    // Rightmove search URL pattern
    // Rightmove search URL pattern - Refined for exact postcode area
    const searchUrl = `${BASE_URL}/property-for-sale/search.html?searchLocation=${encodeURIComponent(postcode)}&useLocationIdentifier=false&locationIdentifier=&buy=For+sale&radius=0.0&_includeSSTC=on`;

    console.log(`Searching listings at: ${searchUrl}`);
    const html = await fetchHtml(searchUrl);
    const $ = cheerio.load(html);
    const listings: ListingSummary[] = [];

    // Rightmove property card selectors (approximate, based on common structures)
    // Note: Rightmove changes classes often, so we look for semantic structures where possible
    // or common class patterns.

    // Strategy: Look for property card containers
    $('.propertyCard').each((_, element) => {
        const address = $(element).find('.propertyCard-address').text().trim();
        const relativeUrl = $(element).find('.propertyCard-link').attr('href');

        if (address && relativeUrl && !relativeUrl.includes('contactBranch')) {
            listings.push({
                address,
                detailUrl: relativeUrl.startsWith('http') ? relativeUrl : `${BASE_URL}${relativeUrl}`,
            });
        }
    });

    // Fallback: Try newer Rightmove selectors if the above fails
    if (listings.length === 0) {
        $('[class*="propertyCard"]').each((_, element) => {
            const address = $(element).find('address').text().trim() ||
                $(element).find('[class*="address"]').text().trim();
            const relativeUrl = $(element).find('a[class*="link"]').attr('href');

            if (address && relativeUrl && !relativeUrl.includes('contactBranch')) {
                listings.push({
                    address,
                    detailUrl: relativeUrl.startsWith('http') ? relativeUrl : `${BASE_URL}${relativeUrl}`,
                });
            }
        });
    }

    return listings;
}

// 3. Pick Best Match
export function pickBestMatch(listings: ListingSummary[], houseNumber: string, street: string): ListingSummary | null {
    const target = `${houseNumber} ${street}`.toLowerCase();
    const targetStreet = street.toLowerCase();
    const targetNumber = houseNumber.toLowerCase();

    // 1. Try exact(ish) match including house number and street
    const exactMatch = listings.find(l => {
        const addr = l.address.toLowerCase();
        return addr.includes(target) || (addr.includes(targetNumber) && addr.includes(targetStreet));
    });
    if (exactMatch) return exactMatch;

    // 2. Fallback: Match by street only (less accurate, but better than nothing for demo)
    // Ideally we wouldn't do this without user confirmation, but for this flow we pick the best candidate.
    const streetMatch = listings.find(l => l.address.toLowerCase().includes(targetStreet));

    if (streetMatch) return streetMatch;

    return null;
}

// 4. Extract Floorplan URL
export async function extractFloorplanUrl(detailUrl: string): Promise<string | null> {
    console.log(`Extracting floorplan from: ${detailUrl}`);
    try {
        const html = await fetchHtml(detailUrl);
        const $ = cheerio.load(html);

        let floorplanUrl: string | null = null;

        // Strategy 1: Look for <img> tags with "floorplan" in alt or src
        $('img').each((_, element) => {
            const alt = $(element).attr('alt')?.toLowerCase() || '';
            const src = $(element).attr('src');

            if (src && (alt.includes('floor plan') || alt.includes('floorplan'))) {
                floorplanUrl = src;
                return false; // Break loop
            }
        });

        if (floorplanUrl) return floorplanUrl;

        // Strategy 2: Look for specific Rightmove floorplan tabs/links
        // Rightmove often puts floorplans in a separate tab or gallery
        // Look for links that might open a floorplan gallery
        $('a').each((_, element) => {
            const href = $(element).attr('href');
            if (href && href.includes('floorplan')) {
                // Often these are API calls or separate pages, but sometimes direct images
                if (href.match(/\.(jpg|jpeg|png|gif)$/i)) {
                    floorplanUrl = href;
                    return false;
                }
            }
        });

        if (floorplanUrl) return floorplanUrl;

        // Strategy 3: Look for script data (PAGE_MODEL)
        // Rightmove often embeds data in a script tag
        const scriptContent = $('script').filter((_, el) => {
            return ($(el).html() || '').includes('PAGE_MODEL');
        }).html();

        if (scriptContent) {
            try {
                // Very rough extraction of the JSON object
                const match = scriptContent.match(/PAGE_MODEL\s*=\s*({.+?});/);
                if (match && match[1]) {
                    const pageModel = JSON.parse(match[1]);
                    // Traverse for floorplans
                    // Note: Structure varies, this is a guess based on common React props
                    const floorplans = pageModel?.propertyData?.floorplans;
                    if (Array.isArray(floorplans) && floorplans.length > 0) {
                        floorplanUrl = floorplans[0].url;
                    }
                }
            } catch (e) {
                console.log('Failed to parse PAGE_MODEL', e);
            }
        }

        return floorplanUrl;
    } catch (error) {
        console.error('Error extracting floorplan:', error);
        return null;
    }
}

// Main Service Function
export async function getFloorplanForAddress(postcode: string, houseNumber: string, street: string): Promise<FloorplanResult | null> {
    const cacheKey = `${postcode}|${houseNumber.toLowerCase()}|${street.toLowerCase()}`;

    // Check Cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        console.log('Returning cached floorplan result');
        return cached.data;
    }

    // 1. Search
    const listings = await searchListings(postcode);
    if (listings.length === 0) {
        console.log('No listings found');
        return null;
    }

    // 2. Match
    const match = pickBestMatch(listings, houseNumber, street);
    if (!match) {
        console.log('No matching listing found');
        return null;
    }

    // 3. Extract
    const floorplanUrl = await extractFloorplanUrl(match.detailUrl);
    if (!floorplanUrl) {
        console.log('No floorplan found in listing');
        return null;
    }

    const result: FloorplanResult = {
        floorplanUrl,
        listingAddress: match.address,
        listingUrl: match.detailUrl,
    };

    // Update Cache
    cache.set(cacheKey, { data: result, timestamp: Date.now() });

    return result;
}
