import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { GradientHeader } from '../../components/GradientHeader';
import { SearchBar } from '../../components/SearchBar';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { GridTable } from '../../components/GridTable';
import { CompanyStrip } from '../../components/CompanyStrip';
import { machineWiseApi } from '../../services/api';
import { useCompanyStore } from '../../store/companyStore';
import { Colors, Typography, Spacing } from '../../theme';
import { detailColumns, summaryColumns } from './machineWiseColumns';
import type {
  MachineWiseDetailRow,
  MachineWiseStackParamList,
  MachineWiseSummaryRow,
} from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<MachineWiseStackParamList, 'MachineWiseReport'>;
  route: RouteProp<MachineWiseStackParamList, 'MachineWiseReport'>;
};

const REPORT_LABELS: Record<string, string> = {
  machine: 'Machine Wise',
  party: 'Party Wise',
  job_party: 'Job Party Wise',
  beam: 'Beam Wise',
  g_quality: 'G.Quality Wise',
  job_party_g_quality: 'Job Party + G.Quality',
  ends: 'Ends Wise',
};

export const MachineWiseReportScreen: React.FC<Props> = ({ navigation, route }) => {
  const { selectedCompany } = useCompanyStore();
  const filter = route.params.filter;
  const isSummary = filter.view === 'summary';

  const [detailRows, setDetailRows] = useState<MachineWiseDetailRow[]>([]);
  const [summaryRows, setSummaryRows] = useState<MachineWiseSummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    const companyId = String(selectedCompany?.recordId || selectedCompany?.id || filter.companyId || '');
    const requestFilter = { ...filter, companyId };

    const load = isSummary
      ? machineWiseApi.getSummary(requestFilter).then((rows) => {
          if (!alive) return;
          setSummaryRows(rows);
          setDetailRows([]);
        })
      : machineWiseApi.getDetail(requestFilter).then((rows) => {
          if (!alive) return;
          setDetailRows(rows);
          setSummaryRows([]);
        });

    load
      .catch((err: unknown) => {
        if (!alive) return;
        setDetailRows([]);
        setSummaryRows([]);
        setError(err instanceof Error ? err.message : 'Failed to load report');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [filter, isSummary, selectedCompany?.recordId, selectedCompany?.id]);

  const lower = search.toLowerCase().trim();

  const filteredDetail = useMemo(() => {
    if (!lower) return detailRows;
    return detailRows.filter(
      (r) =>
        r.mcNo.toLowerCase().includes(lower) ||
        r.mcName.toLowerCase().includes(lower) ||
        r.beamNo.toLowerCase().includes(lower) ||
        r.partyName.toLowerCase().includes(lower) ||
        r.jobPartyName.toLowerCase().includes(lower) ||
        r.gQualityName.toLowerCase().includes(lower) ||
        r.statusLabel.toLowerCase().includes(lower),
    );
  }, [detailRows, lower]);

  const filteredSummary = useMemo(() => {
    if (!lower) return summaryRows;
    return summaryRows.filter(
      (r) =>
        r.groupLabel.toLowerCase().includes(lower) ||
        r.groupKey.toLowerCase().includes(lower),
    );
  }, [summaryRows, lower]);

  const totals = useMemo(() => {
    if (isSummary) {
      return filteredSummary.reduce(
        (acc, row) => ({
          beams: acc.beams + row.beamCount,
          meter: acc.meter + row.meter,
          balMeter: acc.balMeter + row.balMeter,
          taka: acc.taka + row.taka,
          balTaka: acc.balTaka + row.balTaka,
        }),
        { beams: 0, meter: 0, balMeter: 0, taka: 0, balTaka: 0 },
      );
    }
    return filteredDetail.reduce(
      (acc, row) => ({
        beams: acc.beams + 1,
        meter: acc.meter + row.meter,
        balMeter: acc.balMeter + row.balMeter,
        taka: acc.taka + row.taka,
        balTaka: acc.balTaka + row.balTaka,
      }),
      { beams: 0, meter: 0, balMeter: 0, taka: 0, balTaka: 0 },
    );
  }, [filteredDetail, filteredSummary, isSummary]);

  const subtitle = `${REPORT_LABELS[filter.reportType] ?? filter.reportType} · ${
    isSummary ? 'Summary' : 'Detail'
  }`;

  return (
    <View style={styles.container}>
      <GradientHeader title="Machine Wise Beam Stock" subtitle={subtitle} onBack={() => navigation.goBack()} />
      <CompanyStrip />

      <View style={styles.searchWrapper}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={isSummary ? 'Search group…' : 'Search MC, beam, party…'}
        />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>
            {totals.beams} beams · Mtr {totals.meter.toLocaleString('en-IN', { maximumFractionDigits: 0 })} · Bal{' '}
            {totals.balMeter.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </Text>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <View style={styles.tableWrapper}>
        {isSummary ? (
          <GridTable
            columns={summaryColumns}
            data={filteredSummary}
            keyExtractor={(item) => item.id}
            emptyText="No summary rows found"
          />
        ) : (
          <GridTable
            columns={detailColumns}
            data={filteredDetail}
            keyExtractor={(item) => item.id}
            emptyText="No beam stock rows found"
          />
        )}
      </View>
      <LoadingOverlay visible={loading} message="Loading report..." />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchWrapper: { padding: Spacing.md, paddingBottom: Spacing.sm },
  totalRow: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  totalLabel: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textSecondary,
  },
  errorText: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSizes.sm,
    color: Colors.danger,
  },
  tableWrapper: {
    flex: 1,
    paddingBottom: Spacing.md,
  },
});
