// Simple script to create placeholder assets
// Run: node create-assets.js
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create a simple note file explaining what's needed
const note = `# Assets Required

For production builds, you need to add these image files:

1. icon.png (1024x1024) - App icon
2. splash.png (1284x2778) - Splash screen  
3. adaptive-icon.png (1024x1024) - Android adaptive icon
4. favicon.png (48x48) - Web favicon

For development, Expo will show warnings but the app will still work.

You can:
- Use an online tool like https://www.appicon.co/
- Create simple colored square images
- Or ignore for now and add them before building for production
`;

fs.writeFileSync(path.join(assetsDir, 'README.txt'), note);
console.log('Assets directory created. See assets/README.txt for instructions.');




