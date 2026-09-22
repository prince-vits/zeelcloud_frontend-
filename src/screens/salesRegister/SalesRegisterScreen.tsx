import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ZIcon as Icon } from '../../components/ZIcon';
import { GradientHeader } from '../../components/GradientHeader';
import { SearchBar } from '../../components/SearchBar';
import { SelectField } from '../../components/SelectField';
import { Card } from '../../components/Card';
import { DateField } from '../../components/DateField';
import { EmptyState } from '../../components/EmptyState';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { GridTable, GridColumn, GridText } from '../../components/GridTable';
import { salesRegisterApi } from '../../services/api';
import { useCompanyStore } from '../../store/companyStore';
import { Colors, Typography, Spacing } from '../../theme';
import type { SalesRegisterStackParamList, RegisterEntry } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { PERIOD_OPTIONS, PeriodKey, rangeFor, withinRange } from '../../utils/dateRange';
import { OG_START_DATE, toDDMMYYYY } from '../../utils/formatDate';

type Props = {
  navigation: NativeStackNavigationProp<SalesRegisterStackParamList, 'SalesRegister'>;
};

export const SalesRegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { selectedCompany } = useCompanyStore();
  const { width } = useWindowDimensions();
  const cellFont = width < 360 ? 10 : 11;
  const [entries, setEntries] = useState<RegisterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  // Default "All" → show the latest entries immediately; filtering is optional.
  const [period, setPeriod] = useState<PeriodKey>('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    salesRegisterApi.getEntries({
      reportType: 'sales',
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
        (e.partyName.toLowerCase().includes(lowerSearch) ||
          e.invoiceNo.toLowerCase().includes(lowerSearch) ||
          String(e.amount).includes(lowerSearch) ||
          e.date.includes(lowerSearch)),
    )
    .sort((a, b) => b.date.localeCompare(a.date)); // latest first

  const totalAmount = filtered.reduce((sum, e) => sum + e.amount, 0);

  const columns: GridColumn<RegisterEntry>[] = useMemo(
    () => [
      {
        key: 'date',
        label: 'Date',
        flex: 0.95,
        align: 'left',
        render: (item) => (
          <GridText align="left" fontSize={cellFont} color={Colors.textSecondary} numberOfLines={1}>
            {toDDMMYYYY(item.date)}
          </GridText>
        ),
      },
      {
        key: 'invoiceNo',
        label: 'Bill no',
        flex: 0.7,
        align: 'left',
        render: (item) => (
          <GridText align="left" color={Colors.danger} bold fontSize={cellFont} numberOfLines={1}>
            {item.invoiceNo}
          </GridText>
        ),
      },
      {
        key: 'partyName',
        label: 'Party Name',
        flex: 1.8,
        align: 'left',
        render: (item) => (
          <View style={styles.partyCell}>
            <GridText align="left" fontSize={cellFont} numberOfLines={3}>
              {item.partyName}
            </GridText>
            {item.type ? (
              <Text style={[styles.typeLine, { fontSize: Math.max(9, cellFont - 1) }]} numberOfLines={1}>
                {item.type}
              </Text>
            ) : null}
          </View>
        ),
      },
      {
        key: 'amount',
        label: 'Amount',
        flex: 1.2,
        align: 'right',
        render: (item) => (
          <GridText align="right" fontSize={cellFont} numberOfLines={1}>
            {formatCurrency(item.amount)}
          </GridText>
        ),
      },
    ],
    [cellFont],
  );

  return (
    <View style={styles.container}>
      <GradientHeader title="Sales Register" subtitle="Invoice List" onBack={() => navigation.goBack()} />

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
      </Card>

      <View style={styles.searchWrapper}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search Party, Bill No, Date, Amount" />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{filtered.length} entries</Text>
          <Text style={styles.totalValue}>Total Amount: {formatCurrency(totalAmount)}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {!loading && filtered.length === 0 ? (
          <EmptyState icon="receipt" title="No entries found" subtitle="Try a different period" />
        ) : (
          <GridTable
            columns={columns}
            data={filtered}
            keyExtractor={(item) => item.id}
            alignRowsTop
            emptyText="No entries found"
            onRowPress={(item) => navigation.navigate('SalesRegisterDetail', { entryId: item.id })}
          />
        )}
      </ScrollView>
      <LoadingOverlay visible={loading} message="Loading..." />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  filterCard: { margin: Spacing.md, marginBottom: 0, padding: Spacing.md },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateField: { flex: 1 },
  arrow: { marginHorizontal: Spacing.sm, marginTop: 14 },
  searchWrapper: { padding: Spacing.md, paddingBottom: Spacing.sm },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  totalLabel: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary },
  totalValue: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.success,
  },
  list: { paddingBottom: Spacing.xl, flexGrow: 1 },
  partyCell: { alignItems: 'flex-start', width: '100%' },
  typeLine: {
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: Typography.fontWeights.medium,
  },
});
