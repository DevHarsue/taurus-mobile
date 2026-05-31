import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LayoutGrid, Users, Tag, ScanLine, User, type LucideIcon } from 'lucide-react-native';
import DashboardScreen from '@features/dashboard/screens/DashboardScreen';
import MembersListScreen from '@features/members/screens/MembersListScreen';
import MemberDetailScreen from '@features/members/screens/MemberDetailScreen';
import CreateMemberScreen from '@features/members/screens/CreateMemberScreen';
import RenewMembershipScreen from '@features/members/screens/RenewMembershipScreen';
import EditMemberScreen from '@features/members/screens/EditMemberScreen';
import FingerprintEnrollScreen from '@features/members/screens/FingerprintEnrollScreen';
import PlansScreen from '@features/plans/screens/PlansScreen';
import CreatePlanScreen from '@features/plans/screens/CreatePlanScreen';
import EditPlanScreen from '@features/plans/screens/EditPlanScreen';
import QRScannerScreen from '@features/scanner/screens/QRScannerScreen';
import MyProfileScreen from '@features/profile/screens/MyProfileScreen';
import SettingsScreen from '@features/settings/screens/SettingsScreen';
import AccessLogScreen from '@features/dashboard/screens/AccessLogScreen';
import DevicesScreen from '@features/dashboard/screens/DevicesScreen';
import AuditTrailScreen from '@features/dashboard/screens/AuditTrailScreen';
import AuditDetailScreen from '@features/dashboard/screens/AuditDetailScreen';
import { type Colors } from '@theme/index';
import { useTheme } from '@hooks/useTheme';
import type {
  AdminTabsParamList,
  MembersStackParamList,
  PlansStackParamList,
  DashboardStackParamList,
  ProfileStackParamList,
  QRScannerStackParamList,
} from './types';

const Tabs = createBottomTabNavigator<AdminTabsParamList>();

function TabIcon({ Icon, focused }: { Icon: LucideIcon; focused: boolean }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <Icon size={22} color={focused ? colors.navActive : colors.navInactive} strokeWidth={focused ? 2.4 : 2} />
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
      <MembersStack.Screen name="EditMember" component={EditMemberScreen} />
      <MembersStack.Screen name="FingerprintEnroll" component={FingerprintEnrollScreen} />
    </MembersStack.Navigator>
  );
}

const PlansStack = createNativeStackNavigator<PlansStackParamList>();
function PlansStackNavigator() {
  return (
    <PlansStack.Navigator screenOptions={{ headerShown: false }}>
      <PlansStack.Screen name="PlansHome" component={PlansScreen} />
      <PlansStack.Screen name="CreatePlan" component={CreatePlanScreen} />
      <PlansStack.Screen name="EditPlan" component={EditPlanScreen} />
    </PlansStack.Navigator>
  );
}

const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
function DashboardStackNavigator() {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStack.Screen name="DashboardHome" component={DashboardScreen} />
      <DashboardStack.Screen name="AccessLog" component={AccessLogScreen} />
      <DashboardStack.Screen name="Devices" component={DevicesScreen} />
      <DashboardStack.Screen name="AuditTrail" component={AuditTrailScreen} />
      <DashboardStack.Screen name="AuditDetail" component={AuditDetailScreen} />
    </DashboardStack.Navigator>
  );
}

const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileHome" component={MyProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
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
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="Dashboard" component={DashboardStackNavigator} options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={LayoutGrid} focused={focused} /> }} />
      <Tabs.Screen name="Members" component={MembersStackNavigator} options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={Users} focused={focused} /> }} />
      <Tabs.Screen name="Plans" component={PlansStackNavigator} options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={Tag} focused={focused} /> }} />
      <Tabs.Screen name="QRScanner" component={QRStackNavigator} options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={ScanLine} focused={focused} /> }} />
      <Tabs.Screen name="Profile" component={ProfileStackNavigator} options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={User} focused={focused} /> }} />
    </Tabs.Navigator>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
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
