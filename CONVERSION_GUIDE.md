# MyGlassCase - React Web to Expo Conversion Guide

## Overview
This project has been partially converted from a React web application to an Expo multi-platform application that runs on iOS, Android, and Web.

## What's Been Completed

### ✅ Core Configuration
- **Expo Configuration**: `app.json`, `app.config.js`, `eas.json` created with proper iOS, Android, and web settings
- **Package Management**: Updated `package.json` with all Expo and React Native dependencies
- **TypeScript Configuration**: React Native-compatible `tsconfig.json` with path aliases
- **Babel Configuration**: Added `babel.config.js` with module resolver for path aliases
- **Theme System**: Created comprehensive cross-platform theme with colors, spacing, typography, and shadows
- **Supabase Integration**: Updated to use Expo Constants and Secure Store (cross-platform compatible)
- **Ably Integration**: Updated for Expo Constants
- **Main App Entry**: Created root `App.tsx` with providers

### 📦 Dependencies Installed
- Expo SDK 51 with full platform support
- React Navigation (stack & bottom tabs)
- Expo Camera, Image Picker, Image Manipulator
- Expo Notifications
- Expo Secure Store
- Expo Linking & Sharing
- AsyncStorage for offline data
- Stripe React Native
- React Native Flash List for performance
- All necessary UI libraries

## What Needs to Be Done

### 1. Navigation Setup (`src/navigation/`)
Create the navigation structure:

```
src/navigation/
├── index.tsx              # Main navigation container with linking config
├── AuthStack.tsx          # Auth flow (sign in, sign up, reset password)
├── MainTabs.tsx           # Bottom tab navigator
├── InventoryStack.tsx     # Inventory screens stack
├── MarketplaceStack.tsx   # Marketplace screens stack
├── MessagesStack.tsx      # Messages screens stack
├── WishlistStack.tsx      # Wishlist screens stack
└── SettingsStack.tsx      # Settings screens stack
```

**Key Tasks:**
- Convert react-router-dom Routes to React Navigation screens
- Implement bottom tab navigator matching current mobile nav
- Set up deep linking configuration for share URLs
- Add proper header configuration for each screen

### 2. Convert Auth Context (`src/contexts/AuthContext.tsx`)
**Changes Needed:**
- Remove all `window.location` references → use React Navigation
- Remove browser-specific token cleanup (localStorage/sessionStorage loops)
- Keep AsyncStorage for web, SecureStore for mobile (already in supabase.ts)
- Update navigation after sign in/out using navigation hooks
- Remove `window.location.reload()` calls

### 3. Update Theme Context (`src/contexts/ThemeContext.tsx`)
**Changes Needed:**
- Import AsyncStorage instead of using localStorage directly
- Use `AsyncStorage.getItem`/`setItem` for theme persistence
- Add Platform check for web vs mobile behavior
- Use React Native's `Appearance` API for system theme detection

### 4. Create Core UI Components (`src/components/ui/`)
Convert web components to React Native:

```typescript
// Button.tsx - Replace HTML button with Pressable
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';

// Card.tsx - Replace div with View
import { View, StyleSheet } from 'react-native';

// Input.tsx - Replace input with TextInput
import { TextInput, View, Text, StyleSheet } from 'react-native';

// Modal.tsx - Use React Native Modal
import { Modal, View, StyleSheet } from 'react-native';
```

**Required Components:**
- Button (primary, secondary, danger variants)
- Card
- Input
- TextArea
- Select/Picker
- Modal
- Toast/Notification
- Loading Spinner
- Empty State
- Error Boundary

### 5. Camera & Image Picker Service (`src/services/imageService.ts`)
Create a service to handle image capture:

```typescript
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export const pickImage = async () => {
  // Request permissions
  // Show action sheet: Take Photo / Choose from Library
  // Return compressed image
};

export const takePhoto = async () => {
  // Request camera permission
  // Launch camera
  // Return compressed image
};

export const compressImage = async (uri: string) => {
  // Use ImageManipulator to compress
  // Return optimized image for upload
};
```

### 6. Push Notifications Service (`src/services/notificationService.ts`)
Implement push notifications:

```typescript
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const requestPermissions = async () => {
  // Request notification permissions
  // Get push token
  // Save token to Supabase user profile
};

export const scheduleNotification = async (title, body, data) => {
  // Schedule local notification
};

export const handleNotificationReceived = (notification) => {
  // Handle foreground notifications
};

export const handleNotificationResponse = (response) => {
  // Navigate to relevant screen when user taps notification
};
```

### 7. In-App Purchase Service (`src/services/iapService.ts`)
Implement IAP for mobile, keep Stripe for web:

```typescript
import { Platform } from 'react-native';
// For mobile: import * as IAP from 'expo-in-app-purchases';
// For web: import { loadStripe } from '@stripe/stripe-react-native';

export const purchaseSubscription = async (productId: string) => {
  if (Platform.OS === 'web') {
    // Use Stripe checkout
    return await stripeCheckout(productId);
  } else {
    // Use IAP
    return await iapPurchase(productId);
  }
};

export const restorePurchases = async () => {
  // Restore purchases for iOS/Android
};

export const getProducts = async () => {
  // Get subscription products from App Store / Play Store
};
```

### 8. Convert Screen Components
Convert all page components to React Native screens:

#### Auth Screens (`src/screens/auth/`)
- `SignInScreen.tsx` - Convert AuthForm for sign in
- `SignUpScreen.tsx` - Convert AuthForm for sign up
- `ResetPasswordScreen.tsx` - Convert password reset form

#### Main Screens (`src/screens/`)
- `HomeScreen.tsx` - Convert DashboardHome
- `InventoryScreen.tsx` - Convert InventoryManager with FlatList
- `MarketplaceScreen.tsx` - Convert MarketplacePage
- `MessagesScreen.tsx` - Convert MessagesPage
- `ConversationScreen.tsx` - Convert MessageThread
- `WishlistScreen.tsx` - Convert WishlistPage
- `SettingsScreen.tsx` - Convert SettingsPage
- `SubscriptionScreen.tsx` - Convert SubscriptionPlans
- `ItemDetailScreen.tsx` - Convert ItemModal to full screen
- `PublicCollectionScreen.tsx` - Convert PublicCollectionView

### 9. Update All Hooks for Mobile

#### useInventory.ts
- Replace any web-specific code
- Ensure photo upload works with mobile URIs
- Add offline queue using AsyncStorage

#### useOfflineStorage.ts
Replace IndexedDB with AsyncStorage:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveOfflineData = async (key: string, data: any) => {
  await AsyncStorage.setItem(key, JSON.stringify(data));
};

export const getOfflineData = async (key: string) => {
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};
```

#### useNetworkStatus.ts
```typescript
import NetInfo from '@react-native-community/netinfo';

export const useNetworkStatus = () => {
  // Monitor network status
  // Return isConnected, isInternetReachable
};
```

### 10. Styling Conversion
Replace ALL Tailwind classes with StyleSheet:

```typescript
// Before (Web):
<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">

// After (React Native):
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const { theme, isDark } = useTheme();

<View style={[
  styles.card,
  { backgroundColor: isDark ? theme.dark.card : theme.light.card }
]}>

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
```

### 11. Image Handling
Replace all `<img>` with `<Image>` from `expo-image`:

```typescript
import { Image } from 'expo-image';

<Image
  source={{ uri: item.photo_url }}
  style={styles.image}
  contentFit="cover"
  transition={200}
  placeholder={require('../assets/placeholder.png')}
/>
```

### 12. Deep Linking Configuration
Update `app.config.js` with your actual domains and test deep links:

```javascript
linking: {
  prefixes: ['myglasscase://', 'https://myglasscase.app'],
  config: {
    screens: {
      PublicCollection: 'share/:shareId',
      PublicWishlist: 'wishlist/share/:shareId',
      PublicWishlistAll: 'wishlist/share-all/:shareId',
    },
  },
},
```

## Installation & Running

### Prerequisites
```bash
npm install -g eas-cli
eas login
```

### Install Dependencies
```bash
npm install
```

### Run on Different Platforms
```bash
# Start dev server
npm start

# Then press:
# - w for web
# - i for iOS simulator (Mac only)
# - a for Android emulator
```

### Building for Production
```bash
# iOS
npm run build:ios

# Android
npm run build:android

# Both
npm run build:all
```

### Testing Push Notifications
Push notifications MUST be tested on physical devices. They don't work in simulators.

### Setting Up In-App Purchases

#### iOS (App Store Connect)
1. Create app in App Store Connect
2. Create auto-renewable subscriptions:
   - `com.myglasscase.starter` - Free
   - `com.myglasscase.pro` - $5/month
   - `com.myglasscase.collector` - $10/month
3. Create sandbox test accounts
4. Test purchases in TestFlight or sandbox

#### Android (Google Play Console)
1. Create app in Google Play Console
2. Create subscriptions matching iOS products
3. Add test users for license testing
4. Test with internal testing track

## Environment Variables
Update `.env` file (already exists) - no changes needed. The `app.config.js` reads from it.

## Important Notes

### Platform-Specific Code
Use Platform.select() when needed:
```typescript
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  text: {
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'Roboto' },
      web: { fontFamily: 'Inter' },
    }),
  },
});
```

### Web-Specific Features
Some features work differently on web:
- In-app purchases → Use Stripe web checkout
- Push notifications → Use browser notifications API
- Camera → Use HTML5 camera input

### Removed Files
You can safely remove these web-only files after full conversion:
- `index.html`
- `index.css`
- `vite.config.ts`
- `tailwind.config.js`
- `postcss.config.js`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `eslint.config.js`

## Testing Checklist

### Web
- [ ] Authentication flow
- [ ] Inventory CRUD operations
- [ ] Camera/image upload
- [ ] Marketplace listing
- [ ] Messaging
- [ ] Stripe subscription purchase
- [ ] Dark mode toggle
- [ ] Deep links open correctly

### iOS
- [ ] All web tests above
- [ ] Camera permission request
- [ ] Photo library access
- [ ] Push notifications receive/tap
- [ ] In-app purchase flow
- [ ] Subscription restoration
- [ ] Deep links open app
- [ ] App Store submission-ready

### Android
- [ ] All iOS tests above
- [ ] Back button behavior
- [ ] Android-specific permissions
- [ ] Google Play billing
- [ ] APK/AAB builds successfully

## Next Steps Priority

1. **Create Navigation** - Set up navigation structure (highest priority)
2. **Convert Auth Screens** - Get authentication working
3. **Create UI Components** - Build reusable components
4. **Convert Main Screens** - One screen at a time
5. **Implement Camera** - Image capture and upload
6. **Add Push Notifications** - Real-time alerts
7. **Implement IAP** - Subscription purchases
8. **Test Everything** - On all platforms
9. **Submit to Stores** - Deploy to App Store and Play Store

## Support & Documentation

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Supabase React Native](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [Expo Camera](https://docs.expo.dev/versions/latest/sdk/camera/)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [React Native Documentation](https://reactnative.dev/)

## Need Help?

If you encounter issues during conversion:
1. Check the Expo documentation for the specific API
2. Verify environment variables are loaded correctly
3. Test on different platforms to isolate platform-specific issues
4. Use React Native Debugger for debugging
5. Check console logs in Metro bundler

---

**Estimated Conversion Time**: 40-60 hours for complete conversion with testing
**Complexity**: Medium-High due to number of screens and features
**Priority**: Focus on core flows first (auth → inventory → marketplace)
