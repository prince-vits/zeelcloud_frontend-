import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ZIcon as Icon } from '../../components/ZIcon';
import { GradientHeader } from '../../components/GradientHeader';
import { Card } from '../../components/Card';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { salesOsApi } from '../../services/api';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import type { SalesOsStackParamList, SalesOsBroker, SalesOsParty } from '../../types';
import { formatCurrency } from '../../utils/currency';

type Props = {
  navigation: NativeStackNavigationProp<SalesOsStackParamList, 'SalesOsBrokerDetail'>;
  route: RouteProp<SalesOsStackParamList, 'SalesOsBrokerDetail'>;
};


export const SalesOsBrokerDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { brokerId, brokerName } = route.params;
  const [broker, setBroker] = useState<SalesOsBroker | undefined>(undefined);
  const [allParties, setAllParties] = useState<SalesOsParty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([salesOsApi.getBrokerById(brokerId), salesOsApi.getParties()])
      .then(([b, ps]) => {
        setBroker(b);
        setAllParties(ps);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [brokerId]);

  // Show first N parties as the broker's parties (mock association).
  const parties = allParties.slice(0, broker?.partyCount ?? 3);

  if (loading) return <LoadingOverlay visible message="Loading..." />;
  if (!broker) return null;

  return (
    <View style={styles.container}>
      <GradientHeader title={brokerName} subtitle={broker.city} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{formatCurrency(broker.totalOs)}</Text>
              <Text style={styles.summaryLabel}>Total OS</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{broker.partyCount}</Text>
              <Text style={styles.summaryLabel}>Parties</Text>
            </View>
          </View>
        </Card>

        {broker.phone && (
          <Card style={styles.contactCard}>
            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => Alert.alert('Call', `Calling ${broker.phone}`)}
            >
              <Icon name="phone" size={18} color={Colors.success} />
              <Text style={styles.phone}>{broker.phone}</Text>
            </TouchableOpacity>
          </Card>
        )}

        <Text style={styles.sectionTitle}>Associated Parties</Text>
        {parties.map((party) => (
          <View key={party.id} style={styles.partyCard}>
            <View style={styles.partyAvatar}>
              <Text style={styles.partyInitial}>{party.name[0]}</Text>
            </View>
            <View style={styles.partyInfo}>
              <Text style={styles.partyName}>{party.name}</Text>
              <Text style={styles.partyCity}>{party.city}</Text>
            </View>
            <Text style={styles.partyAmount}>{formatCurrency(party.totalOs)}</Text>
          </View>
        ))}
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
  contactCard: { marginBottom: Spacing.md },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  phone: { fontSize: Typography.fontSizes.base, color: Colors.textPrimary, fontWeight: Typography.fontWeights.medium },
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
  partyAvatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.gradientStart,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  partyInitial: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.bold, color: Colors.textWhite },
  partyInfo: { flex: 1 },
  partyName: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.semiBold, color: Colors.textPrimary },
  partyCity: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary },
  partyAmount: { fontSize: Typography.fontSizes.sm, fontWeight: Typography.fontWeights.bold, color: Colors.gradientStart },
});
