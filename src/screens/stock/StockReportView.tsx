import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Switch, StyleSheet, ViewStyle } from 'react-native';
import { GradientHeader } from '../../components/GradientHeader';
import { CompanyStrip } from '../../components/CompanyStrip';
import { SearchBar } from '../../components/SearchBar';
import { EmptyState } from '../../components/EmptyState';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { GridTable, GridColumn, GridText } from '../../components/GridTable';
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

// Two decimals for every figure (app-wide rule), thousands-separated.
const formatNumber = (value: number, _decimals?: number): string =>
  value.toLocaleString('en-IN', { maximumFractionDigits: 2 });

const formatValue = (item: StockItem, col: StockColumn): string => {
  const raw = item[col.key];
  if (raw === undefined || raw === null) return '-';
  if (typeof raw === 'number') return formatNumber(raw, col.decimals);
  return String(raw);
};

// Column flex weights shared by the grid and the pinned totals footer.
const nameFlex = 2.2;
const metricFlex = (col: StockColumn) => Math.max(0.7, col.width / 100);

// OG .NET stock/non-issue report page, section for section:
//   ① company strip (name + Last Synced)   ② search + Common Company toggle
//   ③ yellow column-header strip           ④ data rows
//   ⑤ bold totals footer pinned at the bottom
// All fit-to-width — no horizontal scrolling.
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
  // OG: "Common Company" switch — ON aggregates across all companies.
  const [commonCompany, setCommonCompany] = useState(false);

  useEffect(() => {
    setLoading(true);
    stockApi
      .getByCategory(category, commonCompany ? undefined : selectedCompany?.id, reportType, stockSource)
      .then((data) => {
        setItems(data);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [category, selectedCompany?.id, reportType, stockSource, commonCompany]);

  const lowerSearch = search.toLowerCase();
  const filtered = items.filter(
    (i) => i.name.toLowerCase().includes(lowerSearch) || i.quality.toLowerCase().includes(lowerSearch),
  );

  const metaColumns = columns.filter((c) => c.key !== 'name');

  // OG footer: bold column totals over the visible rows.
  const totals = useMemo(() => {
    const sums: Record<string, number> = {};
    for (const col of metaColumns) {
      sums[String(col.key)] = filtered.reduce((sum, item) => {
        const v = item[col.key];
        return sum + (typeof v === 'number' ? v : 0);
      }, 0);
    }
    return sums;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, columns]);

  const gridColumns: GridColumn<StockItem>[] = columns.map((col) =>
    col.key === 'name'
      ? {
          key: String(col.key),
          label: col.label,
          flex: nameFlex,
          align: 'left' as const,
          render: (item: StockItem) => (
            <GridText bold>{`${rowEmoji ? `${rowEmoji(item)} ` : ''}${item.name}`}</GridText>
          ),
        }
      : {
          key: String(col.key),
          label: col.label,
          flex: metricFlex(col),
          render: (item: StockItem) => <GridText>{formatValue(item, col)}</GridText>,
        },
  );

  const footerCell = (flex: number, extra?: ViewStyle): ViewStyle => ({
    flex,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    ...extra,
  });

  return (
    <View style={styles.container}>
      <GradientHeader title={title} subtitle={reportTypeLabel(reportType)} onBack={onBack} />
      {/* ① OG company strip */}
      <CompanyStrip />

      {/* ② search + Common Company toggle (OG blue frame) */}
      <View style={styles.toolbox}>
        <SearchBar value={search} onChangeText={setSearch} placeholder={searchPlaceholder} />
        <View style={styles.commonRow}>
          <Text style={styles.commonLabel}>Common Company</Text>
          <Switch
            value={commonCompany}
            onValueChange={setCommonCompany}
            trackColor={{ false: Colors.gray300, true: Colors.primary }}
            thumbColor={Colors.surface}
            ios_backgroundColor={Colors.gray300}
            style={styles.switch}
          />
        </View>
      </View>

      {/* ③+④ header strip + data rows */}
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {!loading && filtered.length === 0 ? (
          <EmptyState icon={emptyIcon} title={`No ${title.toLowerCase()} found`} />
        ) : (
          <GridTable columns={gridColumns} data={filtered} keyExtractor={(item, idx) => `${item.id}-${idx}`} />
        )}
      </ScrollView>

      {/* ⑤ OG totals footer — bold sums, pinned at the bottom */}
      {filtered.length > 0 ? (
        <View style={styles.totalsRow}>
          <View style={footerCell(nameFlex, { alignItems: 'flex-start' })}>
            <Text style={styles.totalsLabel}>Total ({filtered.length})</Text>
          </View>
          {metaColumns.map((col) => (
            <View key={String(col.key)} style={footerCell(metricFlex(col))}>
              <Text style={styles.totalsValue} numberOfLines={1}>
                {formatNumber(totals[String(col.key)] ?? 0, col.decimals)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <LoadingOverlay visible={loading} message="Loading stock..." />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  toolbox: {
    backgroundColor: '#E7F0FE', // OG Blue400Accent-style toolbox frame
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: 2,
  },
  commonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  commonLabel: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  switch: { transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] },
  list: { paddingBottom: Spacing.md },
  totalsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
    paddingVertical: 6,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalsLabel: {
    fontSize: 11,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  totalsValue: {
    fontSize: 11,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
});
