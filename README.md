# GigaBit WiFi AI App

A production-quality mobile app built with React Native, Expo, and TypeScript that helps users optimize their home WiFi networks through AI-powered assistance, speed testing, AR heatmap scanning, and house plan integration.

## Features

- **Onboarding Flow**: Welcome screens to introduce users to the app
- **Dashboard**: Overview of network status and quick actions
- **Speed Test**: Integrated WebView for network speed testing
- **Custom AI Agents**: Create and chat with specialized WiFi optimization AI agents powered by OpenAI
- **Text-to-Speech**: ElevenLabs integration for audio playback of AI responses
- **House Plans**: Address input and house plan visualization (MVP supports East Hampshire planning application 181392)
- **AR WiFi Heatmap**: Camera-based scanning to visualize WiFi signal strength throughout the home
- **State Management**: Zustand for global state with AsyncStorage persistence

## Tech Stack

- **React Native** with **Expo** (SDK ~51)
- **TypeScript** for type safety
- **React Navigation** (Stack + Bottom Tabs)
- **Zustand** for state management
- **AsyncStorage** for data persistence
- **react-native-webview** for speed test integration
- **expo-camera** for AR heatmap scanning
- **expo-av** for audio playback
- **OpenAI API** for AI chat completions
- **ElevenLabs API** for text-to-speech

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Add your API keys:
     ```
     OPENAI_API_KEY=your_openai_api_key_here
     ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
     ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Run on your device:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your physical device

## Project Structure

```
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── ErrorView.tsx
│   │   └── LoadingSpinner.tsx
│   ├── config/              # Configuration files
│   │   └── env.ts           # Environment variables
│   ├── data/                # Mock data
│   │   └── mockHousePlans.ts
│   ├── navigation/          # Navigation setup
│   │   ├── AppNavigator.tsx
│   │   └── types.ts
│   ├── screens/             # Screen components
│   │   ├── OnboardingScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── SpeedTestScreen.tsx
│   │   ├── AgentsScreen.tsx
│   │   ├── AIAgentChatScreen.tsx
│   │   ├── CreateAgentScreen.tsx
│   │   ├── PlansScreen.tsx
│   │   ├── HousePlansScreen.tsx
│   │   ├── HousePlanDetailScreen.tsx
│   │   ├── ScanScreen.tsx
│   │   ├── ARHeatmapScreen.tsx
│   │   └── HeatmapSummaryScreen.tsx
│   ├── services/            # API services
│   │   ├── openai.ts
│   │   ├── elevenlabs.ts
│   │   └── storage.ts
│   ├── store/               # State management
│   │   └── useAppStore.ts
│   └── types/               # TypeScript types
│       └── index.ts
├── App.tsx                  # App entry point
├── app.json                 # Expo configuration
├── package.json
└── tsconfig.json
```

## Key Features Implementation

### Speed Test
- Uses `react-native-webview` to embed `https://gigabitiq.speedtestcustom.com/`
- Includes loading states and error handling
- Full-screen integration

### Custom AI Agents
- Create agents with custom names, descriptions, roles, and system instructions
- Chat interface with message history
- OpenAI GPT-4o integration
- Persistent storage using AsyncStorage

### Text-to-Speech
- ElevenLabs API integration
- Audio playback for AI responses
- Play/pause controls

### House Plans
- Address input form
- Mocked house plan data for East Hampshire planning application 181392
- Room-by-room visualization
- Link to planning portal

### AR WiFi Heatmap
- Camera-based scanning interface
- Tap-to-log WiFi strength points
- Color-coded visualization (green = strong, red = weak)
- Room-based analysis when house plan is selected
- Summary screen with statistics

## Environment Variables

The app uses environment variables for API keys. Make sure to:

1. Create a `.env` file in the root directory
2. Add your API keys:
   ```
   OPENAI_API_KEY=sk-...
   ELEVENLABS_API_KEY=...
   ```
3. The app reads these via `expo-constants` (configured in `app.json`)

## Permissions

The app requires the following permissions:
- **Camera**: For AR heatmap scanning
- **Network**: For API calls and WebView content

These are configured in `app.json` and requested at runtime.

## Notes

- The AR heatmap uses mock WiFi strength data for MVP. In production, you would integrate with platform-specific WiFi APIs.
- House plans are currently mocked for the specific East Hampshire planning application. Future versions would integrate with actual planning portal APIs.
- The app follows the Figma prototype design as closely as possible with the provided information.

## Development

- TypeScript strict mode enabled
- All components are strongly typed
- Error boundaries and loading states implemented throughout
- Clean separation of concerns (services, components, screens, state)

## License

Private project - All rights reserved


