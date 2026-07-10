import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GpOsFilterScreen } from '../../screens/gpOs/GpOsFilterScreen';
import { GpOsPartyListScreen } from '../../screens/gpOs/GpOsPartyListScreen';
import { GpOsPartyDetailScreen } from '../../screens/gpOs/GpOsPartyDetailScreen';
import type { GpOsStackParamList } from '../../types';

const Stack = createNativeStackNavigator<GpOsStackParamList>();

export const GpOsStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="GpOsFilter" component={GpOsFilterScreen} />
    <Stack.Screen name="GpOsPartyList" component={GpOsPartyListScreen} />
    <Stack.Screen name="GpOsPartyDetail" component={GpOsPartyDetailScreen} />
  </Stack.Navigator>
);
