import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ZIcon as Icon } from '../../components/ZIcon';
import { GradientHeader } from '../../components/GradientHeader';
import { SearchBar } from '../../components/SearchBar';
import { EmptyState } from '../../components/EmptyState';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { gpRegisterApi } from '../../services/api';
import { useCompanyStore } from '../../store/companyStore';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import type { GpRegisterStackParamList, GpRegisterEntry } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { toDDMMYY } from '../../utils/formatDate';

type Props = {
  navigation: NativeStackNavigationProp<GpRegisterStackParamList, 'GpRegister'>;
};


const processColors: Record<string, string> = {
  Dyeing: Colors.gradientStart,
  Finishing: Colors.success,
  Printing: Colors.warning,
  Bleaching: Colors.info,
};

export const GpRegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { selectedCompany } = useCompanyStore();
  const [entries, setEntries] = useState<GpRegisterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    gpRegisterApi.getEntries({
      reportType: 'gp',
      fromDate: '',
      toDate: '',
      companyId: selectedCompany?.id,
    }).then((data) => {
      setEntries(data);
      setLoading(false);
    })
      .catch(() => setLoading(false));
  }, [selectedCompany?.id]);

  const lowerSearch = search.toLowerCase();
  const filtered = entries.filter(
    (e) =>
      e.partyName.toLowerCase().includes(lowerSearch) ||
      e.processType.toLowerCase().includes(lowerSearch),
  );

  const renderItem = ({ item }: { item: GpRegisterEntry }) => {
    const pColor = processColors[item.processType] ?? Colors.gradientStart;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('GpRegisterDetail', { entryId: item.id })}
        activeOpacity={0.85}
      >
        <View style={[styles.processTag, { backgroundColor: pColor + '20' }]}>
          <Icon name="cog-outline" size={20} color={pColor} />
        </View>
        <View style={styles.info}>
          <View style={styles.header}>
            <Text style={styles.lotNo}>{item.lotNo ?? 'No Lot'}</Text>
            <View style={[styles.processChip, { backgroundColor: pColor + '20' }]}>
              <Text style={[styles.processText, { color: pColor }]}>{item.processType}</Text>
            </View>
          </View>
          <Text style={styles.partyName}>{item.partyName}</Text>
          <View style={styles.qtyRow}>
            <View style={styles.qtyItem}>
              <Icon name="grid-large" size={12} color={Colors.textSecondary} />
              <Text style={styles.qtyLabel}>Gray: </Text>
              <Text style={styles.qtyValue}>{item.grayQty.toLocaleString()} m</Text>
            </View>
            <View style={styles.qtyItem}>
              <Icon name="layers-outline" size={12} color={Colors.textSecondary} />
              <Text style={styles.qtyLabel}>Beam: </Text>
              <Text style={styles.qtyValue}>{item.beamQty}</Text>
            </View>
            <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
          </View>
          <View style={styles.footer}>
            <Icon name="calendar-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.date}>{toDDMMYY(item.date)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <GradientHeader title="GP Register" subtitle="Job Work Entries" onBack={() => navigation.goBack()} />
      <View style={styles.searchWrapper}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search by party or process..." />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState icon="chart-bar" title="No GP entries found" />}
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
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },
  processTag: {
    width: 44,
    height: 44,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  info: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  lotNo: { fontSize: Typography.fontSizes.sm, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  processChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  processText: { fontSize: Typography.fontSizes.xs, fontWeight: Typography.fontWeights.semiBold },
  partyName: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.medium, color: Colors.textPrimary, marginBottom: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: Spacing.sm },
  qtyItem: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  qtyLabel: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary },
  qtyValue: { fontSize: Typography.fontSizes.xs, fontWeight: Typography.fontWeights.semiBold, color: Colors.textPrimary },
  amount: { marginLeft: 'auto', fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.bold, color: Colors.gradientStart },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  date: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary },
});
