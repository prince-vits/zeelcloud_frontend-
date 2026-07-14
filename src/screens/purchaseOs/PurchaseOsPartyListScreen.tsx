import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ZIcon as Icon } from '../../components/ZIcon';
import { GradientHeader } from '../../components/GradientHeader';
import { SearchBar } from '../../components/SearchBar';
import { Badge, getDaysBadgeVariant } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { OutstandingToggleBar } from '../../components/OutstandingToggleBar';
import { purchaseOsApi } from '../../services/api';
import { useCompanyStore } from '../../store/companyStore';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import type { PurchaseOsStackParamList, PurchaseOsParty } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { getInitials } from '../../utils/strings';

type Props = {
  navigation: NativeStackNavigationProp<PurchaseOsStackParamList, 'PurchaseOsPartyList'>;
  route: RouteProp<PurchaseOsStackParamList, 'PurchaseOsPartyList'>;
};


export const PurchaseOsPartyListScreen: React.FC<Props> = ({ navigation, route }) => {
  const { selectedCompany } = useCompanyStore();
  const [parties, setParties] = useState<PurchaseOsParty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [onlyDue, setOnlyDue] = useState(false);
  const [commonCompany, setCommonCompany] = useState(selectedCompany?.isCommon ?? false);

  // Re-fetch whenever a toggle changes (mirrors the OG getSummary() re-fetch).
  useEffect(() => {
    setLoading(true);
    const filter = { ...route.params.filter, onlyDue, commonCompany, companyId: String(selectedCompany?.recordId || selectedCompany?.id) };
    purchaseOsApi.getParties(filter).then((data) => {
      setParties(data);
      setLoading(false);
    })
      .catch(() => setLoading(false));
  }, [onlyDue, commonCompany, selectedCompany?.recordId, selectedCompany?.id]);

  const lowerSearch = search.toLowerCase();
  const filtered = parties.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerSearch) ||
      p.city.toLowerCase().includes(lowerSearch),
  );

  const totalOs = parties.reduce((sum, p) => sum + p.totalOs, 0);

  const renderItem = ({ item }: { item: PurchaseOsParty }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PurchaseOsPartyDetail', {
        partyId: item.id,
        partyName: item.name,
        filter: { ...route.params.filter, onlyDue, commonCompany, companyId: String(selectedCompany?.recordId || selectedCompany?.id) },
      })}
      activeOpacity={0.85}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Badge
            label={item.daysOverdue > 0 ? `${item.daysOverdue}d` : 'OK'}
            variant={getDaysBadgeVariant(item.daysOverdue)}
          />
        </View>
        <View style={styles.metaRow}>
          <Icon name="map-marker-outline" size={12} color={Colors.textSecondary} />
          <Text style={styles.meta}>{item.city}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.meta}>{item.invoiceCount} invoices</Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Outstanding</Text>
          <Text style={styles.amount}>{formatCurrency(item.totalOs)}</Text>
        </View>
      </View>
      <Icon name="chevron-right" size={18} color={Colors.gray300} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <GradientHeader title="Purchase OS" subtitle="Party Wise" onBack={() => navigation.goBack()} />
      <OutstandingToggleBar
        onlyDue={onlyDue}
        commonCompany={commonCompany}
        onOnlyDueChange={setOnlyDue}
        onCommonCompanyChange={setCommonCompany}
      />
      <View style={styles.summary}>
        <Text style={styles.summaryText}>Total OS: {formatCurrency(totalOs)}</Text>
        <Text style={styles.summaryText}>{parties.length} parties</Text>
      </View>
      <View style={styles.searchWrapper}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search suppliers..." />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState icon="account-search" title="No parties found" />}
      />
      <LoadingOverlay visible={loading} message="Loading..." />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryText: { fontSize: Typography.fontSizes.sm, fontWeight: Typography.fontWeights.semiBold, color: Colors.gradientEnd },
  searchWrapper: { padding: Spacing.md, paddingBottom: Spacing.sm },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.gradientEnd,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.bold, color: Colors.textWhite },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, gap: Spacing.sm },
  name: { flex: 1, fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.semiBold, color: Colors.textPrimary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  meta: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary },
  dot: { color: Colors.gray300, fontSize: 10 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between' },
  amountLabel: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary },
  amount: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.bold, color: Colors.gradientEnd },
});
