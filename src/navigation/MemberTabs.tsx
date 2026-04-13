import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MyProfileScreen from '@features/profile/screens/MyProfileScreen';
import MyQRScreen from '@features/profile/screens/MyQRScreen';
import RenewalHistoryScreen from '@features/profile/screens/RenewalHistoryScreen';
import { colors, typography } from '@theme/index';
import type { MemberTabsParamList } from './types';

const Tabs = createBottomTabNavigator<MemberTabsParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function MemberTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="MyProfile"
        component={MyProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="PERFIL" focused={focused} /> }}
      />
      <Tabs.Screen
        name="MyQR"
        component={MyQRScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="QR" focused={focused} /> }}
      />
      <Tabs.Screen
        name="RenewalHistory"
        component={RenewalHistoryScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="HISTORIAL" focused={focused} /> }}
      />
    </Tabs.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.navBarBg,
    height: 80,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 0,
    position: 'absolute',
    paddingTop: 12,
    paddingBottom: 24,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabIconActive: {
    backgroundColor: colors.navBarActiveBg,
  },
  tabLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    letterSpacing: typography.caption.letterSpacing,
    color: colors.navInactive,
    textTransform: 'uppercase',
  },
  tabLabelActive: {
    color: colors.navActive,
  },
});
