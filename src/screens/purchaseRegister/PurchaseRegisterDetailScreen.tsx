import React, { useEffect, useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { BillDetailView } from '../../components/BillDetailView';
import { purchaseRegisterApi } from '../../services/api';
import type { PurchaseRegisterStackParamList, BillDetail } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<PurchaseRegisterStackParamList, 'PurchaseRegisterDetail'>;
  route: RouteProp<PurchaseRegisterStackParamList, 'PurchaseRegisterDetail'>;
};

// OG "Purchase Bill Details" page — layout lives in BillDetailView.
export const PurchaseRegisterDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { entryId } = route.params;
  const [detail, setDetail] = useState<BillDetail | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    purchaseRegisterApi
      .getBillDetail(entryId)
      .then(setDetail)
      .catch(() => setDetail(undefined))
      .finally(() => setLoading(false));
  }, [entryId]);

  return (
    <BillDetailView
      title="Purchase Bill Details"
      module="purchase"
      detail={detail}
      loading={loading}
      onBack={() => navigation.goBack()}
    />
  );
};
