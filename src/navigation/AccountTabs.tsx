import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CompaniesScreen } from '../screens/account/CompaniesScreen';
import { SettingsScreen } from '../screens/account/SettingsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SubUserStack } from './SubUserStack';
import { useBaseTabScreenOptions, tabIcon } from './tabConfig';
import { useAuthStore } from '../store/authStore';
import type { AccountTabParamList } from '../types';

const Tab = createBottomTabNavigator<AccountTabParamList>();

export const AccountTabs: React.FC = () => {
  const { user } = useAuthStore();
  const screenOptions = useBaseTabScreenOptions();
  return (
  <Tab.Navigator screenOptions={screenOptions}>
    <Tab.Screen
      name="Companies"
      component={CompaniesScreen}
      options={{ tabBarLabel: 'Companies', tabBarIcon: tabIcon('office-building-outline') }}
    />
    {!user?.isSubuser && (
      <Tab.Screen
        name="SubUsers"
        component={SubUserStack}
        options={{ tabBarLabel: 'Sub Users', tabBarIcon: tabIcon('account-group-outline') }}
      />
    )}
    <Tab.Screen
      name="ProfileTab"
      component={ProfileScreen}
      options={{ tabBarLabel: 'Profile', tabBarIcon: tabIcon('account-outline') }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ tabBarLabel: 'Settings', tabBarIcon: tabIcon('cog-outline') }}
    />
  </Tab.Navigator>
  );
};
