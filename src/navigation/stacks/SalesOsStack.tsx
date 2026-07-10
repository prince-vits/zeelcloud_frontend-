import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SalesOsFilterScreen } from '../../screens/salesOs/SalesOsFilterScreen';
import { SalesOsPartyListScreen } from '../../screens/salesOs/SalesOsPartyListScreen';
import { SalesOsPartyDetailScreen } from '../../screens/salesOs/SalesOsPartyDetailScreen';
import { SalesOsBrokerListScreen } from '../../screens/salesOs/SalesOsBrokerListScreen';
import { SalesOsBrokerDetailScreen } from '../../screens/salesOs/SalesOsBrokerDetailScreen';
import { SalesOsAreaListScreen } from '../../screens/salesOs/SalesOsAreaListScreen';
import { SalesOsAreaDetailScreen } from '../../screens/salesOs/SalesOsAreaDetailScreen';
import { SalesOsPartyGroupListScreen } from '../../screens/salesOs/SalesOsPartyGroupListScreen';
import { SalesOsSalesPersonListScreen } from '../../screens/salesOs/SalesOsSalesPersonListScreen';
import type { SalesOsStackParamList } from '../../types';

const Stack = createNativeStackNavigator<SalesOsStackParamList>();

export const SalesOsStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SalesOsFilter" component={SalesOsFilterScreen} />
    <Stack.Screen name="SalesOsPartyList" component={SalesOsPartyListScreen} />
    <Stack.Screen name="SalesOsPartyDetail" component={SalesOsPartyDetailScreen} />
    <Stack.Screen name="SalesOsBrokerList" component={SalesOsBrokerListScreen} />
    <Stack.Screen name="SalesOsBrokerDetail" component={SalesOsBrokerDetailScreen} />
    <Stack.Screen name="SalesOsAreaList" component={SalesOsAreaListScreen} />
    <Stack.Screen name="SalesOsAreaDetail" component={SalesOsAreaDetailScreen} />
    <Stack.Screen name="SalesOsPartyGroupList" component={SalesOsPartyGroupListScreen} />
    <Stack.Screen name="SalesOsSalesPersonList" component={SalesOsSalesPersonListScreen} />
  </Stack.Navigator>
);
