import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '@features/dashboard/screens/DashboardScreen';
import MembersListScreen from '@features/members/screens/MembersListScreen';
import MemberDetailScreen from '@features/members/screens/MemberDetailScreen';
import CreateMemberScreen from '@features/members/screens/CreateMemberScreen';
import PlansScreen from '@features/plans/screens/PlansScreen';
import MyProfileScreen from '@features/profile/screens/MyProfileScreen';
import type {
  AdminTabsParamList,
  MembersStackParamList,
  PlansStackParamList,
  DashboardStackParamList,
  ProfileStackParamList
} from './types';

const Tabs = createBottomTabNavigator<AdminTabsParamList>();

const MembersStack = createNativeStackNavigator<MembersStackParamList>();
function MembersStackNavigator() {
  return (
    <MembersStack.Navigator>
      <MembersStack.Screen name="MembersList" component={MembersListScreen} options={{ title: 'Miembros' }} />
      <MembersStack.Screen name="MemberDetail" component={MemberDetailScreen} options={{ title: 'Detalle' }} />
      <MembersStack.Screen name="CreateMember" component={CreateMemberScreen} options={{ title: 'Crear' }} />
    </MembersStack.Navigator>
  );
}

const PlansStack = createNativeStackNavigator<PlansStackParamList>();
function PlansStackNavigator() {
  return (
    <PlansStack.Navigator>
      <PlansStack.Screen name="PlansHome" component={PlansScreen} options={{ title: 'Planes' }} />
    </PlansStack.Navigator>
  );
}

const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
function DashboardStackNavigator() {
  return (
    <DashboardStack.Navigator>
      <DashboardStack.Screen name="DashboardHome" component={DashboardScreen} options={{ title: 'Dashboard' }} />
    </DashboardStack.Navigator>
  );
}

const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="ProfileHome" component={MyProfileScreen} options={{ title: 'Perfil' }} />
    </ProfileStack.Navigator>
  );
}

export default function AdminTabs() {
  return (
    <Tabs.Navigator>
      <Tabs.Screen name="Dashboard" component={DashboardStackNavigator} options={{ title: 'Dashboard', headerShown: false }} />
      <Tabs.Screen name="Members" component={MembersStackNavigator} options={{ title: 'Miembros', headerShown: false }} />
      <Tabs.Screen name="Plans" component={PlansStackNavigator} options={{ title: 'Planes', headerShown: false }} />
      <Tabs.Screen name="Profile" component={ProfileStackNavigator} options={{ title: 'Perfil', headerShown: false }} />
    </Tabs.Navigator>
  );
}