import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { GridColumn, GridText } from '../../components/GridTable';
import { Colors, Typography } from '../../theme';
import type { MachineWiseDetailRow, MachineWiseSummaryRow } from '../../types';

const fmt = (n: number, digits = 2) =>
  n.toLocaleString('en-IN', { maximumFractionDigits: digits, minimumFractionDigits: 0 });

export const detailColumns: GridColumn<MachineWiseDetailRow>[] = [
  {
    key: 'mcNo',
    label: 'MC No\nName',
    flex: 1.1,
    align: 'left',
    render: (row) => (
      <View style={styles.stacked}>
        <Text style={styles.top}>{row.mcNo || '—'}</Text>
        <Text style={styles.bottom}>{row.mcName || '—'}</Text>
      </View>
    ),
  },
  {
    key: 'beamNo',
    label: 'Beam No\nDate',
    flex: 1.1,
    align: 'left',
    render: (row) => (
      <View style={styles.stacked}>
        <Text style={styles.top}>{row.beamNo || '—'}</Text>
        <Text style={styles.bottom}>{row.beamDate || '—'}</Text>
      </View>
    ),
  },
  {
    key: 'statusLabel',
    label: 'Status',
    flex: 0.9,
    render: (row) => <GridText color={Colors.primary} bold>{row.statusLabel || '—'}</GridText>,
  },
  {
    key: 'partyName',
    label: 'Party',
    flex: 1.4,
    align: 'left',
    render: (row) => <GridText align="left">{row.partyName || '—'}</GridText>,
  },
  {
    key: 'meter',
    label: 'Meter\nBal Mtr',
    flex: 1,
    align: 'right',
    render: (row) => (
      <View style={[styles.stacked, styles.end]}>
        <Text style={styles.top}>{fmt(row.meter)}</Text>
        <Text style={styles.bottom}>{fmt(row.balMeter)}</Text>
      </View>
    ),
  },
  {
    key: 'taka',
    label: 'Taka\nBal Taka',
    flex: 0.9,
    align: 'right',
    render: (row) => (
      <View style={[styles.stacked, styles.end]}>
        <Text style={styles.top}>{fmt(row.taka, 0)}</Text>
        <Text style={styles.bottom}>{fmt(row.balTaka, 0)}</Text>
      </View>
    ),
  },
];

export const summaryColumns: GridColumn<MachineWiseSummaryRow>[] = [
  {
    key: 'groupLabel',
    label: 'Group',
    flex: 1.6,
    align: 'left',
    render: (row) => <GridText align="left" bold>{row.groupLabel || '—'}</GridText>,
  },
  {
    key: 'beamCount',
    label: 'Beams',
    flex: 0.7,
    align: 'right',
    render: (row) => <GridText align="right">{fmt(row.beamCount, 0)}</GridText>,
  },
  {
    key: 'meter',
    label: 'Meter\nBal Mtr',
    flex: 1,
    align: 'right',
    render: (row) => (
      <View style={[styles.stacked, styles.end]}>
        <Text style={styles.top}>{fmt(row.meter)}</Text>
        <Text style={styles.bottom}>{fmt(row.balMeter)}</Text>
      </View>
    ),
  },
  {
    key: 'taka',
    label: 'Taka\nBal Taka',
    flex: 0.9,
    align: 'right',
    render: (row) => (
      <View style={[styles.stacked, styles.end]}>
        <Text style={styles.top}>{fmt(row.taka, 0)}</Text>
        <Text style={styles.bottom}>{fmt(row.balTaka, 0)}</Text>
      </View>
    ),
  },
  {
    key: 'weight',
    label: 'Weight',
    flex: 0.8,
    align: 'right',
    render: (row) => <GridText align="right">{fmt(row.weight)}</GridText>,
  },
];

const styles = StyleSheet.create({
  stacked: { alignItems: 'flex-start', justifyContent: 'center' },
  end: { alignItems: 'flex-end' },
  top: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textPrimary,
  },
  bottom: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
