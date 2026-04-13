import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MyProfileScreen from '@features/profile/screens/MyProfileScreen';
import MyQRScreen from '@features/profile/screens/MyQRScreen';
import RenewalHistoryScreen from '@features/profile/screens/RenewalHistoryScreen';
import type { MemberTabsParamList } from './types';

const Tabs = createBottomTabNavigator<MemberTabsParamList>();

export default function MemberTabs() {
  return (
    <Tabs.Navigator>
      <Tabs.Screen name="MyProfile" component={MyProfileScreen} options={{ title: 'Mi perfil' }} />
      <Tabs.Screen name="MyQR" component={MyQRScreen} options={{ title: 'Mi QR' }} />
      <Tabs.Screen name="RenewalHistory" component={RenewalHistoryScreen} options={{ title: 'Historial' }} />
    </Tabs.Navigator>
  );
}