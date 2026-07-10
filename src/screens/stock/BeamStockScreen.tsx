import React from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { StockReportView } from './StockReportView';
import { beamColumns } from './stockColumns';
import type { StockStackParamList } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<StockStackParamList, 'BeamStock'>;
  route: RouteProp<StockStackParamList, 'BeamStock'>;
};

export const BeamStockScreen: React.FC<Props> = ({ navigation, route }) => (
  <StockReportView
    title="Beam Stock"
    category="beam"
    columns={beamColumns}
    reportType={route.params.reportType}
    searchPlaceholder="Search beams..."
    emptyIcon="layers-outline"
    onBack={() => navigation.goBack()}
  />
);
