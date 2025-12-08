// Alternative config file that supports environment variables
// If using this, rename app.json to app.json.backup
require('dotenv').config();

module.exports = {
  expo: {
    name: 'GigaBit WiFi AI',
    slug: 'gigbait',
    version: '1.0.0',
    orientation: 'portrait',
    // icon: './assets/icon.png', // Uncomment when you add the icon file
    userInterfaceStyle: 'light',
    splash: {
      backgroundColor: '#ffffff',
      // image: './assets/splash.png', // Uncomment when you add the splash image
      // resizeMode: 'contain',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.gigabit.wifiai',
      infoPlist: {
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true,
        },
        NSPhotoLibraryUsageDescription: 'Allow GigaBit to access your photo library to save and share WiFi heatmap images.',
        NSCameraUsageDescription: 'Allow GigaBit to access your camera to scan WiFi signals and create AR heatmaps.',
        NSMicrophoneUsageDescription: 'Allow GigaBit to access your microphone to speak with AI assistants.',
      },
    },
    android: {
      // adaptiveIcon: {
      //   foregroundImage: './assets/adaptive-icon.png',
      //   backgroundColor: '#ffffff',
      // },
      package: 'com.gigabit.wifiai',
      permissions: [
        'CAMERA',
        'RECORD_AUDIO',
        'ACCESS_NETWORK_STATE',
        'ACCESS_WIFI_STATE',
      ],
    },
    // web: {
    //   favicon: './assets/favicon.png',
    // },
    plugins: [
      [
        'expo-camera',
        {
          cameraPermission: 'Allow GigaBit to access your camera to scan WiFi signals.',
        },
      ],
      [
        'expo-speech-recognition',
        {
          microphonePermission: 'Allow GigaBit to access your microphone to speak with AI assistants.',
        },
      ],
    ],
    extra: {
      eas: {
        projectId: '34b11282-4832-47e4-8ee9-dbf321de7264',
      },
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
      ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || '',
    },
  },
};


