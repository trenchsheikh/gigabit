import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { getFloorplanForAddress } from './services/floorplanScraper';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Floorplan Scraper Endpoint
app.post('/api/floorplan', async (req, res) => {
    try {
        const { postcode, houseNumber, street } = req.body;

        if (!postcode || !houseNumber || !street) {
            return res.status(400).json({ error: 'Missing required fields: postcode, houseNumber, street' });
        }

        console.log(`Received floorplan request for: ${houseNumber} ${street}, ${postcode}`);

        const result = await getFloorplanForAddress(postcode, houseNumber, street);

        if (!result) {
            return res.status(404).json({ error: 'Floorplan not found' });
        }

        return res.json(result);
    } catch (error) {
        console.error('Error processing floorplan request:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Address Search Endpoint (using getAddress.io)
app.get('/api/address-search', async (req, res) => {
    const query = req.query.query as string;

    if (!query || query.length < 3) {
        return res.json([]);
    }

    try {
        const apiKey = process.env.GETADDRESS_API_KEY;
        if (!apiKey) {
            console.error('GETADDRESS_API_KEY is missing');
            // Fallback to mock if key is missing, or just return empty
            return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
        }

        // Call getAddress.io Autocomplete API
        const response = await axios.get(`https://api.getaddress.io/autocomplete/${encodeURIComponent(query)}`, {
            params: {
                'api-key': apiKey,
                all: true
            }
        });

        // Transform response
        // getAddress.io returns { suggestions: [ { address: "...", id: "..." } ] }
        if (response.data && response.data.suggestions) {
            const suggestions = response.data.suggestions.map((s: any) => s.address);
            return res.json(suggestions);
        }

        return res.json([]);
    } catch (error) {
        console.error('Address search error:', error);
        return res.json([]);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
