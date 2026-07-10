import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NonIssueSelectionScreen } from '../../screens/nonIssue/NonIssueSelectionScreen';
import { NonIssueFilterScreen } from '../../screens/nonIssue/NonIssueFilterScreen';
import { NonIssueYarnScreen } from '../../screens/nonIssue/NonIssueYarnScreen';
import { NonIssueBeamScreen } from '../../screens/nonIssue/NonIssueBeamScreen';
import { NonIssueGrayScreen } from '../../screens/nonIssue/NonIssueGrayScreen';
import type { NonIssueStackParamList } from '../../types';

const Stack = createNativeStackNavigator<NonIssueStackParamList>();

export const NonIssueStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="NonIssueSelection" component={NonIssueSelectionScreen} />
    <Stack.Screen name="NonIssueFilter" component={NonIssueFilterScreen} />
    <Stack.Screen name="NonIssueYarn" component={NonIssueYarnScreen} />
    <Stack.Screen name="NonIssueBeam" component={NonIssueBeamScreen} />
    <Stack.Screen name="NonIssueGray" component={NonIssueGrayScreen} />
  </Stack.Navigator>
);
