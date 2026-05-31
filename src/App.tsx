import React from 'react';
import { ActivityIndicator, StatusBar, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '@context/AuthContext';
import { ThemeProvider } from '@context/ThemeContext';
import { ToastProvider } from '@context/ToastContext';
import { ConfirmModalProvider } from '@context/ConfirmModalContext';
import { RootNavigator } from '@navigation/RootNavigator';
import { navigationRef } from '@navigation/navigationRef';
import { useAppFonts } from '@theme/fonts';
import { useTheme } from '@hooks/useTheme';
import { useDeepLinks } from '@hooks/useDeepLinks';

/** StatusBar que sigue el tema activo (claro/oscuro). */
function ThemedStatusBar() {
  const { colorScheme } = useTheme();
  return (
    <StatusBar
      barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      backgroundColor="transparent"
      translucent
    />
  );
}

/** Monta el manejador de deep links (necesita Auth + Toast + navigationRef). */
function DeepLinkHandler() {
  useDeepLinks();
  return null;
}

export default function App() {
  const fontsLoaded = useAppFonts();

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <ActivityIndicator size="large" color="#930303" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <ConfirmModalProvider>
                <ThemedStatusBar />
                <NavigationContainer ref={navigationRef}>
                  <RootNavigator />
                </NavigationContainer>
                <DeepLinkHandler />
              </ConfirmModalProvider>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
