# Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (will be installed automatically)
- iOS Simulator (for Mac) or Android Emulator, or Expo Go app on your phone

## Initial Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Add your API keys:
     ```
     OPENAI_API_KEY=sk-your-key-here
     ELEVENLABS_API_KEY=your-key-here
     ```

3. **Add app assets:**
   The app expects the following assets in the `assets/` directory:
   - `icon.png` (1024x1024) - App icon
   - `splash.png` (1284x2778) - Splash screen
   - `adaptive-icon.png` (1024x1024) - Android adaptive icon
   - `favicon.png` (48x48) - Web favicon

   For now, you can use placeholder images or generate them using:
   - [App Icon Generator](https://www.appicon.co/)
   - Or create simple colored squares as placeholders

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Run on your device:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan the QR code with Expo Go app on your physical device

## Environment Variables Setup

The app uses Expo's `expo-constants` to read environment variables. 

**Option 1: Using app.config.js (Recommended)**
1. The project includes `app.config.js` which supports environment variables via `dotenv`
2. Make sure your `.env` file is in the root directory:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   ```
3. If `app.json` exists, you can rename it to `app.json.backup` (Expo will use `app.config.js` if it exists)

**Option 2: Using app.json**
- If you prefer `app.json`, you'll need to manually set the values in the `extra` field, or use Expo's environment variable system with `eas.json`

## Troubleshooting

### Environment variables not loading
- Make sure `.env` file exists in the root directory
- Restart the Expo development server after adding/changing `.env`
- Check that `app.json` has the `extra` field configured

### Camera permission issues
- On iOS: Check Info.plist for camera usage description
- On Android: Permissions are configured in `app.json`

### WebView not loading
- Check your internet connection
- The speed test URL should be accessible: `https://gigabitiq.speedtestcustom.com/`

### API errors
- Verify your API keys are correct
- Check that you have credits/quota for OpenAI and ElevenLabs
- Review error messages in the app console

## Building for Production

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Configure EAS:**
   ```bash
   eas build:configure
   ```

3. **Build:**
   ```bash
   eas build --platform ios
   eas build --platform android
   ```

## Notes

- The app uses mock WiFi strength data for the AR heatmap (MVP)
- House plans are mocked for East Hampshire planning application 181392
- All data is persisted locally using AsyncStorage
- The app follows the Figma prototype design as closely as possible

