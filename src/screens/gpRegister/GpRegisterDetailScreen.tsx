import React, { useEffect, useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { BillDetailView } from '../../components/BillDetailView';
import { gpRegisterApi } from '../../services/api';
import type { GpRegisterStackParamList, BillDetail } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<GpRegisterStackParamList, 'GpRegisterDetail'>;
  route: RouteProp<GpRegisterStackParamList, 'GpRegisterDetail'>;
};

// OG "GP Bill Details" page — layout lives in BillDetailView.
export const GpRegisterDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { entryId } = route.params;
  const [detail, setDetail] = useState<BillDetail | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gpRegisterApi
      .getBillDetail(entryId)
      .then(setDetail)
      .catch(() => setDetail(undefined))
      .finally(() => setLoading(false));
  }, [entryId]);

  return (
    <BillDetailView
      title="GP Bill Details"
      module="gp"
      detail={detail}
      loading={loading}
      onBack={() => navigation.goBack()}
    />
  );
};
