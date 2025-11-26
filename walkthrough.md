# Walkthrough - Floorplan Scraper Endpoint

I have added a new backend server with the requested `POST /api/floorplan` endpoint.

## Changes

1.  **Created `server` directory**:
    - Initialized a Node.js + TypeScript project.
    - Installed `express`, `axios`, `cheerio`, `cors`.
    - Configured `tsconfig.json`.

2.  **Implemented Service (`server/src/services/floorplanScraper.ts`)**:
    - `fetchHtml`: Fetches HTML using axios with a browser-like User-Agent.
    - `searchListings`: Scrapes listing summaries (Placeholder selectors used).
    - `pickBestMatch`: Matches listings by address.
    - `extractFloorplanUrl`: Finds floorplan images in detail pages.
    - `getFloorplanForAddress`: Orchestrates the flow and handles caching (6-hour TTL).

3.  **Implemented API (`server/src/index.ts`)**:
    - Sets up Express server on port 3000.
    - `POST /api/floorplan` endpoint wired to the service.

4.  **Updated Root `package.json`**:
    - Added `"server": "cd server && npm run dev"` script for convenience.

## How to Run

1.  **Start the Server**:
    ```bash
    npm run server
    ```
    This will start the backend on `http://localhost:3000`.

2.  **Test the Endpoint**:
    You can test it using `curl` or Postman:
    ```bash
    curl -X POST http://localhost:3000/api/floorplan \
      -H "Content-Type: application/json" \
      -d '{"postcode": "SW1A 1AA", "houseNumber": "10", "street": "Downing Street"}'
    ```

## Next Steps (TODOs)

You need to fill in the site-specific details in `server/src/services/floorplanScraper.ts`:

1.  **Update `BASE_URL`**: Set the actual property listing site URL.
2.  **Update Selectors**:
    - In `searchListings`: Update `.propertyCard`, `.propertyCard-address`, `.propertyCard-link`.
    - In `extractFloorplanUrl`: Update image selectors to match the site's structure.
3.  **Refine Matching**: Adjust `pickBestMatch` if the site's address format requires more complex parsing.

The code is structured with clear `TODO` comments to guide you through these updates.
