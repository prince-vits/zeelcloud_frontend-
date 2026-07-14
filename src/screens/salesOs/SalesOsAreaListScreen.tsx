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
import type { SalesOsStackParamList, SalesOsArea } from '../../types';
import { formatCurrency } from '../../utils/currency';

type Props = {
  navigation: NativeStackNavigationProp<SalesOsStackParamList, 'SalesOsAreaList'>;
  route: RouteProp<SalesOsStackParamList, 'SalesOsAreaList'>;
};

const AREA_COLORS = ['#7C3AED', '#2563EB', '#10B981', '#F59E0B', '#EF4444'];

export const SalesOsAreaListScreen: React.FC<Props> = ({ navigation, route }) => {
  const { selectedCompany } = useCompanyStore();
  const [areas, setAreas] = useState<SalesOsArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [onlyDue, setOnlyDue] = useState(false);
  const [commonCompany, setCommonCompany] = useState(selectedCompany?.isCommon ?? false);

  // Re-fetch whenever a toggle changes (mirrors the OG getSummary() re-fetch).
  useEffect(() => {
    setLoading(true);
    const filter = { ...route.params.filter, onlyDue, commonCompany, companyId: selectedCompany?.id };
    salesOsApi.getAreas(filter).then((data) => {
      setAreas(data);
      setLoading(false);
    })
      .catch(() => setLoading(false));
  }, [onlyDue, commonCompany, selectedCompany?.id]);

  const filtered = areas.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));
  const totalOs = areas.reduce((sum, a) => sum + a.totalOs, 0);

  const renderItem = ({ item, index }: { item: SalesOsArea; index: number }) => {
    const color = AREA_COLORS[index % AREA_COLORS.length];
    const pct = totalOs > 0 ? (item.totalOs / totalOs) * 100 : 0;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('SalesOsAreaDetail', {
          areaId: item.id,
          areaName: item.name,
          filter: { ...route.params.filter, onlyDue, commonCompany, companyId: selectedCompany?.id },
        })}
        activeOpacity={0.85}
      >
        <View style={[styles.areaIcon, { backgroundColor: color + '20' }]}>
          <Icon name="map-marker" size={22} color={color} />
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.amount}>{formatCurrency(item.totalOs)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>{item.partyCount} parties</Text>
            <Text style={styles.pct}>{pct.toFixed(1)}% of total</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color }]} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <GradientHeader title="Sales OS" subtitle="Area Wise" onBack={() => navigation.goBack()} />
      <OutstandingToggleBar
        onlyDue={onlyDue}
        commonCompany={commonCompany}
        onOnlyDueChange={setOnlyDue}
        onCommonCompanyChange={setCommonCompany}
      />
      <View style={styles.searchWrapper}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search areas..." />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState icon="map-outline" title="No areas found" />}
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
  areaIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  name: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.semiBold, color: Colors.textPrimary },
  amount: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.bold, color: Colors.gradientStart },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  meta: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary },
  pct: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary },
  progressBar: {
    height: 6,
    backgroundColor: Colors.gray200,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
