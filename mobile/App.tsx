import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  StatusBar as RNStatusBar,
  Platform,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { AppNavigator } from './src/navigation/AppNavigator';

function MainApp() {
  const { isDark, theme } = useTheme();

  return (
    <SafeAreaProvider>
      {/* Full-screen native StatusBar with edge-to-edge transparency and dynamic theme contrast */}
      <RNStatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={true}
        animated={true}
      />
      {/* Expo StatusBar for cross-platform reactivity */}
      <ExpoStatusBar
        style={isDark ? 'light' : 'dark'}
        animated={true}
      />
      <AuthProvider>
        <NotificationProvider>
          <AppNavigator />
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'Chirp': PlusJakartaSans_400Regular,
    'Chirp-Regular': PlusJakartaSans_400Regular,
    'Chirp-Medium': PlusJakartaSans_500Medium,
    'Chirp-SemiBold': PlusJakartaSans_600SemiBold,
    'Chirp-Bold': PlusJakartaSans_700Bold,
    'Chirp-Heavy': PlusJakartaSans_800ExtraBold,
    'PlusJakartaSans-Regular': PlusJakartaSans_400Regular,
    'PlusJakartaSans-Medium': PlusJakartaSans_500Medium,
    'PlusJakartaSans-SemiBold': PlusJakartaSans_600SemiBold,
    'PlusJakartaSans-Bold': PlusJakartaSans_700Bold,
    'PlusJakartaSans-ExtraBold': PlusJakartaSans_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34D399" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#05130A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
