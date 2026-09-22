import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MachineWiseComingSoonScreen } from '../../screens/machineWise/MachineWiseComingSoonScreen';
import type { MachineWiseStackParamList } from '../../types';

const Stack = createNativeStackNavigator<MachineWiseStackParamList>();

/**
 * Machine Wise is temporarily disabled on the frontend.
 * Only the Coming Soon screen is registered so filter/report pages cannot open.
 */
export const MachineWiseStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MachineWiseFilter" component={MachineWiseComingSoonScreen} />
  </Stack.Navigator>
);
