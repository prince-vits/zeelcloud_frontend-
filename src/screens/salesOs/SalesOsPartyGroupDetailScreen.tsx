import React, { useEffect, useState } from 'react';
import { View, Linking, Text, ScrollView, TouchableOpacity, StyleSheet, Alert , Switch} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ZIcon as Icon } from '../../components/ZIcon';
import { GradientHeader } from '../../components/GradientHeader';
import { CompanyStrip } from '../../components/CompanyStrip';
import { Card } from '../../components/Card';
import { GridTable, GridColumn, GridText } from '../../components/GridTable';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { InlineInterestCalculator, useInlineInterest } from '../../components/InlineInterestCalculator';
import { salesOsApi } from '../../services/api';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import type { SalesOsStackParamList, SalesOsPartyGroup, SalesOsParty, SalesOsInvoice } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { toDDMMYY, toDDMMYYYY } from '../../utils/formatDate';

type Props = {
  navigation: NativeStackNavigationProp<SalesOsStackParamList, 'SalesOsPartyGroupDetail'>;
  route: RouteProp<SalesOsStackParamList, 'SalesOsPartyGroupDetail'>;
};

export const SalesOsPartyGroupDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { groupId, groupName, filter } = route.params;
  const [group, setGroup] = useState<SalesOsPartyGroup | undefined>(undefined);
  const [parties, setParties] = useState<SalesOsParty[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlyDue, setOnlyDue] = useState(false);
  const [showInterest, setShowInterest] = useState(false);
  const interestCalc = useInlineInterest();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
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


  // OG bill grid — same columns as the party detail page.
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
        { key: 'bookCode', label: 'Book', width: 35 },
    { key: 'number', label: 'Bill No', flex: 0.8, render: (inv) => <GridText bold>{inv.number}</GridText> },
    { key: 'date', label: 'Date', flex: 1.1, render: (inv) => <GridText>{toDDMMYY(inv.date)}</GridText> },
    { key: 'termDays', label: 'Terms', width: 38, render: (inv) => <GridText>{String(inv.termDays ?? 0)}</GridText> },
    {
      key: 'dueDays', label: 'Due Days', width: 42,
      render: (inv) => (
        <GridText bold color={-inv.daysLeft > 0 ? Colors.danger : Colors.success}>
          {String(-inv.daysLeft)}
        </GridText>
      ),
    },
    { key: 'outstanding', label: 'Amount', flex: 1.4, render: (inv) => <GridText>{`₹${inv.outstanding.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}</GridText> },
    ...(showInterest ? [{
      key: 'interest',
      label: 'Interest',
      flex: 1.3,
      render: (inv: any) => <GridText>{`₹ ${interestCalc.calculateBillInterest(inv.outstanding ?? inv.balance ?? inv.netBalance ?? 0, inv.totalDueDays ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`}</GridText>
    }] : [])
  ];

    
  if (loading) return <LoadingOverlay visible message="Loading..." />;
  if (!group) return null;

  return (
    <View style={styles.container}>
      <GradientHeader title="Sales O/s (Party Group Wise)" subtitle={groupName || 'Unknown Group'} onBack={() => navigation.goBack()} />
      <CompanyStrip />
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
              From: {toDDMMYYYY(filter.fromDate)}  To: {toDDMMYYYY(filter.toDate)}
            </Text>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total O/s : <Text style={styles.totalAmount}>{formatCurrency(group.totalOs)}</Text></Text>
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleItem}>
              <Text style={styles.toggleLabel}>Only Due</Text>
              <Switch
                value={onlyDue}
                onValueChange={setOnlyDue}
                trackColor={{ false: Colors.gray300, true: Colors.gradientEnd }}
                thumbColor={Colors.surface}
                ios_backgroundColor={Colors.gray300}
                style={styles.switch}
              />
            </View>
            <View style={styles.toggleItem}>
              <Text style={styles.toggleLabel}>Show Interest</Text>
              <Switch
                value={showInterest}
                onValueChange={setShowInterest}
                trackColor={{ false: Colors.gray300, true: Colors.gradientEnd }}
                thumbColor={Colors.surface}
                ios_backgroundColor={Colors.gray300}
                style={styles.switch}
              />
            </View>
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

              <View style={styles.tableBleed}>
                {showInterest && selectedInvoices.length > 0 && (
            <View style={styles.sectionPad}>
              <InlineInterestCalculator
                {...interestCalc}
                selectedBillAmount={selectedTotal}
                totalInterest={selectedInvoices.reduce((sum, inv) => sum + interestCalc.calculateBillInterest((inv as any).outstanding ?? (inv as any).balance ?? (inv as any).netBalance ?? 0, inv.totalDueDays ?? 0), 0)}
              />
            </View>
          )}

          <GridTable
                  columns={billColumns}
                  data={partyBills}
                  keyExtractor={(inv, idx) => `${inv.id}-${idx}`}
                  onRowPress={(inv) => toggleBill(inv.id)}
                  rowStyle={(inv) => (selectedIds.includes(inv.id) ? styles.rowSelected : undefined)}
                  emptyText="No bills"
                />
              </View>
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
                      </Card>
        )}
      </ScrollView>

      
    </View>
  );
};

const styles = StyleSheet.create({
  sectionPad: { paddingHorizontal: Spacing.md },
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xl },
  summaryCard: { marginBottom: Spacing.md, padding: Spacing.md },
  brokerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  brokerName: { fontSize: Typography.fontSizes.lg, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  dateRange: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, marginTop: Spacing.sm },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md },
  totalLabel: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.semiBold, color: Colors.textPrimary },
  totalAmount: { fontSize: Typography.fontSizes.lg, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xl, marginTop: Spacing.md },
  toggleItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  toggleLabel: { fontSize: Typography.fontSizes.xs, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  switch: { transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] },

  
  partyContainer: { marginBottom: Spacing.lg },
  tableBleed: { marginHorizontal: -Spacing.md, backgroundColor: Colors.surface },
  rowSelected: { backgroundColor: Colors.purple100 },
  partyHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm, paddingHorizontal: Spacing.xs },
  partyTitle: { fontSize: Typography.fontSizes.md, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary, textTransform: 'uppercase' },

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
