import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PurchaseRegisterScreen } from '../../screens/purchaseRegister/PurchaseRegisterScreen';
import { PurchaseRegisterDetailScreen } from '../../screens/purchaseRegister/PurchaseRegisterDetailScreen';
import type { PurchaseRegisterStackParamList } from '../../types';

const Stack = createNativeStackNavigator<PurchaseRegisterStackParamList>();

export const PurchaseRegisterStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PurchaseRegister" component={PurchaseRegisterScreen} />
    <Stack.Screen name="PurchaseRegisterDetail" component={PurchaseRegisterDetailScreen} />
  </Stack.Navigator>
);
