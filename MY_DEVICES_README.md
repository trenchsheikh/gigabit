# My Devices Feature Setup

This feature adds a "My Devices" section to the dashboard, powered by a local Node.js backend that proxies the Calix Service Insights API.

## Prerequisites

1.  **Environment Variables**:
    Create a `.env` file in the root `d:\GigaBit` (or `server/`) with the following credentials:
    ```env
    CALIX_CLIENT_ID=your_client_id
    CALIX_CLIENT_SECRET=your_client_secret
    CALIX_USERNAME=your_username
    CALIX_PASSWORD=your_password
    CALIX_ROUTER_SERIAL=target_router_serial_number
    CALIX_BASE_URL=https://api.calix.ai/v1/csc/insights
    # Optional: CALIX_AUTH_URL=https://api.calix.ai/v1/oauth/token
    PORT=4000
    ```

    In the frontend (root `.env` or `.env.local`), ensure you have:
    ```env
    EXPO_PUBLIC_API_BASE_URL=http://localhost:4000
    ```
    (Replace `localhost` with your machine's IP if testing on a physical device)

## Running the Backend

The backend is located in `server/`.

1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Install dependencies (if not already done):
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The server will start on port 4000 (or as defined in `.env`).

## Running the Frontend

1.  Navigate to the root directory:
    ```bash
    cd ..
    ```
2.  Start the Expo app:
    ```bash
    npx expo start
    ```

## Features

-   **Backend**: Proxies Calix API to fetch device list (`/api/devices`). Handles authentication and token caching.
-   **Frontend**: `MyDevices` component displays connected devices with signal quality indicators.
