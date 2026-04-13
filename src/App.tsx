import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from '@context/AuthContext';
import { ThemeProvider } from '@context/ThemeContext';
import { RootNavigator } from '@navigation/RootNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
}