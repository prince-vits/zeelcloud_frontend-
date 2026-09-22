import React from 'react';
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ZIcon as Icon } from '../components/ZIcon';
import { Colors, Typography } from '../theme';

// Shared bottom-tab styling — white bar, dark indigo active, light indigo idle.
export const useBaseTabScreenOptions = (): BottomTabNavigationOptions => {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom > 0 ? insets.bottom : 10;
  return {
    headerShown: false,
    tabBarActiveTintColor: Colors.primary,
    tabBarInactiveTintColor: Colors.primaryLight,
    tabBarStyle: {
      backgroundColor: Colors.surface,
      borderTopColor: Colors.border,
      borderTopWidth: 1,
      height: 56 + bottomInset,
      paddingTop: 8,
      paddingBottom: bottomInset,
    },
    tabBarLabelStyle: {
      fontSize: 11,
      fontWeight: Typography.fontWeights.medium,
      marginTop: 2,
    },
  };
};

export const tabIcon =
  (name: string) =>
  ({ color, size }: { color: string; size: number }) =>
    <Icon name={name} size={size} color={color} />;
