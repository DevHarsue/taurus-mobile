import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '@features/dashboard/screens/DashboardScreen';
import MembersListScreen from '@features/members/screens/MembersListScreen';
import MemberDetailScreen from '@features/members/screens/MemberDetailScreen';
import CreateMemberScreen from '@features/members/screens/CreateMemberScreen';
import RenewMembershipScreen from '@features/members/screens/RenewMembershipScreen';
import PlansScreen from '@features/plans/screens/PlansScreen';
import QRScannerScreen from '@features/scanner/screens/QRScannerScreen';
import MyProfileScreen from '@features/profile/screens/MyProfileScreen';
import { colors, typography } from '@theme/index';
import type {
  AdminTabsParamList,
  MembersStackParamList,
  PlansStackParamList,
  DashboardStackParamList,
  ProfileStackParamList,
  QRScannerStackParamList,
} from './types';

const Tabs = createBottomTabNavigator<AdminTabsParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

const MembersStack = createNativeStackNavigator<MembersStackParamList>();
function MembersStackNavigator() {
  return (
    <MembersStack.Navigator screenOptions={{ headerShown: false }}>
      <MembersStack.Screen name="MembersList" component={MembersListScreen} />
      <MembersStack.Screen name="MemberDetail" component={MemberDetailScreen} />
      <MembersStack.Screen name="CreateMember" component={CreateMemberScreen} />
      <MembersStack.Screen name="RenewMembership" component={RenewMembershipScreen} />
    </MembersStack.Navigator>
  );
}

const PlansStack = createNativeStackNavigator<PlansStackParamList>();
function PlansStackNavigator() {
  return (
    <PlansStack.Navigator screenOptions={{ headerShown: false }}>
      <PlansStack.Screen name="PlansHome" component={PlansScreen} />
    </PlansStack.Navigator>
  );
}

const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
function DashboardStackNavigator() {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStack.Screen name="DashboardHome" component={DashboardScreen} />
    </DashboardStack.Navigator>
  );
}

const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileHome" component={MyProfileScreen} />
    </ProfileStack.Navigator>
  );
}

const QRStack = createNativeStackNavigator<QRScannerStackParamList>();
function QRStackNavigator() {
  return (
    <QRStack.Navigator screenOptions={{ headerShown: false }}>
      <QRStack.Screen name="QRScannerHome" component={QRScannerScreen} />
    </QRStack.Navigator>
  );
}

export default function AdminTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen name="Dashboard" component={DashboardStackNavigator} options={{ tabBarIcon: ({ focused }) => <TabIcon label="DASHBOARD" focused={focused} /> }} />
      <Tabs.Screen name="Members" component={MembersStackNavigator} options={{ tabBarIcon: ({ focused }) => <TabIcon label="MEMBERS" focused={focused} /> }} />
      <Tabs.Screen name="Plans" component={PlansStackNavigator} options={{ tabBarIcon: ({ focused }) => <TabIcon label="PLANS" focused={focused} /> }} />
      <Tabs.Screen name="QRScanner" component={QRStackNavigator} options={{ tabBarIcon: ({ focused }) => <TabIcon label="QR" focused={focused} /> }} />
      <Tabs.Screen name="Profile" component={ProfileStackNavigator} options={{ tabBarIcon: ({ focused }) => <TabIcon label="PROFILE" focused={focused} /> }} />
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
    paddingHorizontal: 10,
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
