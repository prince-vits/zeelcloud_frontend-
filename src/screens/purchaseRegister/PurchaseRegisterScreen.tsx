import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ZIcon as Icon } from '../../components/ZIcon';
import { GradientHeader } from '../../components/GradientHeader';
import { SearchBar } from '../../components/SearchBar';
import { SelectField } from '../../components/SelectField';
import { Card } from '../../components/Card';
import { DateField } from '../../components/DateField';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { purchaseRegisterApi } from '../../services/api';
import { useCompanyStore } from '../../store/companyStore';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import type { PurchaseRegisterStackParamList, RegisterEntry } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { PERIOD_OPTIONS, PeriodKey, rangeFor, withinRange } from '../../utils/dateRange';
import { OG_START_DATE, toDDMMYY } from '../../utils/formatDate';

type Props = {
  navigation: NativeStackNavigationProp<PurchaseRegisterStackParamList, 'PurchaseRegister'>;
};

export const PurchaseRegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { selectedCompany } = useCompanyStore();
  const [entries, setEntries] = useState<RegisterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  // Default "All" → show the latest entries immediately; filtering is optional.
  const [period, setPeriod] = useState<PeriodKey>('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    purchaseRegisterApi.getEntries({
      reportType: 'purchase',
      fromDate,
      toDate,
      companyId: selectedCompany?.id,
    }).then((data) => {
      setEntries(data);
      setLoading(false);
    })
      .catch(() => setLoading(false));
  }, [selectedCompany?.id, fromDate, toDate]);

  const handlePeriod = (p: string) => {
    const key = p as PeriodKey;
    setPeriod(key);
    const range = rangeFor(key);
    setFromDate(range?.from ?? '');
    setToDate(range?.to ?? '');
  };

  const lowerSearch = search.toLowerCase();
  const range = fromDate && toDate ? { from: fromDate, to: toDate } : null;
  const filtered = entries
    .filter(
      (e) =>
        withinRange(e.date, range) &&
        (e.partyName.toLowerCase().includes(lowerSearch) || e.invoiceNo.toLowerCase().includes(lowerSearch)),
    )
    .sort((a, b) => b.date.localeCompare(a.date)); // latest first

  const totalAmount = filtered.reduce((sum, e) => sum + e.amount, 0);

  const renderItem = ({ item }: { item: RegisterEntry }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PurchaseRegisterDetail', { entryId: item.id })}
      activeOpacity={0.85}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.invoiceNo}>{item.invoiceNo}</Text>
        <Badge label={item.type} variant={item.type === 'Return' ? 'overdue' : 'ok'} />
      </View>
      <Text style={styles.partyName} numberOfLines={1}>{item.partyName}</Text>
      <View style={styles.cardFooter}>
        <View style={styles.dateRow}>
          <Icon name="calendar-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.date}>{toDDMMYY(item.date)}</Text>
        </View>
        <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <GradientHeader title="Purchase Register" subtitle="Invoice List" onBack={() => navigation.goBack()} />

      {/* Filter Card — period dropdown + editable date range */}
      <Card style={styles.filterCard}>
        <SelectField label="Period" value={period} options={PERIOD_OPTIONS} onSelect={handlePeriod} leftIcon="calendar-range" />
        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <DateField label="From" value={fromDate} placeholder="All" defaultDate={OG_START_DATE} allowClear onChange={setFromDate} />
          </View>
          <Icon name="arrow-right" size={16} color={Colors.gray400} style={styles.arrow} />
          <View style={styles.dateField}>
            <DateField label="To" value={toDate} placeholder="All" allowClear onChange={setToDate} />
          </View>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{filtered.length} entries</Text>
          <Text style={styles.totalValue}>Total: {formatCurrency(totalAmount)}</Text>
        </View>
      </Card>

      <View style={styles.searchWrapper}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search bill / party..." />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState icon="clipboard-list" title="No entries found" subtitle="Try a different period" />}
      />
      <LoadingOverlay visible={loading} message="Loading..." />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  filterCard: { margin: Spacing.md, marginBottom: 0, padding: Spacing.md },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateField: { flex: 1 },
  filterLabel: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, marginBottom: 4 },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateInputText: { flex: 1, fontSize: Typography.fontSizes.sm, color: Colors.textPrimary, paddingVertical: Spacing.sm },
  arrow: { marginHorizontal: Spacing.sm, marginTop: 14 },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalLabel: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary },
  totalValue: { fontSize: Typography.fontSizes.sm, fontWeight: Typography.fontWeights.bold, color: Colors.gradientEnd },
  searchWrapper: { padding: Spacing.md, paddingBottom: Spacing.sm },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  invoiceNo: { fontSize: Typography.fontSizes.sm, fontWeight: Typography.fontWeights.bold, color: Colors.gradientEnd },
  partyName: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.semiBold, color: Colors.textPrimary, marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary },
  amount: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
});
