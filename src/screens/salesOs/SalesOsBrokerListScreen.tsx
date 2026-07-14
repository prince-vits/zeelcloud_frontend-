import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ZIcon as Icon } from '../../components/ZIcon';
import { GradientHeader } from '../../components/GradientHeader';
import { SearchBar } from '../../components/SearchBar';
import { EmptyState } from '../../components/EmptyState';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { OutstandingToggleBar } from '../../components/OutstandingToggleBar';
import { salesOsApi } from '../../services/api';
import { useCompanyStore } from '../../store/companyStore';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import type { SalesOsStackParamList, SalesOsBroker } from '../../types';
import { formatCurrency } from '../../utils/currency';

type Props = {
  navigation: NativeStackNavigationProp<SalesOsStackParamList, 'SalesOsBrokerList'>;
  route: RouteProp<SalesOsStackParamList, 'SalesOsBrokerList'>;
};


export const SalesOsBrokerListScreen: React.FC<Props> = ({ navigation, route }) => {
  const { selectedCompany } = useCompanyStore();
  const [brokers, setBrokers] = useState<SalesOsBroker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [onlyDue, setOnlyDue] = useState(false);
  const [commonCompany, setCommonCompany] = useState(selectedCompany?.isCommon ?? false);

  // Re-fetch whenever a toggle changes (mirrors the OG getSummary() re-fetch).
  useEffect(() => {
    setLoading(true);
    const filter = { ...route.params.filter, onlyDue, commonCompany, companyId: selectedCompany?.id };
    salesOsApi.getBrokers(filter).then((data) => {
      setBrokers(data);
      setLoading(false);
    })
      .catch(() => setLoading(false));
  }, [onlyDue, commonCompany, selectedCompany?.id]);

  const lowerSearch = search.toLowerCase();
  const filtered = brokers.filter(
    (b) =>
      b.name.toLowerCase().includes(lowerSearch) ||
      b.city.toLowerCase().includes(lowerSearch),
  );

  const renderItem = ({ item }: { item: SalesOsBroker }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('SalesOsBrokerDetail', {
        brokerId: item.id,
        brokerName: item.name,
        filter: { ...route.params.filter, onlyDue, commonCompany, companyId: selectedCompany?.id },
      })}
      activeOpacity={0.85}
    >
      <View style={styles.avatar}>
        <Icon name="handshake" size={22} color={Colors.textWhite} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.metaRow}>
          <Icon name="map-marker-outline" size={12} color={Colors.textSecondary} />
          <Text style={styles.meta}>{item.city}</Text>
          <View style={styles.dot} />
          <Icon name="account-multiple-outline" size={12} color={Colors.textSecondary} />
          <Text style={styles.meta}>{item.partyCount} parties</Text>
        </View>
        <Text style={styles.amount}>{formatCurrency(item.totalOs)}</Text>
      </View>
      <Icon name="chevron-right" size={18} color={Colors.gray300} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <GradientHeader title="Sales OS" subtitle="Broker Wise" onBack={() => navigation.goBack()} />
      <OutstandingToggleBar
        onlyDue={onlyDue}
        commonCompany={commonCompany}
        onOnlyDueChange={setOnlyDue}
        onCommonCompanyChange={setCommonCompany}
      />
      <View style={styles.searchWrapper}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search brokers..." />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState icon="handshake-outline" title="No brokers found" />}
      />
      <LoadingOverlay visible={loading} message="Loading..." />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchWrapper: { padding: Spacing.md, paddingBottom: Spacing.sm },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.gradientStart,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  info: { flex: 1 },
  name: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.semiBold, color: Colors.textPrimary, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 6 },
  meta: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.gray300, marginHorizontal: 2 },
  amount: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.bold, color: Colors.gradientStart },
});
