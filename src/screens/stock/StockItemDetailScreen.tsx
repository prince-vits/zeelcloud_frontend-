import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, useWindowDimensions, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { GradientHeader } from '../../components/GradientHeader';
import { CompanyStrip } from '../../components/CompanyStrip';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/TableSkeleton';
import { GridTable, GridColumn, GridText } from '../../components/GridTable';
import { stockApi } from '../../services/api';
import { useCompanyStore } from '../../store/companyStore';
import { Colors, Typography, Spacing } from '../../theme';
import type { StockStackParamList, StockDetailItem } from '../../types';
import { toDDMMYYYY } from '../../utils/formatDate';

type Props = {
  navigation: NativeStackNavigationProp<StockStackParamList, 'StockItemDetail'>;
  route: RouteProp<StockStackParamList, 'StockItemDetail'>;
};

const fmt2 = (n: number) =>
  n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt3 = (n: number) =>
  n.toLocaleString('en-IN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

const avgWgt = (item: StockDetailItem): string => {
  if (!item.meter || !item.weight) return '0.000';
  return ((item.weight / item.meter) * 100).toFixed(3);
};

const detailTitle = (
  category: string,
  stockSource?: string,
): string => {
  if (category === 'nonIssue' || stockSource === 'gray') return 'Non Issue Gray Stock Details';
  if (category === 'beam' || stockSource === 'beam') return 'Non Issue Beam Stock Details';
  if (category === 'yarn') return 'Yarn Stock Details';
  return `${category.charAt(0).toUpperCase() + category.slice(1)} Stock Details`;
};

export const StockItemDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { itemName, lotNo, category, stockSource, reportType, commonCompany } = route.params;
  const { selectedCompany } = useCompanyStore();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cellFont = width < 360 ? 9 : 10;
  const footerFont = width < 360 ? 9 : 10;
  const [items, setItems] = useState<StockDetailItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Match list scope: Common Company ON → omit company= (all companies).
  const detailCompanyId = commonCompany ? undefined : selectedCompany?.id;

  useEffect(() => {
    let active = true;
    setLoading(true);
    stockApi
      .getCategoryDetails(itemName, lotNo, category, detailCompanyId, reportType, stockSource)
      .then((data) => {
        if (active) setItems(data);
      })
      .catch(() => {
        if (active) setItems([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [itemName, lotNo, category, detailCompanyId, reportType, stockSource]);

  const isGray = category === 'nonIssue' && stockSource === 'gray';
  const isBeam = category === 'beam' || stockSource === 'beam';

  const totalEntries = items.length;
  const totalNetWeight = items.reduce((sum, row) => sum + row.netWeight, 0);
  const totalCheese = items.reduce((sum, row) => sum + row.cheese, 0);
  const totalMeter = items.reduce((sum, row) => sum + (row.meter || 0), 0);
  const totalWeight = items.reduce((sum, row) => sum + (row.weight || 0), 0);

  const stackedCell = (top: string, bottom: string) => (
    <View style={styles.stackedCell}>
      <GridText fontSize={cellFont} numberOfLines={2}>
        {top || '—'}
      </GridText>
      {bottom ? (
        <Text style={[styles.stackedBottom, { fontSize: Math.max(8, cellFont - 1) }]} numberOfLines={1}>
          {bottom}
        </Text>
      ) : null}
    </View>
  );

  const partyDateCell = (item: StockDetailItem) => (
    <View style={styles.partyCell}>
      <GridText align="left" fontSize={cellFont} numberOfLines={3}>
        {item.partyName || '—'}
      </GridText>
      <Text style={[styles.stackedBottom, { fontSize: Math.max(8, cellFont - 1) }]} numberOfLines={1}>
        {toDDMMYYYY(item.date)}
      </Text>
    </View>
  );

  const yarnColumns: GridColumn<StockDetailItem>[] = useMemo(
    () => [
      {
        key: 'crtnNo',
        label: 'Crtn No',
        flex: 0.85,
        render: (item) => (
          <GridText fontSize={cellFont} numberOfLines={1}>
            {item.crtnNo || '—'}
          </GridText>
        ),
      },
      {
        key: 'netWeight',
        label: 'Net Weight',
        flex: 1,
        render: (item) => (
          <GridText fontSize={cellFont} numberOfLines={1}>
            {fmt3(item.netWeight)}
          </GridText>
        ),
      },
      {
        key: 'cheese',
        label: 'Cheese',
        flex: 0.7,
        render: (item) => (
          <GridText fontSize={cellFont} numberOfLines={1}>
            {item.cheese.toLocaleString('en-IN')}
          </GridText>
        ),
      },
      {
        key: 'grade',
        label: 'Grade\nTwist',
        flex: 0.85,
        render: (item) => stackedCell(item.grade || '—', item.twist || ''),
      },
      {
        key: 'lotNo',
        label: 'Lot No',
        flex: 1,
        render: (item) => (
          <GridText fontSize={cellFont} numberOfLines={2}>
            {item.lotNo || '—'}
          </GridText>
        ),
      },
      {
        key: 'partyName',
        label: 'Party Name\nDate',
        flex: 1.6,
        align: 'left',
        render: partyDateCell,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cellFont],
  );

  const grayColumns: GridColumn<StockDetailItem>[] = useMemo(
    () => [
      {
        key: 'crtnNo',
        label: 'Taka No',
        flex: 0.9,
        render: (item) => (
          <GridText fontSize={cellFont} numberOfLines={1}>
            {item.crtnNo || '—'}
          </GridText>
        ),
      },
      {
        key: 'meter',
        label: 'Meter',
        flex: 0.85,
        render: (item) => (
          <GridText fontSize={cellFont} numberOfLines={1}>
            {fmt2(item.meter || 0)}
          </GridText>
        ),
      },
      {
        key: 'weight',
        label: 'Weight',
        flex: 0.85,
        render: (item) => (
          <GridText fontSize={cellFont} numberOfLines={1}>
            {fmt3(item.weight || 0)}
          </GridText>
        ),
      },
      {
        key: 'avgWgt',
        label: 'Avg.wgt',
        flex: 0.8,
        render: (item) => (
          <GridText fontSize={cellFont} numberOfLines={1}>
            {avgWgt(item)}
          </GridText>
        ),
      },
      {
        key: 'mcNo',
        label: 'MC\nPallu',
        flex: 0.7,
        render: (item) => stackedCell(item.mcNo || '—', String(item.pallu ?? 0)),
      },
      {
        key: 'beamNo',
        label: 'Beam',
        flex: 0.75,
        render: (item) => (
          <GridText fontSize={cellFont} numberOfLines={1}>
            {item.beamNo || '—'}
          </GridText>
        ),
      },
      {
        key: 'partyName',
        label: 'Party\nDate',
        flex: 1.5,
        align: 'left',
        render: partyDateCell,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cellFont],
  );

  const beamColumns: GridColumn<StockDetailItem>[] = useMemo(
    () => [
      {
        key: 'crtnNo',
        label: 'Beam No',
        flex: 0.95,
        render: (item) => (
          <GridText fontSize={cellFont} numberOfLines={1}>
            {item.crtnNo || '—'}
          </GridText>
        ),
      },
      {
        key: 'meter',
        label: 'Meter',
        flex: 0.95,
        render: (item) => (
          <GridText fontSize={cellFont} numberOfLines={1}>
            {fmt2(item.meter || 0)}
          </GridText>
        ),
      },
      {
        key: 'weight',
        label: 'Weight',
        flex: 0.95,
        render: (item) => (
          <GridText fontSize={cellFont} numberOfLines={1}>
            {fmt3(item.weight || 0)}
          </GridText>
        ),
      },
      {
        key: 'lotNo',
        label: 'Lot No\nGrade',
        flex: 0.9,
        render: (item) => stackedCell(item.lotNo || '—', item.mark || item.grade || ''),
      },
      {
        key: 'pipeType',
        label: 'Pipe Type',
        flex: 1,
        render: (item) => (
          <GridText fontSize={cellFont} numberOfLines={2}>
            {item.pipeType || '—'}
          </GridText>
        ),
      },
      {
        key: 'partyName',
        label: 'Party Name\nDate',
        flex: 1.4,
        align: 'left',
        render: partyDateCell,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cellFont],
  );

  const columns = isBeam ? beamColumns : isGray ? grayColumns : yarnColumns;

  const footerCell = (flex: number, extra?: ViewStyle): ViewStyle => ({
    flex,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    ...extra,
  });

  const totalsPad = {
    paddingBottom: Math.max(insets.bottom, 8),
    paddingHorizontal: 4,
  };

  const renderTotals = () => {
    if (items.length === 0) return null;

    const valueProps = {
      style: [styles.totalsValue, { fontSize: footerFont }],
      numberOfLines: 2,
      adjustsFontSizeToFit: true,
      minimumFontScale: 0.65,
    };

    if (isGray || isBeam) {
      return (
        <View style={[styles.totalsRow, totalsPad]}>
          <View style={footerCell(0.9)}>
            <Text {...valueProps}>{totalEntries}</Text>
          </View>
          <View style={footerCell(1.1)}>
            <Text {...valueProps}>{fmt2(totalMeter)}</Text>
          </View>
          <View style={footerCell(1.1)}>
            <Text {...valueProps}>{fmt3(totalWeight)}</Text>
          </View>
          <View style={footerCell(isGray ? 3.5 : 3.0, { alignItems: 'flex-end' })}>
            <Text style={[styles.totalsLabel, { fontSize: footerFont }]} numberOfLines={1}>
              Total
            </Text>
          </View>
        </View>
      );
    }

    // Yarn
    return (
      <View style={[styles.totalsRow, totalsPad]}>
        <View style={footerCell(0.85)}>
          <Text {...valueProps}>{totalEntries}</Text>
        </View>
        <View style={footerCell(1.15)}>
          <Text {...valueProps}>{fmt3(totalNetWeight)}</Text>
        </View>
        <View style={footerCell(0.85)}>
          <Text {...valueProps}>{totalCheese.toLocaleString('en-IN')}</Text>
        </View>
        <View style={footerCell(3.15, { alignItems: 'flex-end' })}>
          <Text style={[styles.totalsLabel, { fontSize: footerFont }]} numberOfLines={1}>
            Total
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <GradientHeader
        title={detailTitle(category, stockSource)}
        onBack={() => navigation.goBack()}
      />
      <CompanyStrip />

      <View style={styles.itemBanner}>
        <View style={styles.itemAccent} />
        <Text style={styles.itemTitle} numberOfLines={2}>
          {itemName}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {loading && items.length === 0 ? (
          <TableSkeleton columns={columns as any} />
        ) : !loading && items.length === 0 ? (
          <EmptyState icon="package-variant" title="No stock details found" />
        ) : (
          <GridTable
            columns={columns}
            data={items}
            keyExtractor={(item) => item.id}
            alignRowsTop
            emptyText="No stock details found"
          />
        )}
      </ScrollView>

      {renderTotals()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  itemBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  itemAccent: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: Colors.textPrimary,
    marginRight: Spacing.sm,
    borderRadius: 2,
  },
  itemTitle: {
    flex: 1,
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  list: {
    paddingBottom: Spacing.md,
    flexGrow: 1,
  },
  stackedCell: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  partyCell: {
    alignItems: 'flex-start',
    width: '100%',
  },
  stackedBottom: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
  totalsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingTop: 8,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    width: '100%',
  },
  totalsLabel: {
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    paddingRight: Spacing.sm,
  },
  totalsValue: {
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    width: '100%',
  },
});
