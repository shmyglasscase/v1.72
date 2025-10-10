import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../contexts/ThemeContext';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

export function MainTabs() {
  const { isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? colors.gray[800] : colors.white,
          borderTopColor: isDark ? colors.gray[700] : colors.gray[200],
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          height: Platform.OS === 'ios' ? 85 : 60,
        },
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: isDark ? colors.gray[400] : colors.gray[600],
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={() => null}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Collection"
        component={() => null}
        options={{
          tabBarLabel: 'Collection',
          tabBarIcon: ({ color, size }) => (
            <Icon name="package" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Exchange"
        component={() => null}
        options={{
          tabBarLabel: 'Exchange',
          tabBarIcon: ({ color, size }) => (
            <Icon name="shopping-bag" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={() => null}
        options={{
          tabBarLabel: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <Icon name="message-circle" size={size} color={color} />
          ),
          tabBarBadge: undefined,
        }}
      />
      <Tab.Screen
        name="Wishlist"
        component={() => null}
        options={{
          tabBarLabel: 'Wishlist',
          tabBarIcon: ({ color, size }) => (
            <Icon name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={() => null}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Icon name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
