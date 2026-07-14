import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ZIcon as Icon } from '../../components/ZIcon';
import { GradientHeader } from '../../components/GradientHeader';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { InterestCalculatorModal, toInterestBill } from '../../components/InterestCalculatorModal';
import { salesOsApi } from '../../services/api';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import type { SalesOsStackParamList, SalesOsPartyGroup, SalesOsParty } from '../../types';
import { formatCurrency } from '../../utils/currency';

type Props = {
  navigation: NativeStackNavigationProp<SalesOsStackParamList, 'SalesOsPartyGroupDetail'>;
  route: RouteProp<SalesOsStackParamList, 'SalesOsPartyGroupDetail'>;
};

export const SalesOsPartyGroupDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { groupId, groupName, filter } = route.params;
  const [group, setGroup] = useState<SalesOsPartyGroup | undefined>(undefined);
  const [parties, setParties] = useState<SalesOsParty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [calcVisible, setCalcVisible] = useState(false);

  useEffect(() => {
    Promise.all([
      salesOsApi.getPartyGroupById(groupId, filter),
      salesOsApi.getPartiesForPartyGroup(groupName, filter),
    ])
      .then(([groupData, partyData]) => {
        setGroup(groupData);
        setParties(partyData);
      })
      .finally(() => setLoading(false));
  }, [groupId, groupName, filter]);

  const toggleBill = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Flatten all invoices across all parties
  const allInvoices = parties.flatMap((p) => p.bills || []);
  const visibleInvoices = filter?.onlyDue ? allInvoices.filter((i) => i.daysLeft < 0) : allInvoices;
  
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

  if (loading) return <LoadingOverlay visible message="Loading..." />;
  if (!group) return null;

  return (
    <View style={styles.container}>
      <GradientHeader title="Sales O/s Party Group Detail" subtitle={groupName || 'Unknown Group'} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Group Summary */}
        <Card style={styles.summaryCard}>
          <View style={styles.brokerHeader}>
            <View>
              <Text style={styles.brokerName}>{groupName || 'Unknown Group'}</Text>
            </View>
          </View>
          {filter?.fromDate && filter?.toDate && (
            <Text style={styles.dateRange}>
              From: {filter.fromDate}  To: {filter.toDate}
            </Text>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total O/s : <Text style={styles.totalAmount}>{formatCurrency(group.totalOs)}</Text></Text>
          </View>
        </Card>

        {/* Parties and Bills List */}
        {parties.map((party) => {
          const partyBills = filter?.onlyDue 
            ? (party.bills || []).filter(b => b.daysLeft < 0)
            : (party.bills || []);
            
          if (partyBills.length === 0) return null;

          return (
            <View key={party.id} style={styles.partyContainer}>
              <View style={styles.partyHeader}>
                <Icon name="asterisk" size={14} color={Colors.textSecondary} />
                <Text style={styles.partyTitle}>{party.name}</Text>
              </View>

              {partyBills.map((inv) => {
                const paidPct = Math.min(100, Math.round(((inv.amount - inv.outstanding) / inv.amount) * 100));
                const checked = selectedIds.includes(inv.id);
                return (
                  <Card key={inv.id} style={styles.invoiceCard}>
                    <TouchableOpacity style={styles.invoiceItem} onPress={() => toggleBill(inv.id)} activeOpacity={0.7}>
                      <View style={styles.invHeader}>
                        <View style={styles.invNumberRow}>
                          <Icon
                            name={checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
                            size={22}
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
                    </TouchableOpacity>
                  </Card>
                );
              })}
              <View style={styles.partyFooter}>
                <Text style={styles.partyFooterText}>Party Total {formatCurrency(party.totalOs)}</Text>
              </View>
            </View>
          );
        })}

        {parties.length === 0 && (
          <View style={{ alignItems: 'center', padding: Spacing.xl }}>
            <Icon name="folder-off" size={36} color={Colors.gray300} />
            <Text style={{ fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, marginTop: Spacing.sm }}>
              No parties listed for this group.
            </Text>
          </View>
        )}

        {/* Selected total + Interest Calculation */}
        {selectedInvoices.length > 0 && (
          <Card style={styles.actionCard}>
            <View style={styles.selectedRow}>
              <Text style={styles.selectedLabel}>Selected Bill Total</Text>
              <Text style={styles.selectedValue}>{formatCurrency(selectedTotal)}</Text>
            </View>
            <TouchableOpacity style={styles.interestBtn} onPress={openCalculator} activeOpacity={0.85}>
              <Icon name="calculator-variant-outline" size={18} color={Colors.textWhite} />
              <Text style={styles.interestBtnText}>Interest Calculation</Text>
            </TouchableOpacity>
          </Card>
        )}
      </ScrollView>

      <InterestCalculatorModal
        visible={calcVisible}
        bills={interestBills}
        defaultDueDays={firstTermDays}
        onClose={() => setCalcVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xl },
  summaryCard: { marginBottom: Spacing.md, padding: Spacing.md },
  brokerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  brokerName: { fontSize: Typography.fontSizes.lg, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  dateRange: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, marginTop: Spacing.sm },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md },
  totalLabel: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.semiBold, color: Colors.textPrimary },
  totalAmount: { fontSize: Typography.fontSizes.lg, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  
  partyContainer: { marginBottom: Spacing.lg },
  partyHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm, paddingHorizontal: Spacing.xs },
  partyTitle: { fontSize: Typography.fontSizes.md, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary, textTransform: 'uppercase' },
  
  invoiceCard: { marginBottom: Spacing.sm, padding: 0 },
  invoiceItem: { padding: Spacing.md },
  invHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  invNumberRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  invNumber: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  invDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  invDate: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary },
  invAmounts: { alignItems: 'flex-end' },
  invTotal: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, marginBottom: 2 },
  invOs: { fontSize: Typography.fontSizes.sm, fontWeight: Typography.fontWeights.bold, color: Colors.danger },
  progressBar: { height: 6, backgroundColor: Colors.gray200, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.success, borderRadius: 3 },
  
  partyFooter: { alignItems: 'flex-end', paddingHorizontal: Spacing.xs, marginTop: Spacing.xs },
  partyFooterText: { fontSize: Typography.fontSizes.sm, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  
  actionCard: { marginTop: Spacing.md, padding: Spacing.md },
  selectedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  selectedLabel: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary },
  selectedValue: { fontSize: Typography.fontSizes.lg, fontWeight: Typography.fontWeights.bold, color: Colors.gradientStart },
  interestBtn: {
    backgroundColor: Colors.gradientStart,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  interestBtnText: { color: Colors.textWhite, fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.semiBold },
});
