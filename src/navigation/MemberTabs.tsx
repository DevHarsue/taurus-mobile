import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { User, QrCode, History, type LucideIcon } from 'lucide-react-native';
import MyProfileScreen from '@features/profile/screens/MyProfileScreen';
import MyQRScreen from '@features/profile/screens/MyQRScreen';
import RenewalHistoryScreen from '@features/profile/screens/RenewalHistoryScreen';
import SettingsScreen from '@features/settings/screens/SettingsScreen';
import { colors } from '@theme/index';
import type {
  MemberTabsParamList,
  MemberProfileStackParamList,
  MemberQRStackParamList,
  MemberHistoryStackParamList,
} from './types';

const Tabs = createBottomTabNavigator<MemberTabsParamList>();

function TabIcon({ Icon, focused }: { Icon: LucideIcon; focused: boolean }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <Icon size={22} color={focused ? colors.navActive : colors.navInactive} strokeWidth={focused ? 2.4 : 2} />
    </View>
  );
}

const ProfileStack = createNativeStackNavigator<MemberProfileStackParamList>();
function MemberProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileHome" component={MyProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
}

const QRStack = createNativeStackNavigator<MemberQRStackParamList>();
function MemberQRStackNavigator() {
  return (
    <QRStack.Navigator screenOptions={{ headerShown: false }}>
      <QRStack.Screen name="QRHome" component={MyQRScreen} />
      <QRStack.Screen name="Settings" component={SettingsScreen} />
    </QRStack.Navigator>
  );
}

const HistoryStack = createNativeStackNavigator<MemberHistoryStackParamList>();
function MemberHistoryStackNavigator() {
  return (
    <HistoryStack.Navigator screenOptions={{ headerShown: false }}>
      <HistoryStack.Screen name="HistoryHome" component={RenewalHistoryScreen} />
      <HistoryStack.Screen name="Settings" component={SettingsScreen} />
    </HistoryStack.Navigator>
  );
}

export default function MemberTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            height: 60 + insets.bottom,
            paddingBottom: Math.max(insets.bottom, 8),
          },
        ],
        tabBarShowLabel: false,
        sceneStyle: { backgroundColor: colors.white },
      }}
    >
      <Tabs.Screen
        name="MyProfile"
        component={MemberProfileStackNavigator}
        options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={User} focused={focused} /> }}
      />
      <Tabs.Screen
        name="MyQR"
        component={MemberQRStackNavigator}
        options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={QrCode} focused={focused} /> }}
      />
      <Tabs.Screen
        name="RenewalHistory"
        component={MemberHistoryStackNavigator}
        options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={History} focused={focused} /> }}
      />
    </Tabs.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.navBarBg,
    borderTopWidth: 0,
    paddingTop: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  tabIconActive: {
    backgroundColor: colors.navBarActiveBg,
  },
});
