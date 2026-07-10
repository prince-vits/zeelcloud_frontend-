import React from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { StockReportView } from './StockReportView';
import { yarnColumns, yarnLotGradeColumns } from './stockColumns';
import { yarnEmoji } from '../../utils/yarnEmoji';
import type { StockStackParamList } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<StockStackParamList, 'YarnStock'>;
  route: RouteProp<StockStackParamList, 'YarnStock'>;
};

export const YarnStockScreen: React.FC<Props> = ({ navigation, route }) => (
  <StockReportView
    title="Yarn Stock"
    category="yarn"
    columns={route.params.reportType === 'qualityLotGrade' ? yarnLotGradeColumns : yarnColumns}
    reportType={route.params.reportType}
    rowEmoji={yarnEmoji}
    searchPlaceholder="Search yarn..."
    emptyIcon="thread"
    onBack={() => navigation.goBack()}
  />
);
