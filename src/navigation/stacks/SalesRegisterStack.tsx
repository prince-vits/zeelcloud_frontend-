import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SalesRegisterScreen } from '../../screens/salesRegister/SalesRegisterScreen';
import { SalesRegisterDetailScreen } from '../../screens/salesRegister/SalesRegisterDetailScreen';
import type { SalesRegisterStackParamList } from '../../types';

const Stack = createNativeStackNavigator<SalesRegisterStackParamList>();

export const SalesRegisterStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SalesRegister" component={SalesRegisterScreen} />
    <Stack.Screen name="SalesRegisterDetail" component={SalesRegisterDetailScreen} />
  </Stack.Navigator>
);
