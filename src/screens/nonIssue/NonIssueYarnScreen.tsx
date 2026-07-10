import React from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { StockReportView } from '../stock/StockReportView';
import { yarnColumns, yarnLotGradeColumns } from '../stock/stockColumns';
import { yarnEmoji } from '../../utils/yarnEmoji';
import type { NonIssueStackParamList } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<NonIssueStackParamList, 'NonIssueYarn'>;
  route: RouteProp<NonIssueStackParamList, 'NonIssueYarn'>;
};

export const NonIssueYarnScreen: React.FC<Props> = ({ navigation, route }) => (
  <StockReportView
    title="Yarn"
    category="yarn"
    columns={route.params.reportType === 'qualityLotGrade' ? yarnLotGradeColumns : yarnColumns}
    reportType={route.params.reportType}
    rowEmoji={yarnEmoji}
    searchPlaceholder="Search yarn..."
    emptyIcon="thread"
    onBack={() => navigation.goBack()}
  />
);
