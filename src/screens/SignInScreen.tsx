import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Placeholder - will be converted from AuthForm component
// import { AuthForm } from '../components/auth/AuthForm';

export function SignInScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* TODO: Convert AuthForm to React Native */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
});
