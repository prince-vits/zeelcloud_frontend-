import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  StyleSheet,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientHeader } from '../../components/GradientHeader';
import { CompanyStrip } from '../../components/CompanyStrip';
import { SearchBar } from '../../components/SearchBar';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/TableSkeleton';
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
  // second arg mirrors the list's Common Company toggle so detail fetch
  // uses the same company scope (omit company= when aggregating all).
  onRowPress?: (item: StockItem, commonCompany: boolean) => void;
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

// Wide numeric columns need more room so footer totals (e.g. 42,48,015.xx) don't clip.
const WIDE_KEYS = new Set(['meter', 'weight', 'netWeight', 'cheese']);

// Text columns — no footer sum (OG only totals Crtn / Net Weight / Cheese).
const NON_SUMMABLE_KEYS = new Set(['lotNo', 'grade', 'name']);

const nameFlexFor = (metricCount: number, isLotGrade: boolean, isGray: boolean) => {
  if (isLotGrade) return 1.15;
  if (isGray) return 1.5; // 5 metric cols — modest name bump, not oversized
  if (metricCount >= 5) return 1.35;
  if (metricCount >= 4) return 1.55;
  return 1.85; // Yarn / Beam
};

const metricFlexFor = (col: StockColumn, isLotGrade: boolean, isGray: boolean) => {
  const key = String(col.key);
  if (isLotGrade) {
    if (key === 'netWeight') return 0.95;
    if (key === 'lotNo') return 0.72;
    if (key === 'grade') return 0.58;
    if (key === 'cheese' || key === 'crtn') return 0.62;
  }
  if (isGray) {
    if (key === 'meter' || key === 'weight') return 1.0;
    if (key === 'avgWt') return 0.68;
    if (key === 'taka' || key === 'pallu') return 0.58;
  }
  if (WIDE_KEYS.has(key)) return 1.2;
  if (key === 'avgWt' || key === 'lotNo') return 0.9;
  return 0.72; // taka, beam, crtn, pallu
};

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
  onRowPress,
}) => {
  const { selectedCompany } = useCompanyStore();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
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
    (i) =>
      i.name.toLowerCase().includes(lowerSearch) ||
      i.quality.toLowerCase().includes(lowerSearch) ||
      (i.lotNo ?? '').toLowerCase().includes(lowerSearch) ||
      (i.grade ?? '').toLowerCase().includes(lowerSearch),
  );

  const isLotGrade = reportType === 'qualityLotGrade';
  const isGray = stockSource === 'gray';
  const isDenseName = isLotGrade || isGray;
  const metaColumns = columns.filter((c) => c.key !== 'name');
  const nameFlex = nameFlexFor(metaColumns.length, isLotGrade, isGray);
  const metricFlex = (col: StockColumn) => metricFlexFor(col, isLotGrade, isGray);

  // Dense grids (gray / lot-grade) use smaller type; names scale down instead of ugly mid-word breaks.
  const footerFont = isDenseName
    ? width < 360
      ? 7
      : 8
    : metaColumns.length >= 5
      ? width < 360
        ? 8
        : 9
      : width < 360
        ? 9
        : 10;
  const cellFont = isDenseName ? (width < 360 ? 8 : 9) : width < 360 ? 10 : 11;
  const nameFont = isDenseName ? (width < 360 ? 8 : 9) : cellFont;

  // OG footer: bold column totals over the visible rows.
  const totals = useMemo(() => {
    const sums: Record<string, number> = {};
    for (const col of metaColumns) {
      const key = String(col.key);
      if (NON_SUMMABLE_KEYS.has(key)) continue;
      sums[key] = filtered.reduce((sum, item) => {
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
          render: (item: StockItem) =>
            isDenseName ? (
              <GridText
                bold
                fontSize={nameFont}
                numberOfLines={2}
                align="left"
                adjustsFontSizeToFit
                minimumFontScale={0.72}
              >
                {item.name}
              </GridText>
            ) : (
              <GridText bold fontSize={cellFont} numberOfLines={2} align="left">
                {`${rowEmoji ? `${rowEmoji(item)} ` : ''}${item.name}`}
              </GridText>
            ),
        }
      : {
          key: String(col.key),
          label: col.label,
          flex: metricFlex(col),
          align: col.key === 'grade' || col.key === 'lotNo' ? ('left' as const) : ('center' as const),
          render: (item: StockItem) => (
            <GridText
              fontSize={cellFont}
              numberOfLines={col.key === 'grade' ? 2 : 1}
              align={col.key === 'grade' || col.key === 'lotNo' ? 'left' : 'center'}
              adjustsFontSizeToFit={col.key === 'lotNo'}
              minimumFontScale={0.7}
            >
              {formatValue(item, col)}
            </GridText>
          ),
        },
  );

  const footerCell = (flex: number, extra?: ViewStyle): ViewStyle => ({
    flex,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
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
        {loading && filtered.length === 0 ? (
          <TableSkeleton columns={gridColumns as any} />
        ) : !loading && filtered.length === 0 ? (
          <EmptyState icon={emptyIcon} title={`No ${title.toLowerCase()} found`} />
        ) : (
          <GridTable
            columns={gridColumns}
            data={filtered}
            keyExtractor={(item, idx) => `${item.id}-${idx}`}
            alignRowsTop
            onRowPress={onRowPress ? (item) => onRowPress(item, commonCompany) : undefined}
          />
        )}
      </ScrollView>

      {/* ⑤ Totals footer — safe-area padded, wrap/shrink so values never clip */}
      {filtered.length > 0 ? (
        <View
          style={[
            styles.totalsRow,
            {
              paddingBottom: Math.max(insets.bottom, 8),
              paddingHorizontal: 4,
            },
          ]}
        >
          <View style={footerCell(nameFlex, { alignItems: 'flex-start' })}>
            <Text
              style={[styles.totalsLabel, { fontSize: footerFont }]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {`Total (${filtered.length})`}
            </Text>
          </View>
          {metaColumns.map((col) => {
            const key = String(col.key);
            const summable = !NON_SUMMABLE_KEYS.has(key);
            return (
              <View key={key} style={footerCell(metricFlex(col))}>
                <Text
                  style={[styles.totalsValue, { fontSize: footerFont }]}
                  numberOfLines={2}
                  adjustsFontSizeToFit
                  minimumFontScale={0.65}
                >
                  {summable ? formatNumber(totals[key] ?? 0, col.decimals) : ''}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  toolbox: {
    backgroundColor: Colors.infoLight, // Brand indigo wash for toolbox frame
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
    minHeight: 44,
    paddingTop: 8,
    width: '100%',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalsLabel: {
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'left',
    width: '100%',
  },
  totalsValue: {
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    width: '100%',
  },
});
