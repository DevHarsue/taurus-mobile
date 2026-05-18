import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@hooks/useAuth';
import { LoadingSpinner } from '@components/LoadingSpinner';
import LoginScreen from '@features/auth/screens/LoginScreen';
import SplashScreen from '@features/splash/screens/SplashScreen';
import AdminTabs from '@navigation/AdminTabs';
import MemberShell from '@navigation/MemberShell';
import type { AuthStackParamList } from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
    </AuthStack.Navigator>
  );
}

export function RootNavigator() {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const [splashDone, setSplashDone] = useState(false);

  if (!splashDone) return <SplashScreen onFinish={() => setSplashDone(true)} />;
  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <AuthStackNavigator />;

  return isAdmin ? <AdminTabs /> : <MemberShell />;
}
