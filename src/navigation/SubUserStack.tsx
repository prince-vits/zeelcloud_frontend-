import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SubUserListScreen } from '../screens/subusers/SubUserListScreen';
import { CreateSubUserScreen } from '../screens/subusers/CreateSubUserScreen';
import { EditSubUserScreen } from '../screens/subusers/EditSubUserScreen';
import { SubUserDetailScreen } from '../screens/subusers/SubUserDetailScreen';
import type { SubUserStackParamList } from '../types';

const Stack = createNativeStackNavigator<SubUserStackParamList>();

export const SubUserStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SubUserList" component={SubUserListScreen} />
    <Stack.Screen name="CreateSubUser" component={CreateSubUserScreen} />
    <Stack.Screen name="EditSubUser" component={EditSubUserScreen} />
    <Stack.Screen name="SubUserDetail" component={SubUserDetailScreen} />
  </Stack.Navigator>
);
