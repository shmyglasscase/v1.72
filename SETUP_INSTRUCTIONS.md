# MyGlassCase - Setup Instructions

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v18 or later)
   ```bash
   node --version  # Should be v18.0.0 or higher
   ```

2. **npm** or **yarn**
   ```bash
   npm --version
   ```

3. **Expo CLI** (optional, but recommended)
   ```bash
   npm install -g expo-cli
   ```

4. **EAS CLI** (for builds)
   ```bash
   npm install -g eas-cli
   ```

5. **Platform-Specific Tools**:
   - **iOS**: Xcode (Mac only) - [Download from App Store](https://apps.apple.com/app/xcode/id497799835)
   - **Android**: Android Studio - [Download](https://developer.android.com/studio)
   - **Web**: Any modern browser

---

## 📦 Installation

### Step 1: Install Dependencies

```bash
# Navigate to project directory
cd /path/to/myglasscase

# Install all dependencies
npm install

# This will install:
# - Expo SDK and all modules
# - React Navigation
# - Supabase client
# - All other dependencies listed in package.json
```

### Step 2: Verify Environment Variables

Your `.env` file should already contain:
```env
VITE_SUPABASE_URL=https://igymhkccvdlvkfjbmpxp.supabase.co
VITE_SUPABASE_ANON_KEY=your-key-here
VITE_STRIPE_PUBLISHABLE_KEY=your-key-here
VITE_ABLY_API_KEY=your-key-here
# ... other variables
```

**Note**: These variables are loaded via `app.config.js` automatically.

### Step 3: Generate App Icons and Splash Screens

You'll need to create/provide these assets in the `assets/` directory:
- `icon.png` (1024x1024)
- `adaptive-icon.png` (1024x1024, for Android)
- `splash.png` (2048x2048)
- `favicon.png` (48x48, for web)

Temporary placeholder command (optional):
```bash
mkdir -p assets
# Add your logo files to the assets directory
```

### Step 4: Configure EAS (Expo Application Services)

```bash
# Login to Expo
eas login

# Configure project
eas build:configure

# This will:
# 1. Create/update eas.json (already exists)
# 2. Link your project to EAS
# 3. Generate project ID
```

---

## 🏃 Running the App

### Development Mode

**Start the development server:**
```bash
npm start
```

This will open Expo Dev Tools in your terminal. You can then:
- Press `w` to open in web browser
- Press `i` to open in iOS simulator (Mac only)
- Press `a` to open in Android emulator
- Scan QR code with Expo Go app on your phone

**Or run directly:**
```bash
# Web
npm run web

# iOS Simulator (Mac only)
npm run ios

# Android Emulator
npm run android
```

### Running on Physical Devices (Development)

1. **Install Expo Go app**:
   - iOS: [Download from App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Download from Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Connect to same WiFi** as your development machine

3. **Scan QR code** from the terminal with:
   - iOS: Camera app
   - Android: Expo Go app

---

## 🔨 Building for Production

### iOS Build

```bash
# Development build (for testing)
eas build --platform ios --profile development

# Preview build (TestFlight beta)
eas build --platform ios --profile preview

# Production build (App Store)
eas build --platform ios --profile production
```

**Requirements**:
- Apple Developer Account ($99/year)
- App Store Connect app created
- Certificates and provisioning profiles (EAS handles this)

### Android Build

```bash
# Development build (APK for testing)
eas build --platform android --profile development

# Preview build (internal testing)
eas build --platform android --profile preview

# Production build (Play Store)
eas build --platform android --profile production
```

**Requirements**:
- Google Play Developer Account ($25 one-time)
- Play Console app created
- Upload key (EAS handles this)

### Web Build

```bash
# Build for web
npx expo export:web

# Output will be in web-build/ directory
# Deploy this directory to any static host:
# - Netlify
# - Vercel
# - GitHub Pages
# - Your own server
```

---

## 🧪 Testing

### Expo Go App (Development)

For quick testing during development:
```bash
npm start
# Scan QR code with Expo Go app
```

**Limitations**:
- Cannot test in-app purchases
- Cannot test push notifications
- Cannot use some native modules

### Development Builds

For full feature testing:
```bash
# Create development build
eas build --platform ios --profile development
eas build --platform android --profile development

# Install on your device
# Then run: npm start
# This gives you full native features while still getting hot reload
```

### Testing In-App Purchases

**iOS**:
1. Create sandbox tester account in App Store Connect
2. Sign in with sandbox account on device
3. Test purchase flow (won't charge real money)

**Android**:
1. Add test user emails in Google Play Console
2. Upload AAB to internal testing track
3. Test purchase flow with test users

### Testing Push Notifications

**Must test on physical device** (simulators don't support push):
```bash
# After registering for notifications in app
# Send test notification:
curl -H "Content-Type: application/json" \
     -X POST https://exp.host/--/api/v2/push/send \
     -d '{
       "to": "ExponentPushToken[YOUR_TOKEN_HERE]",
       "title": "Test",
       "body": "This is a test notification"
     }'
```

---

## 🌐 Deploying Web Version

### Option 1: Netlify

```bash
# Build
npx expo export:web

# Deploy (install netlify-cli first: npm i -g netlify-cli)
netlify deploy --dir web-build --prod
```

### Option 2: Vercel

```bash
# Build
npx expo export:web

# Deploy (install vercel cli first: npm i -g vercel)
vercel --prod
```

### Option 3: GitHub Pages

```bash
# Build
npx expo export:web

# Copy web-build/ contents to gh-pages branch
# Or use gh-pages package:
npm i -D gh-pages
npx gh-pages -d web-build
```

---

## 📱 Submitting to App Stores

### iOS App Store

```bash
# 1. Create production build
eas build --platform ios --profile production

# 2. When build completes, submit:
eas submit --platform ios --latest

# Or manually:
# - Download .ipa from EAS
# - Upload to App Store Connect via Transporter app
# - Submit for review in App Store Connect
```

**Checklist before submission**:
- [ ] App Store listing created
- [ ] Screenshots prepared (5.5", 6.5" displays)
- [ ] App description written
- [ ] Privacy policy URL provided
- [ ] In-app purchases configured
- [ ] Test with TestFlight first
- [ ] App review information filled out

### Google Play Store

```bash
# 1. Create production build
eas build --platform android --profile production

# 2. When build completes, submit:
eas submit --platform android --latest

# Or manually:
# - Download .aab from EAS
# - Upload to Play Console
# - Create release in internal testing
# - Promote to production when ready
```

**Checklist before submission**:
- [ ] Play Console listing created
- [ ] Screenshots prepared (phone & tablet)
- [ ] Feature graphic (1024x500)
- [ ] App description written
- [ ] Privacy policy URL provided
- [ ] Content rating questionnaire completed
- [ ] Pricing & distribution set
- [ ] In-app products configured

---

## 🔧 Troubleshooting

### Metro Bundler Issues

```bash
# Clear cache
npx expo start --clear

# Or
npm start -- --clear

# Nuclear option (if above doesn't work):
rm -rf node_modules
rm -rf .expo
rm package-lock.json
npm install
npm start -- --clear
```

### iOS Simulator Not Opening

```bash
# Reset simulator
xcrun simctl shutdown all
xcrun simctl erase all

# Open simulator manually
open -a Simulator

# Then in Expo: press 'i'
```

### Android Emulator Issues

```bash
# List available emulators
emulator -list-avds

# Start specific emulator
emulator -avd Pixel_5_API_33 &

# Then in Expo: press 'a'
```

### Build Failures

**iOS**:
- Check Apple Developer Portal for certificate issues
- Ensure bundle ID matches app.json
- Check provisioning profile validity

**Android**:
- Check Java version: `java --version` (needs 11)
- Check Android SDK installation
- Verify signing credentials in EAS

### Module Not Found Errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear Metro cache
npx expo start --clear

# Restart TypeScript server (if using VS Code)
# Command Palette > TypeScript: Restart TS Server
```

### Environment Variables Not Loading

```bash
# 1. Verify .env file exists
ls -la .env

# 2. Verify app.config.js reads it
cat app.config.js

# 3. Restart dev server (env vars load on start)
npm start

# 4. Check if loaded in app
import Constants from 'expo-constants';
console.log(Constants.expoConfig?.extra);
```

---

## 🎯 Next Steps After Setup

Once you've successfully run `npm start` and can see the app:

1. **Review the conversion guides**:
   - Read `CONVERSION_SUMMARY.md` for overview
   - Read `README_IMPLEMENTATION.md` for detailed steps
   - Read `CONVERSION_GUIDE.md` for comprehensive info

2. **Start with Phase 1**: Create UI component library
   - Create `src/components/ui/Button.tsx`
   - Create `src/components/ui/Card.tsx`
   - Create `src/components/ui/Input.tsx`
   - Test each component as you build it

3. **Move to Phase 2**: Update contexts
   - Update `ThemeContext` to use AsyncStorage
   - Update `AuthContext` to remove web-specific code

4. **Continue through phases** as outlined in the implementation guide

---

## 📞 Support Resources

- **Expo Documentation**: https://docs.expo.dev/
- **React Native Documentation**: https://reactnative.dev/
- **React Navigation**: https://reactnavigation.org/
- **Supabase**: https://supabase.com/docs
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **Expo Forums**: https://forums.expo.dev/

---

## ✅ Setup Complete Checklist

Before moving to development:
- [ ] Node.js v18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file exists with credentials
- [ ] EAS CLI installed and logged in
- [ ] Dev server runs successfully (`npm start`)
- [ ] Can open app in web browser (press `w`)
- [ ] (Optional) Can open in iOS simulator (press `i`)
- [ ] (Optional) Can open in Android emulator (press `a`)
- [ ] Read conversion documentation
- [ ] Ready to start Phase 1

---

**You're all set! Time to start building.** 🚀

Refer to `README_IMPLEMENTATION.md` for your next steps.
