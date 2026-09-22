import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GpRegisterFilterScreen } from '../../screens/gpRegister/GpRegisterFilterScreen';
import { GpRegisterScreen } from '../../screens/gpRegister/GpRegisterScreen';
import { GpRegisterDetailScreen } from '../../screens/gpRegister/GpRegisterDetailScreen';
import type { GpRegisterStackParamList } from '../../types';

const Stack = createNativeStackNavigator<GpRegisterStackParamList>();

export const GpRegisterStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="GpRegisterFilter" component={GpRegisterFilterScreen} />
    <Stack.Screen name="GpRegister" component={GpRegisterScreen} />
    <Stack.Screen name="GpRegisterDetail" component={GpRegisterDetailScreen} />
  </Stack.Navigator>
);
