import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { GradientHeader } from '../../components/GradientHeader';
import { SearchBar } from '../../components/SearchBar';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { stockApi } from '../../services/api';
import { useCompanyStore } from '../../store/companyStore';
import { Colors, Typography, Spacing } from '../../theme';
import type { StockItem, StockReportType } from '../../types';

export interface StockColumn {
  key: keyof StockItem;
  label: string;
  width: number;
  decimals?: number;
}

export interface StockReportViewProps {
  title: string;
  category: 'yarn' | 'beam' | 'nonIssue';
  stockSource?: 'yarn' | 'beam' | 'gray' | 'sequance';
  columns: StockColumn[];
  reportType: StockReportType;
  searchPlaceholder: string;
  emptyIcon: string;
  onBack: () => void;
  // Optional per-row emoji shown before the item name (e.g. yarn fiber type).
  rowEmoji?: (item: StockItem) => string;
}

const reportTypeLabel = (t: StockReportType) =>
  t === 'qualityLotGrade' ? 'Quality + Lot No. + Grade Wise' : 'Quality Wise';

const formatValue = (item: StockItem, col: StockColumn): string => {
  const raw = item[col.key];
  if (raw === undefined || raw === null) return '-';
  if (typeof raw === 'number') {
    return col.decimals != null ? raw.toFixed(col.decimals) : raw.toLocaleString('en-IN');
  }
  return String(raw);
};

// Stock report rendered as vertical cards (no horizontal scrolling): each item
// shows its name as the title with its metric columns as label/value pairs.
export const StockReportView: React.FC<StockReportViewProps> = ({
  title,
  category,
  stockSource,
  columns,
  reportType,
  searchPlaceholder,
  emptyIcon,
  onBack,
  rowEmoji,
}) => {
  const { selectedCompany } = useCompanyStore();
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    stockApi
      .getByCategory(category, selectedCompany?.id, reportType, stockSource)
      .then((data) => {
        setItems(data);
      })
      .finally(() => setLoading(false));
  }, [category, selectedCompany?.id, reportType, stockSource]);

  const lowerSearch = search.toLowerCase();
  const filtered = items.filter(
    (i) => i.name.toLowerCase().includes(lowerSearch) || i.quality.toLowerCase().includes(lowerSearch),
  );

  // The first column is the item name (card title); the rest are metric fields.
  const metaColumns = columns.filter((c) => c.key !== 'name');

  const renderItem = ({ item }: { item: StockItem }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.itemName} numberOfLines={1}>
          {rowEmoji ? `${rowEmoji(item)}  ` : ''}{item.name}
        </Text>
      </View>
      <View style={styles.metaList}>
        {metaColumns.map((col, idx) => (
          <View key={col.key} style={[styles.metaRow, idx > 0 && styles.metaRowDivider]}>
            <Text style={styles.metaLabel}>{col.label}</Text>
            <Text style={styles.metaValue}>{formatValue(item, col)}</Text>
          </View>
        ))}
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <GradientHeader title={title} subtitle={reportTypeLabel(reportType)} onBack={onBack} />
      <View style={styles.searchWrapper}>
        <SearchBar value={search} onChangeText={setSearch} placeholder={searchPlaceholder} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? <EmptyState icon={emptyIcon} title={`No ${title.toLowerCase()} found`} /> : null
        }
      />
      <LoadingOverlay visible={loading} message="Loading stock..." />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchWrapper: { padding: Spacing.md, paddingBottom: Spacing.sm },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl },
  card: { marginBottom: Spacing.sm },
  cardHeader: {
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemName: { fontSize: Typography.fontSizes.md, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  metaList: {},
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  metaRowDivider: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  metaLabel: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary },
  metaValue: { fontSize: Typography.fontSizes.sm, fontWeight: Typography.fontWeights.semiBold, color: Colors.textPrimary },
});
