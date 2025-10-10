import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';

import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';

const RootStack = createNativeStackNavigator();

const linking = {
  prefixes: ['myglasscase://', 'https://myglasscase.app', 'https://*.myglasscase.app'],
  config: {
    screens: {
      Main: {
        screens: {
          Home: 'dashboard',
          Inventory: 'inventory',
          Marketplace: 'marketplace',
          Messages: 'messages',
          Wishlist: 'wishlist',
          Settings: 'settings',
        },
      },
      PublicCollection: 'share/:shareId',
      PublicWishlist: 'wishlist/share/:shareId',
      PublicWishlistAll: 'wishlist/share-all/:shareId',
    },
  },
};

export function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer linking={linking}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <RootStack.Screen name="Main" component={MainTabs} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthStack} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
