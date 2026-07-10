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
import { Card } from '../../components/Card';
import { Badge, getDaysBadgeVariant } from '../../components/Badge';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { InterestCalculatorModal, toInterestBill } from '../../components/InterestCalculatorModal';
import { salesOsApi } from '../../services/api';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import type { SalesOsStackParamList, SalesOsParty, SalesOsInvoice } from '../../types';
import { formatCurrency } from '../../utils/currency';

type Props = {
  navigation: NativeStackNavigationProp<SalesOsStackParamList, 'SalesOsPartyDetail'>;
  route: RouteProp<SalesOsStackParamList, 'SalesOsPartyDetail'>;
};


export const SalesOsPartyDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { partyId, partyName, onlyDue } = route.params;
  const [party, setParty] = useState<SalesOsParty | undefined>(undefined);
  const [invoices, setInvoices] = useState<SalesOsInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [calcVisible, setCalcVisible] = useState(false);

  useEffect(() => {
    salesOsApi.getPartyById(partyId).then(setParty);
    salesOsApi.getPartyInvoices(partyId).then((data) => {
      setInvoices(data);
      setLoading(false);
    })
      .catch(() => setLoading(false));
  }, [partyId]);

  // "Only Due" (passed from the summary list) → show only overdue invoices.
  const visibleInvoices = onlyDue ? invoices.filter((i) => i.daysLeft < 0) : invoices;

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

  const handleShare = async () => {
    if (!party) return;
    await Share.share({
      message: `Sales Outstanding Report\n\nParty: ${party.name}\nCity: ${party.city}\nTotal OS: ${formatCurrency(party.totalOs)}\nInvoices: ${party.invoiceCount}\nDays Overdue: ${party.daysOverdue}`,
    });
  };

  if (!party) return <LoadingOverlay visible message="Loading..." />;

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

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Overdue Badge */}
        <View style={styles.badgeRow}>
          <Badge
            label={party.daysOverdue > 0 ? `${party.daysOverdue} days overdue` : 'No overdue'}
            variant={getDaysBadgeVariant(party.daysOverdue)}
          />
        </View>

        {/* Summary Grid */}
        <Card style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Summary</Text>
          <View style={styles.grid}>
            {[
              { label: 'Total Outstanding', value: formatCurrency(party.totalOs), icon: 'currency-inr', color: Colors.gradientStart },
              { label: 'Invoices', value: String(party.invoiceCount), icon: 'file-document-multiple', color: Colors.info },
              { label: 'Last Payment', value: party.lastPayment, icon: 'calendar-check', color: Colors.success },
              { label: 'Credit Limit', value: formatCurrency(party.creditLimit ?? 0), icon: 'credit-card-outline', color: Colors.warning },
            ].map((item) => (
              <View key={item.label} style={styles.gridItem}>
                <View style={[styles.gridIcon, { backgroundColor: item.color + '20' }]}>
                  <Icon name={item.icon} size={18} color={item.color} />
                </View>
                <Text style={styles.gridValue}>{item.value}</Text>
                <Text style={styles.gridLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </Card>

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

        {/* Pending Invoices */}
        <Card style={styles.invoicesCard}>
          <View style={styles.invoicesHeader}>
            <Text style={styles.cardTitle}>
              {onlyDue ? 'Due Invoices' : 'Pending Invoices'} ({visibleInvoices.length})
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
          {visibleInvoices.map((inv) => {
            const paidPct = Math.min(100, Math.round(((inv.amount - inv.outstanding) / inv.amount) * 100));
            const checked = selectedIds.includes(inv.id);
            return (
              <TouchableOpacity key={inv.id} style={styles.invoiceItem} onPress={() => toggleBill(inv.id)} activeOpacity={0.7}>
                <View style={styles.invHeader}>
                  <View style={styles.invNumberRow}>
                    <Icon
                      name={checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
                      size={20}
                      color={checked ? Colors.gradientStart : Colors.gray400}
                    />
                    <Text style={styles.invNumber}>{inv.number}</Text>
                  </View>
                  <Badge
                    label={inv.daysLeft < 0 ? `${Math.abs(inv.daysLeft)}d overdue` : `${inv.daysLeft}d left`}
                    variant={inv.daysLeft < 0 ? 'overdue' : inv.daysLeft < 7 ? 'warning' : 'ok'}
                  />
                </View>
                <View style={styles.invDetails}>
                  <Text style={styles.invDate}>{inv.date}</Text>
                  <View style={styles.invAmounts}>
                    <Text style={styles.invTotal}>₹{(inv.amount / 100000).toFixed(1)}L</Text>
                    <Text style={styles.invOs}>{formatCurrency(inv.outstanding)} OS</Text>
                  </View>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${paidPct}%` }]} />
                </View>
                <Text style={styles.progressText}>{paidPct}% paid</Text>
              </TouchableOpacity>
            );
          })}

          {/* Selected total + Interest Calculation */}
          <View style={styles.selectedRow}>
            <Text style={styles.selectedLabel}>Selected Bill Total</Text>
            <Text style={styles.selectedValue}>{formatCurrency(selectedTotal)}</Text>
          </View>
          <TouchableOpacity style={styles.interestBtn} onPress={openCalculator} activeOpacity={0.85}>
            <Icon name="calculator-variant-outline" size={18} color={Colors.textWhite} />
            <Text style={styles.interestBtnText}>Interest Calculation</Text>
          </TouchableOpacity>
        </Card>

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
  invoicesCard: { marginBottom: Spacing.md },
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
