import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@hooks/useAuth';
import { LoadingSpinner } from '@components/LoadingSpinner';
import LoginScreen from '@features/auth/screens/LoginScreen';
import AdminTabs from '@navigation/AdminTabs';
import MemberTabs from '@navigation/MemberTabs';
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

  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <AuthStackNavigator />;

  return isAdmin ? <AdminTabs /> : <MemberTabs />;
}