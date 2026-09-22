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

export const YarnStockScreen: React.FC<Props> = ({ navigation, route }) => {
  const isLotGrade = route.params.reportType === 'qualityLotGrade';
  return (
    <StockReportView
      title="Yarn Stock"
      category="yarn"
      columns={isLotGrade ? yarnLotGradeColumns : yarnColumns}
      reportType={route.params.reportType}
      rowEmoji={isLotGrade ? undefined : yarnEmoji}
      searchPlaceholder="Search yarn..."
      emptyIcon="package-variant"
      onBack={() => navigation.goBack()}
      onRowPress={(item, commonCompany) =>
        navigation.navigate('StockItemDetail', {
          itemName: item.name,
          lotNo: item.lotNo !== '-' ? item.lotNo : undefined,
          category: 'yarn',
          reportType: route.params.reportType,
          commonCompany,
        })
      }
    />
  );
};
