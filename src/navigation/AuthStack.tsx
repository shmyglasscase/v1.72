import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="SignIn" component={() => null} />
      <Stack.Screen name="SignUp" component={() => null} />
      <Stack.Screen name="ResetPassword" component={() => null} />
    </Stack.Navigator>
  );
}
