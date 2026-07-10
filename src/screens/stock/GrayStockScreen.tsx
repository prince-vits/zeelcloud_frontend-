import React from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { StockReportView } from './StockReportView';
import { grayColumns } from './stockColumns';
import type { StockStackParamList } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<StockStackParamList, 'GrayStock'>;
  route: RouteProp<StockStackParamList, 'GrayStock'>;
};

export const GrayStockScreen: React.FC<Props> = ({ navigation, route }) => (
  <StockReportView
    title="Gray Stock"
    category="nonIssue"
    columns={grayColumns}
    reportType={route.params.reportType}
    searchPlaceholder="Search gray stock..."
    emptyIcon="package-variant"
    onBack={() => navigation.goBack()}
  />
);
