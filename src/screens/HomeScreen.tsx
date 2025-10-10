import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

export function HomeScreen() {
  const { isDark } = useTheme();
  const styles = createStyles(isDark);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Welcome to MyGlassCase</Text>
        <Text style={styles.description}>
          This screen will display your collection overview, recent activity, and quick stats.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#111827' : '#F9FAFB',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: isDark ? '#FFFFFF' : '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: isDark ? '#D1D5DB' : '#6B7280',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: isDark ? '#9CA3AF' : '#6B7280',
    lineHeight: 20,
  },
});
