# Quick Start Guide

## ✅ Setup Complete!

Your app is now ready to run. Here's what was done:

1. ✅ Dependencies installed
2. ✅ `.env` file created (add your API keys!)
3. ✅ Expo server starting

## 🚀 Next Steps

### 1. Add Your API Keys

Edit the `.env` file and add your actual API keys:

```
OPENAI_API_KEY=sk-your-actual-key-here
ELEVENLABS_API_KEY=your-actual-key-here
```

### 2. Add App Assets (Optional for Development)

The app references these assets in `assets/` folder:
- `icon.png` (1024x1024)
- `splash.png` (1284x2778) 
- `adaptive-icon.png` (1024x1024)
- `favicon.png` (48x48)

**Note:** Expo will work without these, but you'll see warnings. You can:
- Create simple colored square images as placeholders
- Use an online tool like [App Icon Generator](https://www.appicon.co/)
- Or ignore for now and add them later

### 3. Run the App

The Expo development server should be starting. Once it's ready, you'll see:

- A QR code in the terminal
- Options to press:
  - `i` - Open iOS simulator
  - `a` - Open Android emulator  
  - `w` - Open in web browser
  - Or scan QR code with Expo Go app on your phone

### 4. Test the App

1. **Onboarding**: First launch will show onboarding screens
2. **Dashboard**: Main screen with quick actions
3. **Speed Test**: Tap to test network speed
4. **AI Agents**: Create and chat with AI agents (requires OpenAI API key)
5. **House Plans**: Add your address to load house plan
6. **AR Scan**: Use camera to scan WiFi signals

## 🔧 Troubleshooting

### Expo server not starting?
- Make sure port 8081 is not in use
- Try: `npx expo start --clear`

### API errors?
- Check your `.env` file has valid API keys
- Restart Expo server after changing `.env`

### Missing assets warning?
- This is normal - the app will still work
- Add assets later when ready to build for production

### Camera permission issues?
- iOS: Check Settings > Privacy > Camera
- Android: Permissions are auto-requested

## 📱 Running on Physical Device

1. Install **Expo Go** app from App Store/Play Store
2. Make sure your phone and computer are on the same WiFi
3. Scan the QR code shown in terminal
4. App will load on your device!

## 🎉 You're All Set!

The app is running locally. Start exploring the features!


