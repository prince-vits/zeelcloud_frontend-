import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ZIcon as Icon } from '../../components/ZIcon';
import { GradientHeader } from '../../components/GradientHeader';
import { Card } from '../../components/Card';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { gpRegisterApi } from '../../services/api';
import { Colors, Typography, Spacing } from '../../theme';
import type { GpRegisterStackParamList, GpRegisterEntry } from '../../types';
import { formatCurrency } from '../../utils/currency';

type Props = {
  navigation: NativeStackNavigationProp<GpRegisterStackParamList, 'GpRegisterDetail'>;
  route: RouteProp<GpRegisterStackParamList, 'GpRegisterDetail'>;
};


export const GpRegisterDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { entryId } = route.params;
  const [entry, setEntry] = useState<GpRegisterEntry | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gpRegisterApi.getById(entryId).then((data) => {
      setEntry(data);
      setLoading(false);
    })
      .catch(() => setLoading(false));
  }, [entryId]);

  if (loading) return <LoadingOverlay visible message="Loading..." />;
  if (!entry) return null;

  const details = [
    { label: 'Lot Number', value: entry.lotNo ?? 'N/A', icon: 'barcode' },
    { label: 'Date', value: entry.date, icon: 'calendar-outline' },
    { label: 'Party', value: entry.partyName, icon: 'account-outline' },
    { label: 'Process Type', value: entry.processType, icon: 'cog-outline' },
    { label: 'Quality', value: entry.quality ?? 'N/A', icon: 'star-outline' },
    { label: 'Gray Quantity', value: `${entry.grayQty.toLocaleString()} Meters`, icon: 'grid-large' },
    { label: 'Beam Quantity', value: `${entry.beamQty} Beams`, icon: 'layers-outline' },
    { label: 'Amount', value: formatCurrency(entry.amount), icon: 'currency-inr' },
  ];

  return (
    <View style={styles.container}>
      <GradientHeader
        title={entry.lotNo ?? 'GP Detail'}
        subtitle={entry.partyName}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>GP Register Entry</Text>
          {details.map((d) => (
            <View key={d.label} style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Icon name={d.icon} size={16} color={Colors.gradientStart} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{d.label}</Text>
                <Text style={styles.detailValue}>{d.value}</Text>
              </View>
            </View>
          ))}
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Production Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{entry.grayQty.toLocaleString()}</Text>
              <Text style={styles.summaryLabel}>Gray (m)</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{entry.beamQty}</Text>
              <Text style={styles.summaryLabel}>Beams</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: Colors.gradientStart }]}>
                {formatCurrency(entry.amount)}
              </Text>
              <Text style={styles.summaryLabel}>Amount</Text>
            </View>
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
  cardTitle: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.purple100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  detailContent: { flex: 1 },
  detailLabel: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, marginBottom: 2 },
  detailValue: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.medium, color: Colors.textPrimary },
  summaryCard: { marginBottom: Spacing.md },
  summaryGrid: { flexDirection: 'row' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: Typography.fontSizes.xl, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  summaryLabel: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, marginTop: 4 },
});
