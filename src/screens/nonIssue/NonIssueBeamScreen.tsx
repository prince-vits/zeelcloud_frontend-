import React from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { StockReportView } from '../stock/StockReportView';
import { beamColumns } from '../stock/stockColumns';
import type { NonIssueStackParamList } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<NonIssueStackParamList, 'NonIssueBeam'>;
  route: RouteProp<NonIssueStackParamList, 'NonIssueBeam'>;
};

export const NonIssueBeamScreen: React.FC<Props> = ({ navigation, route }) => (
  <StockReportView
    title="Beam"
    category="beam"
    columns={beamColumns}
    reportType={route.params.reportType}
    searchPlaceholder="Search beams..."
    emptyIcon="layers-outline"
    onBack={() => navigation.goBack()}
  />
);
