import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthForm } from '../components/auth/AuthForm';

export function SignInScreen() {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <AuthForm mode={mode} onModeChange={setMode} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
