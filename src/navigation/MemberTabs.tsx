import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { User, QrCode, History, type LucideIcon } from 'lucide-react-native';
import MyProfileScreen from '@features/profile/screens/MyProfileScreen';
import MyQRScreen from '@features/profile/screens/MyQRScreen';
import RenewalHistoryScreen from '@features/profile/screens/RenewalHistoryScreen';
import { colors } from '@theme/index';
import type { MemberTabsParamList } from './types';

const Tabs = createBottomTabNavigator<MemberTabsParamList>();

function TabIcon({ Icon, focused }: { Icon: LucideIcon; focused: boolean }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <Icon size={22} color={focused ? colors.navActive : colors.navInactive} strokeWidth={focused ? 2.4 : 2} />
    </View>
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
        component={MyProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={User} focused={focused} /> }}
      />
      <Tabs.Screen
        name="MyQR"
        component={MyQRScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={QrCode} focused={focused} /> }}
      />
      <Tabs.Screen
        name="RenewalHistory"
        component={RenewalHistoryScreen}
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
