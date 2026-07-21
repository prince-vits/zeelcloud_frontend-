import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ZIcon as Icon } from '../../components/ZIcon';
import { GradientHeader } from '../../components/GradientHeader';
import { CompanyStrip } from '../../components/CompanyStrip';
import { Card } from '../../components/Card';
import { Badge, getDaysBadgeVariant } from '../../components/Badge';
import { GridTable, GridColumn, GridText } from '../../components/GridTable';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { InterestCalculatorModal, toInterestBill } from '../../components/InterestCalculatorModal';
import { salesOsApi } from '../../services/api';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import type { SalesOsStackParamList, SalesOsParty, SalesOsInvoice } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { toDDMMYY } from '../../utils/formatDate';

type Props = {
  navigation: NativeStackNavigationProp<SalesOsStackParamList, 'SalesOsPartyDetail'>;
  route: RouteProp<SalesOsStackParamList, 'SalesOsPartyDetail'>;
};


export const SalesOsPartyDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { partyId, partyName, filter } = route.params;
  const [party, setParty] = useState<SalesOsParty | undefined>(undefined);
  const [invoices, setInvoices] = useState<SalesOsInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [calcVisible, setCalcVisible] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      salesOsApi.getPartyById(partyId, filter),
      salesOsApi.getPartyInvoices(partyId, filter),
    ])
      .then(([partyData, invoiceData]) => {
        setParty(partyData ?? {
          id: partyId,
          name: partyName,
          city: '',
          totalOs: invoiceData.reduce((sum, inv) => sum + inv.outstanding, 0),
          invoiceCount: invoiceData.length,
          daysOverdue: 0,
          lastPayment: '',
        });
        setInvoices(invoiceData);
      })
      .finally(() => setLoading(false));
  }, [partyId, partyName, filter]);

  // "Only Due" (passed from the summary list) → show only overdue invoices.
  const visibleInvoices = filter.onlyDue ? invoices.filter((i) => i.daysLeft < 0) : invoices;

  const toggleBill = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleSelectAll = () =>
    setSelectedIds((prev) => (prev.length === visibleInvoices.length ? [] : visibleInvoices.map((i) => i.id)));

  const selectedInvoices = visibleInvoices.filter((i) => selectedIds.includes(i.id));
  const selectedTotal = selectedInvoices.reduce((sum, i) => sum + i.outstanding, 0);

  const openCalculator = () => {
    if (selectedInvoices.length === 0) {
      Alert.alert('Alert', 'Please select a bill for interest calculation.');
      return;
    }
    setCalcVisible(true);
  };

  const interestBills = selectedInvoices.map((inv) => toInterestBill(inv).bill);
  const firstTermDays = selectedInvoices.length ? toInterestBill(selectedInvoices[0]).termDays : 30;

  // OG summary: broker comes from the party's bills (vv_brocker_name).
  const brokerName = invoices.find((i) => i.brokerName)?.brokerName;

  // OG .NET grid (SalesOsPartyDetailPage): ✓ | Ref Cmp | Book Code | Bill No |
  // Date | Terms | Total Due | Due Days | Amount — fixed 30/35px + star columns,
  // everything fits the screen width (no horizontal scroll).
  const billColumns: GridColumn<SalesOsInvoice>[] = [
    {
      key: 'sel', label: '', width: 30,
      render: (inv) => (
        <Icon
          name={selectedIds.includes(inv.id) ? 'checkbox-marked' : 'checkbox-blank-outline'}
          size={17}
          color={selectedIds.includes(inv.id) ? Colors.gradientStart : Colors.gray400}
        />
      ),
    },
    { key: 'companyRef', label: 'Cmp', width: 38 },
    { key: 'bookCode', label: 'Book', width: 42 },
    { key: 'number', label: 'Bill No', flex: 1, render: (inv) => <GridText bold>{inv.number}</GridText> },
    { key: 'date', label: 'Date', flex: 1.1, render: (inv) => <GridText>{toDDMMYY(inv.date)}</GridText> },
    { key: 'termDays', label: 'Terms', width: 38, render: (inv) => <GridText>{String(inv.termDays ?? 0)}</GridText> },
    { key: 'totalDueDays', label: 'Total Due', width: 42, render: (inv) => <GridText>{String(inv.totalDueDays ?? 0)}</GridText> },
    {
      key: 'dueDays', label: 'Due Days', width: 42,
      render: (inv) => (
        <GridText bold color={-inv.daysLeft > 0 ? Colors.danger : Colors.success}>
          {String(-inv.daysLeft)}
        </GridText>
      ),
    },
    { key: 'outstanding', label: 'Amount', flex: 1.4, render: (inv) => <GridText>{`₹${inv.outstanding.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}</GridText> },
  ];

  const handleShare = async () => {
    if (!party) return;
    await Share.share({
      message: `Sales Outstanding Report\n\nParty: ${party.name}\nCity: ${party.city}\nTotal OS: ${formatCurrency(party.totalOs)}\nInvoices: ${party.invoiceCount}\nDays Overdue: ${party.daysOverdue}`,
    });
  };

  if (loading || !party) return <LoadingOverlay visible message="Loading..." />;

  return (
    <View style={styles.container}>
      <GradientHeader
        title={partyName}
        subtitle={party.city}
        onBack={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn} activeOpacity={0.8}>
            <Icon name="share-variant" size={18} color={Colors.textWhite} />
          </TouchableOpacity>
        }
      />

      <CompanyStrip />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* OG-style summary header (ported from SalesOsPartyDetailPage's blue frame):
            party, address, broker, date range, Total O/s — only real data, no
            empty tiles. */}
        <View style={styles.ogSummary}>
          <Text style={styles.ogParty}>{party.name}</Text>
          {party.city ? <Text style={styles.ogAddress}>{party.city}</Text> : null}
          <Text style={styles.ogLine}>Broker : {brokerName || 'DIRECT'}</Text>
          {filter?.fromDate || filter?.toDate ? (
            <Text style={styles.ogLine}>
              From {toDDMMYY(filter.fromDate)}   To {toDDMMYY(filter.toDate)}
            </Text>
          ) : null}
          <Text style={styles.ogTotal}>Total O/s : {formatCurrency(party.totalOs)}</Text>
          <Text style={styles.ogSub}>{party.invoiceCount} bills</Text>
        </View>

        {/* Contact */}
        {party.phone && (
          <Card style={styles.contactCard}>
            <Text style={styles.cardTitle}>Contact</Text>
            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => Alert.alert('Call', `Calling ${party.phone}`)}
              activeOpacity={0.8}
            >
              <View style={styles.contactIcon}>
                <Icon name="phone" size={18} color={Colors.success} />
              </View>
              <Text style={styles.contactValue}>{party.phone}</Text>
              <Icon name="chevron-right" size={16} color={Colors.gray400} />
            </TouchableOpacity>
          </Card>
        )}

        {/* Pending Invoices — full-bleed table section (no card, edge-to-edge) */}
        <View style={styles.invoicesSection}>
          <View style={[styles.invoicesHeader, styles.sectionPad]}>
            <Text style={styles.cardTitle}>
              {filter?.onlyDue ? 'Due Invoices' : 'Pending Invoices'} ({visibleInvoices.length})
            </Text>
            {visibleInvoices.length > 0 ? (
              <TouchableOpacity style={styles.selectAll} onPress={toggleSelectAll} activeOpacity={0.7}>
                <Icon
                  name={selectedIds.length === visibleInvoices.length ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={18}
                  color={Colors.gradientStart}
                />
                <Text style={styles.selectAllText}>Select All</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <GridTable
            columns={billColumns}
            data={visibleInvoices}
            keyExtractor={(inv, idx) => `${inv.id}-${idx}`}
            onRowPress={(inv) => toggleBill(inv.id)}
            rowStyle={(inv) => (selectedIds.includes(inv.id) ? styles.rowSelected : undefined)}
            emptyText="No pending invoices"
          />

          {/* Selected total + Interest Calculation */}
          <View style={[styles.selectedRow, styles.sectionPad]}>
            <Text style={styles.selectedLabel}>Selected Bill Total</Text>
            <Text style={styles.selectedValue}>{formatCurrency(selectedTotal)}</Text>
          </View>
          <TouchableOpacity style={[styles.interestBtn, styles.interestBtnPad]} onPress={openCalculator} activeOpacity={0.85}>
            <Icon name="calculator-variant-outline" size={18} color={Colors.textWhite} />
            <Text style={styles.interestBtnText}>Interest Calculation</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.callBtn]}
            onPress={() => Alert.alert('Call', `Calling ${party.name}`)}
            activeOpacity={0.85}
          >
            <Icon name="phone" size={20} color={Colors.textWhite} />
            <Text style={styles.actionBtnText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.shareActionBtn]}
            onPress={handleShare}
            activeOpacity={0.85}
          >
            <Icon name="share-variant" size={20} color={Colors.gradientStart} />
            <Text style={[styles.actionBtnText, { color: Colors.gradientStart }]}>Share Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <InterestCalculatorModal
        visible={calcVisible}
        bills={interestBills}
        defaultDueDays={firstTermDays}
        onClose={() => setCalcVisible(false)}
      />
      <LoadingOverlay visible={loading} message="Loading invoices..." />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xl },
  shareBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeRow: { marginBottom: Spacing.md },
  summaryCard: { marginBottom: Spacing.md },
  cardTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  gridItem: {
    width: '47%',
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'flex-start',
  },
  gridIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  gridValue: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  gridLabel: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
  },
  contactCard: { marginBottom: Spacing.md, padding: Spacing.md },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  contactIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactValue: {
    flex: 1,
    fontSize: Typography.fontSizes.base,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.medium,
  },
  // OG-style summary header block (light blue, like the .NET Blue400Accent frame).
  ogSummary: {
    backgroundColor: '#E7F0FE',
    marginHorizontal: -Spacing.md,
    marginTop: -Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  ogParty: { fontSize: Typography.fontSizes.md, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  ogAddress: { fontSize: Typography.fontSizes.sm, fontStyle: 'italic', color: Colors.textSecondary, marginTop: 2 },
  ogLine: { fontSize: Typography.fontSizes.sm, fontWeight: Typography.fontWeights.semiBold, color: Colors.textPrimary, marginTop: 4 },
  ogTotal: { fontSize: Typography.fontSizes.md, fontWeight: Typography.fontWeights.bold, color: Colors.gradientStart, marginTop: 6 },
  ogSub: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  // Full-bleed table section: cancels the ScrollView's horizontal padding so the
  // grid uses the entire screen width (client: "data feels congested").
  invoicesSection: {
    backgroundColor: Colors.surface,
    marginHorizontal: -Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionPad: { paddingHorizontal: Spacing.md },
  interestBtnPad: { marginHorizontal: Spacing.md },
  rowSelected: { backgroundColor: Colors.purple100 },
  invoicesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectAll: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  selectAllText: { fontSize: Typography.fontSizes.xs, color: Colors.gradientStart, fontWeight: Typography.fontWeights.semiBold },
  invoiceItem: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
  },
  invHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  invNumberRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  invNumber: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textPrimary,
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  selectedLabel: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, fontWeight: Typography.fontWeights.medium },
  selectedValue: { fontSize: Typography.fontSizes.md, fontWeight: Typography.fontWeights.bold, color: Colors.gradientStart },
  interestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.gradientStart,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
  },
  interestBtnText: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.semiBold, color: Colors.textWhite },
  invDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  invDate: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
  },
  invAmounts: { flexDirection: 'row', gap: Spacing.md },
  invTotal: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
  },
  invOs: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.danger,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.gray200,
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 3,
  },
  progressText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  callBtn: {
    backgroundColor: Colors.success,
  },
  shareActionBtn: {
    backgroundColor: Colors.purple100,
    borderWidth: 1.5,
    borderColor: Colors.gradientStart,
  },
  actionBtnText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textWhite,
  },
});
