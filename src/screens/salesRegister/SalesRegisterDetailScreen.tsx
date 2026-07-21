import React, { useEffect, useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { BillDetailView } from '../../components/BillDetailView';
import { salesRegisterApi } from '../../services/api';
import type { SalesRegisterStackParamList, BillDetail } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<SalesRegisterStackParamList, 'SalesRegisterDetail'>;
  route: RouteProp<SalesRegisterStackParamList, 'SalesRegisterDetail'>;
};

// OG "Sales Bill Details" page — layout lives in BillDetailView.
export const SalesRegisterDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { entryId } = route.params;
  const [detail, setDetail] = useState<BillDetail | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    salesRegisterApi
      .getBillDetail(entryId)
      .then(setDetail)
      .catch(() => setDetail(undefined))
      .finally(() => setLoading(false));
  }, [entryId]);

  return (
    <BillDetailView
      title="Sales Bill Details"
      module="sales"
      detail={detail}
      loading={loading}
      onBack={() => navigation.goBack()}
    />
  );
};
