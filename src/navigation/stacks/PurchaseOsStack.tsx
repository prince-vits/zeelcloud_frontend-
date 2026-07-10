import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PurchaseOsFilterScreen } from '../../screens/purchaseOs/PurchaseOsFilterScreen';
import { PurchaseOsPartyListScreen } from '../../screens/purchaseOs/PurchaseOsPartyListScreen';
import { PurchaseOsPartyDetailScreen } from '../../screens/purchaseOs/PurchaseOsPartyDetailScreen';
import type { PurchaseOsStackParamList } from '../../types';

const Stack = createNativeStackNavigator<PurchaseOsStackParamList>();

export const PurchaseOsStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PurchaseOsFilter" component={PurchaseOsFilterScreen} />
    <Stack.Screen name="PurchaseOsPartyList" component={PurchaseOsPartyListScreen} />
    <Stack.Screen name="PurchaseOsPartyDetail" component={PurchaseOsPartyDetailScreen} />
  </Stack.Navigator>
);
