import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ZIcon as Icon } from '../../components/ZIcon';
import { GradientHeader } from '../../components/GradientHeader';
import { Card } from '../../components/Card';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { salesOsApi } from '../../services/api';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import type { SalesOsStackParamList, SalesOsArea, SalesOsParty } from '../../types';
import { formatCurrency } from '../../utils/currency';

type Props = {
  navigation: NativeStackNavigationProp<SalesOsStackParamList, 'SalesOsAreaDetail'>;
  route: RouteProp<SalesOsStackParamList, 'SalesOsAreaDetail'>;
};


export const SalesOsAreaDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { areaId, areaName } = route.params;
  const [area, setArea] = useState<SalesOsArea | undefined>(undefined);
  const [allParties, setAllParties] = useState<SalesOsParty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([salesOsApi.getAreaById(areaId), salesOsApi.getParties()])
      .then(([a, ps]) => {
        setArea(a);
        setAllParties(ps);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [areaId]);

  const parties = allParties.filter((p) => p.city === areaName).slice(0, area?.partyCount ?? 3);

  if (loading) return <LoadingOverlay visible message="Loading..." />;
  if (!area) return null;

  return (
    <View style={styles.container}>
      <GradientHeader title={areaName} subtitle="Area Detail" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{formatCurrency(area.totalOs)}</Text>
              <Text style={styles.summaryLabel}>Total OS</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{area.partyCount}</Text>
              <Text style={styles.summaryLabel}>Parties</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Parties in {areaName}</Text>
        {parties.length > 0 ? parties.map((party) => (
          <View key={party.id} style={styles.partyCard}>
            <View style={styles.avatar}>
              <Text style={styles.initial}>{party.name[0]}</Text>
            </View>
            <View style={styles.partyInfo}>
              <Text style={styles.partyName}>{party.name}</Text>
              <Text style={styles.invoiceCount}>{party.invoiceCount} invoices</Text>
            </View>
            <Text style={styles.amount}>{formatCurrency(party.totalOs)}</Text>
          </View>
        )) : (
          <View style={styles.emptyArea}>
            <Icon name="map-marker-off" size={36} color={Colors.gray300} />
            <Text style={styles.emptyText}>No parties listed for this area in mock data</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xl },
  summaryCard: { marginBottom: Spacing.md },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: Typography.fontSizes.xl, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  summaryLabel: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, marginTop: 4 },
  divider: { width: 1, height: 40, backgroundColor: Colors.border },
  sectionTitle: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  partyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.gradientStart,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  initial: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.bold, color: Colors.textWhite },
  partyInfo: { flex: 1 },
  partyName: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.semiBold, color: Colors.textPrimary },
  invoiceCount: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary },
  amount: { fontSize: Typography.fontSizes.sm, fontWeight: Typography.fontWeights.bold, color: Colors.gradientStart },
  emptyArea: { alignItems: 'center', paddingVertical: Spacing.xl },
  emptyText: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm },
});
