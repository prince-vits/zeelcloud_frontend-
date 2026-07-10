import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet, Alert, Share } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ZIcon as Icon } from '../../components/ZIcon';
import { GradientHeader } from '../../components/GradientHeader';
import { Card } from '../../components/Card';
import { Badge, getDaysBadgeVariant } from '../../components/Badge';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { InterestCalculatorModal, toInterestBill } from '../../components/InterestCalculatorModal';
import { gpOsApi } from '../../services/api';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import type { GpOsStackParamList, GpOsParty, GpOsInvoice } from '../../types';
import { formatCurrency } from '../../utils/currency';

type Props = {
  navigation: NativeStackNavigationProp<GpOsStackParamList, 'GpOsPartyDetail'>;
  route: RouteProp<GpOsStackParamList, 'GpOsPartyDetail'>;
};

// Adapter: bridge GP invoice fields → the shape toInterestBill() expects.
const gpInvoiceToInterestInput = (inv: GpOsInvoice) => ({
  id: inv.id,
  outstanding: inv.balance,             // Vn_balance → "outstanding"
  amount: inv.balance,                  // same as outstanding for GP
  daysLeft: -inv.dueDays,               // due_days positive when overdue; daysLeft negative when overdue
  totalDueDays: inv.totalDueDays,       // Total_due_days → direct map
  termDays: inv.termDays,               // Vn_due_days → direct map
  amountBeforeGst: inv.amountBeforeGst, // VN_Amount_Befor_Gst → direct map
});

export const GpOsPartyDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { partyId, partyName } = route.params;
  const [party, setParty] = useState<GpOsParty | undefined>(undefined);
  const [invoices, setInvoices] = useState<GpOsInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [calcVisible, setCalcVisible] = useState(false);
  // "Only Due" is passed from the list screen and can also be toggled here.
  const [onlyDue, setOnlyDue] = useState(route.params.onlyDue ?? false);

  useEffect(() => {
    gpOsApi.getPartyById(partyId).then(setParty);
    gpOsApi.getPartyInvoices(partyId).then((data) => {
      setInvoices(data);
      setLoading(false);
    })
      .catch(() => setLoading(false));
  }, [partyId]);

  // "Only Due" → show only overdue bills (due_days > 0).
  const visibleInvoices = onlyDue ? invoices.filter((i) => i.dueDays > 0) : invoices;

  const toggleBill = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleSelectAll = () =>
    setSelectedIds((prev) => (prev.length === visibleInvoices.length ? [] : visibleInvoices.map((i) => i.id)));

  const selectedInvoices = visibleInvoices.filter((i) => selectedIds.includes(i.id));
  const selectedTotal = selectedInvoices.reduce((sum, i) => sum + i.balance, 0);

  const interestBills = selectedInvoices.map((inv) => toInterestBill(gpInvoiceToInterestInput(inv)).bill);
  const firstTermDays = selectedInvoices.length
    ? toInterestBill(gpInvoiceToInterestInput(selectedInvoices[0])).termDays
    : 30;

  const openCalculator = () => {
    if (selectedInvoices.length === 0) {
      Alert.alert('Alert', 'Please, Select Bill For Interest Calculation');
      return;
    }
    setCalcVisible(true);
  };

  const handleShare = async () => {
    if (!party) return;
    const lines = visibleInvoices
      .map((inv) => `${inv.billNo} | ${inv.billDate} | ${formatCurrency(inv.balance)}`)
      .join('\n');
    await Share.share({
      message:
        `GP Outstanding Report\n` +
        `Party: ${party.name}\n` +
        `Address: ${party.address}\n` +
        `Total O/S: ${formatCurrency(party.totalOs)}\n\n` +
        `Bill Details:\n${lines}`,
    });
  };

  if (!party) return <LoadingOverlay visible message="Loading..." />;

  return (
    <View style={styles.container}>
      <GradientHeader
        title={partyName}
        subtitle={party.address}
        onBack={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
            <Icon name="whatsapp" size={18} color={Colors.textWhite} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.badgeRow}>
          <Badge
            label={party.daysOverdue > 0 ? `${party.daysOverdue} days overdue` : 'No overdue'}
            variant={getDaysBadgeVariant(party.daysOverdue)}
          />
        </View>

        {/* Summary */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Summary</Text>
          <View style={styles.grid}>
            {[
              { label: 'Total OS', value: formatCurrency(party.totalOs), icon: 'currency-inr', color: Colors.gradientEnd },
              { label: 'Invoices', value: String(party.invoiceCount), icon: 'file-document-multiple', color: Colors.info },
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
          <Card style={styles.card}>
            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => Alert.alert('Call', `Calling ${party.phone}`)}
            >
              <Icon name="phone" size={18} color={Colors.success} />
              <Text style={styles.phone}>{party.phone}</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Bills */}
        <Card style={styles.card}>
          <View style={styles.invoicesHeader}>
            <Text style={styles.cardTitle}>
              {onlyDue ? 'Due Invoices' : 'Pending Invoices'} ({visibleInvoices.length})
            </Text>
            <View style={styles.onlyDueToggle}>
              <Text style={styles.onlyDueLabel}>Only Due</Text>
              <Switch
                value={onlyDue}
                onValueChange={setOnlyDue}
                trackColor={{ false: Colors.gray300, true: Colors.gradientEnd }}
                thumbColor={Colors.surface}
                ios_backgroundColor={Colors.gray300}
                style={styles.switch}
              />
            </View>
          </View>

          {visibleInvoices.length > 0 ? (
            <TouchableOpacity style={styles.selectAll} onPress={toggleSelectAll} activeOpacity={0.7}>
              <Icon
                name={selectedIds.length === visibleInvoices.length ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={18}
                color={Colors.gradientEnd}
              />
              <Text style={styles.selectAllText}>Select All</Text>
            </TouchableOpacity>
          ) : null}

          {visibleInvoices.length === 0 ? (
            <Text style={styles.noInvoices}>No pending invoices</Text>
          ) : visibleInvoices.map((inv) => {
            const checked = selectedIds.includes(inv.id);
            const overdue = inv.dueDays > 0;
            const meta: { label: string; value: string; color?: string }[] = [
              { label: 'Ref Cmp', value: inv.companyRef },
              { label: 'Book Code', value: inv.bookCode },
              { label: 'Bill Date', value: inv.billDate },
              { label: 'Terms Days', value: String(inv.termDays) },
              { label: 'Total Due', value: String(inv.totalDueDays) },
              { label: 'Due Days', value: String(inv.dueDays), color: overdue ? Colors.danger : Colors.success },
            ];
            return (
              <TouchableOpacity key={inv.id} style={styles.invoiceItem} onPress={() => toggleBill(inv.id)} activeOpacity={0.7}>
                <View style={styles.invHeader}>
                  <View style={styles.invNumberRow}>
                    <Icon
                      name={checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
                      size={20}
                      color={checked ? Colors.gradientEnd : Colors.gray400}
                    />
                    <Text style={styles.billNo}>{inv.billNo}</Text>
                  </View>
                  <View style={[styles.dueBadge, { backgroundColor: (overdue ? Colors.danger : Colors.success) + '1A' }]}>
                    <Text style={[styles.dueBadgeText, { color: overdue ? Colors.danger : Colors.success }]}>
                      {overdue ? `${inv.dueDays}d overdue` : 'Within terms'}
                    </Text>
                  </View>
                </View>

                <View style={styles.metaGrid}>
                  {meta.map((m) => (
                    <View key={m.label} style={styles.metaItem}>
                      <Text style={styles.metaLabel}>{m.label}</Text>
                      <Text style={[styles.metaValue, m.color ? { color: m.color } : null]}>{m.value}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Amount</Text>
                  <Text style={styles.amountValue}>{formatCurrency(inv.balance)}</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {visibleInvoices.length > 0 ? (
            <>
              <View style={styles.selectedRow}>
                <Text style={styles.selectedLabel}>Selected Bill Total</Text>
                <Text style={styles.selectedValue}>{formatCurrency(selectedTotal)}</Text>
              </View>
              <TouchableOpacity style={styles.interestBtn} onPress={openCalculator} activeOpacity={0.85}>
                <Icon name="calculator-variant-outline" size={18} color={Colors.textWhite} />
                <Text style={styles.interestBtnText}>Interest Calculation</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </Card>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.success }]}
            onPress={() => Alert.alert('Call', `Calling ${party.name}`)}
          >
            <Icon name="phone" size={20} color={Colors.textWhite} />
            <Text style={styles.actionBtnText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.purple100, borderWidth: 1.5, borderColor: Colors.gradientEnd }]}
            onPress={handleShare}
          >
            <Icon name="share-variant" size={20} color={Colors.gradientEnd} />
            <Text style={[styles.actionBtnText, { color: Colors.gradientEnd }]}>Share</Text>
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
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  badgeRow: { marginBottom: Spacing.md },
  card: { marginBottom: Spacing.md },
  cardTitle: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  grid: { flexDirection: 'row', gap: Spacing.sm },
  gridItem: { flex: 1, backgroundColor: Colors.gray50, borderRadius: BorderRadius.md, padding: Spacing.md },
  gridIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm },
  gridValue: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  gridLabel: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  phone: { fontSize: Typography.fontSizes.base, color: Colors.textPrimary, fontWeight: Typography.fontWeights.medium },

  invoicesHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  onlyDueToggle: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  onlyDueLabel: { fontSize: Typography.fontSizes.xs, fontWeight: Typography.fontWeights.bold, color: Colors.textSecondary },
  switch: { transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] },
  selectAll: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginBottom: Spacing.sm },
  selectAllText: { fontSize: Typography.fontSizes.xs, color: Colors.gradientEnd, fontWeight: Typography.fontWeights.semiBold },

  invoiceItem: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm, marginTop: Spacing.sm },
  invHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  invNumberRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  billNo: { fontSize: Typography.fontSizes.sm, fontWeight: Typography.fontWeights.bold, color: Colors.gradientEnd },
  dueBadge: { borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  dueBadgeText: { fontSize: Typography.fontSizes.xs, fontWeight: Typography.fontWeights.semiBold },

  metaGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  metaItem: { width: '33.33%', paddingVertical: 5 },
  metaLabel: { fontSize: 10, color: Colors.textSecondary, marginBottom: 1 },
  metaValue: { fontSize: Typography.fontSizes.sm, fontWeight: Typography.fontWeights.semiBold, color: Colors.textPrimary },

  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  amountLabel: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary },
  amountValue: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.bold, color: Colors.danger },

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
  selectedValue: { fontSize: Typography.fontSizes.md, fontWeight: Typography.fontWeights.bold, color: Colors.gradientEnd },
  interestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.gradientEnd,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
  },
  interestBtnText: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.semiBold, color: Colors.textWhite },

  noInvoices: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, textAlign: 'center', padding: Spacing.md },
  actions: { flexDirection: 'row', gap: Spacing.md },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: Spacing.md, borderRadius: BorderRadius.md, gap: Spacing.sm,
  },
  actionBtnText: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.semiBold, color: Colors.textWhite },
});
