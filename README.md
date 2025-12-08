# GigaBit WiFi AI App

A production-ready mobile application built with React Native and Expo that empowers users to optimize their home WiFi networks. It features AI-powered assistance, real-time device monitoring, AR signal heatmaps, and intelligent floor plan integration.

## 🚀 Features

- **AI WiFi Assistant**: Chat with specialized AI agents powered by OpenAI to troubleshoot network issues.
- **Real-Time Device Monitoring**: View connected devices, signal strength, and usage statistics (integrated with Calix).
- **Smart Floor Plans**: Automatically find and visualize floor plans based on address using intelligent scraping.
- **AR Heatmap**: Visualize WiFi signal strength in your home using Augmented Reality.
- **Speed Test**: Integrated network speed testing.
- **Voice Integration**: Text-to-Speech responses using ElevenLabs.

## 🛠 Tech Stack

- **Framework**: React Native with Expo (SDK 51)
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **State Management**: Zustand
- **API Integration**: Axios, Cheerio (replaced with node-html-parser for RN compatibility)
- **AI/ML**: OpenAI API, ElevenLabs API
- **Backend Logic**: Serverless architecture (migrated from Express to client-side services)

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo Go app (for testing on physical devices)

## ⚙️ Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd GigaBit
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## 🔑 Configuration

Create a `.env` file in the root directory and configure the following keys. 

> **Note:** Variables prefixed with `EXPO_PUBLIC_` are accessible to the Expo client application.

```env
# AI Services
OPENAI_API_KEY=your_openai_key
ELEVENLABS_API_KEY=your_elevenlabs_key

# Calix Integration (Device Monitoring)
EXPO_PUBLIC_CALIX_BASE_URL=https://api.calix.ai/v1/csc/insights
EXPO_PUBLIC_CALIX_AUTH_URL=https://api.calix.ai/v1/authentication/token
EXPO_PUBLIC_CALIX_CLIENT_ID=your_calix_client_id
EXPO_PUBLIC_CALIX_CLIENT_SECRET=your_calix_client_secret
EXPO_PUBLIC_CALIX_USERNAME=your_calix_username
EXPO_PUBLIC_CALIX_PASSWORD=your_calix_password
EXPO_PUBLIC_CALIX_TENANT=your_tenant_id (optional)

# Address Services
EXPO_PUBLIC_GETADDRESS_API_KEY=your_getaddress_key
```

## 📱 Running the App

The application runs entirely on the client side. No separate backend server process is required.

1. **Start the development server:**
   ```bash
   npx expo start
   ```

2. **Run on your device:**
   - **iOS**: Press `i` to run in Simulator, or scan the QR code with the Camera app (requires Expo Go).
   - **Android**: Press `a` to run in Emulator, or scan the QR code with the Expo Go app.

## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/             # Application screens
├── navigation/          # Navigation configuration
├── services/            # Business logic and API clients
│   ├── api/             # External API integrations (Calix, Floorplan)
│   └── ...
├── store/               # Global state management (Zustand)
├── types/               # TypeScript definitions
└── utils/               # Helper functions
```

## 📦 Deployment

### Building for TestFlight (iOS)

1. **Configure EAS:**
   Ensure `eas.json` is configured with your build profile (e.g., `production`).

2. **Run Build:**
   ```bash
   eas build --platform ios --profile production
   ```

3. **Submit:**
   Once built, you can submit to TestFlight via EAS or download the IPA and upload via Transporter.

## 📄 License

Private and Confidential. All rights reserved.
