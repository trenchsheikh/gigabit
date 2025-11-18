# Running iOS App on Windows

Since you can't run iOS Simulator on Windows, here are your options:

## Option 1: Expo Go (Quick Start - Limited Native Modules)

**Best for:** Quick testing, basic features
**Limitation:** Speech recognition may not work

### Steps:
1. Install **Expo Go** from the App Store on your iPhone
2. Make sure your iPhone and Windows PC are on the **same WiFi network**
3. Run the dev server:
   ```bash
   npm start
   ```
4. Scan the QR code with:
   - Your iPhone camera (iOS 11+)
   - Or open Expo Go app and scan from there

## Option 2: EAS Build Development Build (Recommended)

**Best for:** Full native module support (speech recognition, camera, etc.)
**Requires:** Free Expo account

### Steps:

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```
   (Create a free account if you don't have one)

3. **Build development build for iOS:**
   ```bash
   eas build --profile development --platform ios
   ```
   This will build in the cloud (takes ~15-20 minutes)

4. **Install on your iPhone:**
   - EAS will provide a download link
   - You can install via:
     - **TestFlight** (if you have an Apple Developer account)
     - **Direct download** (via the link provided)
     - **Ad Hoc distribution** (if you register your device UDID)

5. **Start development server:**
   ```bash
   npm start
   ```

6. **Connect the app:**
   - Open the development build on your iPhone
   - It will automatically connect to your dev server
   - Or scan the QR code shown in the terminal

### Important Notes:

- **First build takes longer** (~20 minutes) - subsequent builds are faster
- **You need an Apple Developer account** for TestFlight distribution (free account works for development builds)
- **Device UDID registration** may be required for direct installation
- The development build includes all native modules and will work with speech recognition

## Troubleshooting

### Can't connect to dev server?
- Make sure both devices are on the same WiFi
- Check Windows Firewall isn't blocking the connection
- Try using `tunnel` mode: `npx expo start --tunnel`

### Build fails?
- Make sure `app.config.js` is properly configured
- Check that all required permissions are set
- Verify your Expo account is logged in

### Speech recognition still not working?
- Make sure you're using the **development build** (Option 2), not Expo Go
- Check that microphone permissions are granted on your iPhone
- Restart the app after granting permissions

