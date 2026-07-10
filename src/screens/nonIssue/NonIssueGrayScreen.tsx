import React from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { StockReportView } from '../stock/StockReportView';
import { grayColumns } from '../stock/stockColumns';
import type { NonIssueStackParamList } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<NonIssueStackParamList, 'NonIssueGray'>;
  route: RouteProp<NonIssueStackParamList, 'NonIssueGray'>;
};

export const NonIssueGrayScreen: React.FC<Props> = ({ navigation, route }) => (
  <StockReportView
    title="Gray"
    category="nonIssue"
    columns={grayColumns}
    reportType={route.params.reportType}
    searchPlaceholder="Search gray fabric..."
    emptyIcon="package-variant"
    onBack={() => navigation.goBack()}
  />
);
