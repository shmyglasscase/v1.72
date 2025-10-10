# MyGlassCase - Expo React Native Implementation Guide

## Project Status: Foundation Complete ✅

The core infrastructure for converting your React web app to Expo has been established. This guide will help you complete the conversion.

## What's Already Done

### ✅ Infrastructure (100% Complete)
1. **Expo Configuration Files**
   - `app.json` - Main Expo configuration
   - `app.config.js` - Dynamic config with environment variables
   - `eas.json` - Build configuration for iOS, Android, Web
   - `babel.config.js` - Module resolver and presets
   - `tsconfig.json` - TypeScript for React Native

2. **Dependencies**
   - `package.json` updated with all Expo packages
   - React Navigation for routing
   - Expo Camera, Image Picker, Notifications
   - AsyncStorage, SecureStore, NetInfo
   - Stripe React Native, Ably
   - All necessary native modules

3. **Core Libraries**
   - `src/lib/supabase.ts` - Updated with SecureStore adapter (mobile + web)
   - `src/lib/ably.ts` - Updated for Expo Constants
   - Cross-platform storage handling

4. **Theme System**
   - `src/theme/colors.ts` - Complete color palette (light + dark)
   - `src/theme/spacing.ts` - Spacing, typography, shadows
   - `src/theme/index.ts` - Unified theme export

5. **Navigation Structure**
   - `src/navigation/index.tsx` - Main navigation container
   - `src/navigation/AuthStack.tsx` - Auth flow navigator
   - `src/navigation/MainTabs.tsx` - Bottom tab navigator
   - Deep linking configuration

6. **Main Entry Point**
   - `App.tsx` - Root component with all providers

## Your Next Steps

### Phase 1: Core Components (Week 1)

#### 1.1 Create UI Component Library
Create these in `src/components/ui/`:

**Button.tsx**
```typescript
import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  loading,
  disabled,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && { backgroundColor: theme.primary },
        variant === 'secondary' && { backgroundColor: isDark ? theme.dark.secondary : theme.light.secondary },
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
});
```

**Card.tsx**
```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { shadows } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: any;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  const { theme, isDark } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? theme.dark.card : theme.light.card,
          borderColor: isDark ? theme.dark.cardBorder : theme.light.cardBorder,
        },
        shadows.md,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
});
```

**Input.tsx**
```typescript
import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  error,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: isDark ? theme.dark.text.primary : theme.light.text.primary }]}>
          {label}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={isDark ? theme.dark.input.placeholder : theme.light.input.placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={[
          styles.input,
          {
            backgroundColor: isDark ? theme.dark.input.background : theme.light.input.background,
            borderColor: error ? theme.error : (isDark ? theme.dark.input.border : theme.light.input.border),
            color: isDark ? theme.dark.input.text : theme.light.input.text,
          },
        ]}
      />
      {error && <Text style={[styles.error, { color: theme.error }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 48,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
});
```

Create similar components for:
- `Modal.tsx`
- `LoadingSpinner.tsx`
- `Toast.tsx`
- `EmptyState.tsx`

#### 1.2 Update ThemeContext
Modify `src/contexts/ThemeContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, Theme } from '../theme';

interface ThemeContextType {
  theme: typeof lightTheme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadTheme();
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      handleSystemThemeChange(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  const loadTheme = async () => {
    const saved = await AsyncStorage.getItem('theme');
    if (saved) {
      setIsDark(saved === 'dark');
    } else {
      const systemTheme = Appearance.getColorScheme();
      setIsDark(systemTheme === 'dark');
    }
  };

  const handleSystemThemeChange = async (colorScheme: ColorSchemeName) => {
    const saved = await AsyncStorage.getItem('theme');
    if (!saved) {
      setIsDark(colorScheme === 'dark');
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### Phase 2: Authentication Screens (Week 1-2)

#### 2.1 Sign In Screen
Create `src/screens/auth/SignInScreen.tsx`:

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useTheme } from '../../contexts/ThemeContext';

export const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuth();
  const { theme, isDark } = useTheme();

  const handleSignIn = async () => {
    setLoading(true);
    setError('');

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: isDark ? theme.dark.background : theme.light.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: isDark ? theme.dark.text.primary : theme.light.text.primary }]}>
          Welcome Back
        </Text>

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          autoCapitalize="none"
        />

        {error && <Text style={[styles.error, { color: theme.error }]}>{error}</Text>}

        <Button
          title="Sign In"
          onPress={handleSignIn}
          loading={loading}
        />

        <Button
          title="Create Account"
          onPress={() => navigation.navigate('SignUp')}
          variant="secondary"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  error: {
    marginBottom: 16,
    textAlign: 'center',
  },
});
```

### Phase 3: Main Screens (Week 2-3)

Follow similar pattern for:
- `src/screens/HomeScreen.tsx`
- `src/screens/inventory/InventoryScreen.tsx`
- `src/screens/marketplace/MarketplaceScreen.tsx`
- `src/screens/messages/MessagesScreen.tsx`
- `src/screens/wishlist/WishlistScreen.tsx`
- `src/screens/settings/SettingsScreen.tsx`

### Phase 4: Services (Week 3)

#### 4.1 Camera Service
Create `src/services/imageService.ts`:

```typescript
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Alert, Platform } from 'react-native';

export const requestCameraPermissions = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
};

export const requestMediaLibraryPermissions = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
};

export const takePhoto = async () => {
  const hasPermission = await requestCameraPermissions();
  if (!hasPermission) {
    Alert.alert('Permission Denied', 'Camera permission is required');
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled) {
    return await compressImage(result.assets[0].uri);
  }
  return null;
};

export const pickImage = async () => {
  const hasPermission = await requestMediaLibraryPermissions();
  if (!hasPermission) {
    Alert.alert('Permission Denied', 'Photo library permission is required');
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled) {
    return await compressImage(result.assets[0].uri);
  }
  return null;
};

export const compressImage = async (uri: string) => {
  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1024 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  return manipResult.uri;
};
```

#### 4.2 Notification Service
Create `src/services/notificationService.ts`:

```typescript
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForPushNotifications = async (userId: string) => {
  if (Platform.OS === 'web') {
    console.log('Push notifications not available on web');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  await supabase
    .from('profiles')
    .update({ push_token: token })
    .eq('id', userId);

  return token;
};

export const sendPushNotification = async (
  expoPushToken: string,
  title: string,
  body: string,
  data?: any
) => {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data,
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
};
```

### Phase 5: Testing & Deployment (Week 4)

1. **Test on Each Platform**
   ```bash
   # Web
   npm start -- --web

   # iOS Simulator
   npm start -- --ios

   # Android Emulator
   npm start -- --android
   ```

2. **Build Preview Builds**
   ```bash
   eas build --platform ios --profile preview
   eas build --platform android --profile preview
   ```

3. **Test on Physical Devices**
   - Install preview build
   - Test camera
   - Test notifications
   - Test IAP (sandbox mode)

4. **Production Builds**
   ```bash
   eas build --platform all --profile production
   ```

## Quick Reference Commands

```bash
# Start development server
npm start

# Run on specific platform
npm run web
npm run ios
npm run android

# Build for production
npm run build:ios
npm run build:android
npm run build:all

# Update OTA (Over-The-Air)
eas update --branch production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## Common Issues & Solutions

### Issue: Metro bundler errors
**Solution**: Clear cache
```bash
npx expo start --clear
```

### Issue: iOS simulator not launching
**Solution**: Reset simulator
```bash
xcrun simctl shutdown all
xcrun simctl erase all
```

### Issue: Android build fails
**Solution**: Check Java version
```bash
java --version  # Should be Java 11
```

### Issue: Environment variables not loading
**Solution**: Restart Expo server after changing `.env`

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation Docs](https://reactnavigation.org/docs/getting-started)
- [Supabase + Expo Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)

## Estimated Timeline

- **Week 1**: UI Components + Auth Screens (20-30 hours)
- **Week 2**: Main Screens conversion (25-35 hours)
- **Week 3**: Camera, Notifications, IAP (15-20 hours)
- **Week 4**: Testing + Deployment (10-15 hours)

**Total**: 70-100 hours for complete conversion

## Success Criteria

✅ App runs on iOS, Android, and Web
✅ All authentication flows work
✅ Inventory CRUD operations functional
✅ Camera/image upload working
✅ Push notifications functioning
✅ IAP working on iOS/Android
✅ Stripe working on Web
✅ Dark mode toggle functional
✅ All screens responsive
✅ Deep links working
✅ Ready for store submission

---

**You're 30% of the way there! The foundation is solid. Now it's time to build the UI layer.**
