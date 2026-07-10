import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { GradientHeader } from '../../components/GradientHeader';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { salesRegisterApi } from '../../services/api';
import { Colors, Typography, Spacing } from '../../theme';
import type { SalesRegisterStackParamList, RegisterEntry } from '../../types';
import { formatCurrency } from '../../utils/currency';

type Props = {
  navigation: NativeStackNavigationProp<SalesRegisterStackParamList, 'SalesRegisterDetail'>;
  route: RouteProp<SalesRegisterStackParamList, 'SalesRegisterDetail'>;
};


export const SalesRegisterDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { entryId } = route.params;
  const [entry, setEntry] = useState<RegisterEntry | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    salesRegisterApi.getById(entryId).then((data) => {
      setEntry(data);
      setLoading(false);
    })
      .catch(() => setLoading(false));
  }, [entryId]);

  if (loading) return <LoadingOverlay visible message="Loading..." />;
  if (!entry) return null;

  const subTotal = entry.items?.reduce((s, i) => s + i.amount, 0) ?? entry.amount;
  const tax = entry.tax ?? 0;
  const discount = entry.discount ?? 0;

  return (
    <View style={styles.container}>
      <GradientHeader
        title={entry.invoiceNo}
        subtitle={entry.partyName}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Invoice No.</Text>
              <Text style={styles.fieldValue}>{entry.invoiceNo}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Date</Text>
              <Text style={styles.fieldValue}>{entry.date}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Party</Text>
              <Text style={styles.fieldValue}>{entry.partyName}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Type</Text>
              <Badge label={entry.type} variant={entry.type === 'Return' ? 'overdue' : 'ok'} />
            </View>
          </View>
        </Card>

        {entry.items && entry.items.length > 0 ? (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Items</Text>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.th, { flex: 2 }]}>Item</Text>
              <Text style={styles.th}>Qty</Text>
              <Text style={styles.th}>Rate</Text>
              <Text style={[styles.th, styles.rightAlign]}>Amount</Text>
            </View>
            {entry.items.map((item, idx) => (
              <View key={idx} style={[styles.tableRow, idx % 2 === 0 && styles.tableRowEven]}>
                <Text style={[styles.td, { flex: 2 }]} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.td}>{item.qty} {item.unit}</Text>
                <Text style={styles.td}>₹{item.rate}</Text>
                <Text style={[styles.td, styles.rightAlign, styles.tdBold]}>{formatCurrency(item.amount)}</Text>
              </View>
            ))}
          </Card>
        ) : null}

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Amount Summary</Text>
          {[
            { label: 'Sub Total', value: subTotal },
            { label: 'Discount', value: -discount, isDanger: true },
            { label: 'Tax (GST)', value: tax },
          ].map((row) => (
            <View key={row.label} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{row.label}</Text>
              <Text style={[styles.summaryValue, row.isDanger && styles.dangerText]}>
                {row.isDanger && discount > 0 ? '-' : ''}{formatCurrency(Math.abs(row.value))}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>{formatCurrency(entry.amount)}</Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xl },
  card: { marginBottom: Spacing.md },
  row: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  field: { flex: 1 },
  fieldLabel: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, marginBottom: 4 },
  fieldValue: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.semiBold, color: Colors.textPrimary },
  sectionTitle: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  tableRow: { flexDirection: 'row', paddingVertical: 8 },
  tableHeader: { borderBottomWidth: 1, borderBottomColor: Colors.border, marginBottom: 4 },
  tableRowEven: { backgroundColor: Colors.gray50, borderRadius: 4 },
  th: { flex: 1, fontSize: Typography.fontSizes.xs, fontWeight: Typography.fontWeights.semiBold, color: Colors.textSecondary },
  td: { flex: 1, fontSize: Typography.fontSizes.sm, color: Colors.textPrimary },
  tdBold: { fontWeight: Typography.fontWeights.semiBold },
  rightAlign: { textAlign: 'right' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { fontSize: Typography.fontSizes.base, color: Colors.textSecondary },
  summaryValue: { fontSize: Typography.fontSizes.base, color: Colors.textPrimary, fontWeight: Typography.fontWeights.medium },
  dangerText: { color: Colors.danger },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  totalLabel: { fontSize: Typography.fontSizes.md, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  totalValue: { fontSize: Typography.fontSizes.md, fontWeight: Typography.fontWeights.bold, color: Colors.gradientStart },
});
