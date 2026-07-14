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
import { salesOsApi } from '../../services/api';
import { useCompanyStore } from '../../store/companyStore';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import type { SalesOsStackParamList, SalesOsParty } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { getInitials } from '../../utils/strings';

type Props = {
  navigation: NativeStackNavigationProp<SalesOsStackParamList, 'SalesOsPartyList'>;
  route: RouteProp<SalesOsStackParamList, 'SalesOsPartyList'>;
};

const AVATAR_COLORS = ['#7C3AED', '#2563EB', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#8B5CF6'];

export const SalesOsPartyListScreen: React.FC<Props> = ({ navigation, route }) => {
  const { selectedCompany } = useCompanyStore();
  const [parties, setParties] = useState<SalesOsParty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [onlyDue, setOnlyDue] = useState(false);
  const [commonCompany, setCommonCompany] = useState(selectedCompany?.isCommon ?? false);

  // Re-fetch whenever a toggle changes (mirrors the OG getSummary() re-fetch).
  useEffect(() => {
    setLoading(true);
    const filter = { ...route.params.filter, onlyDue, commonCompany, companyId: String(selectedCompany?.recordId || selectedCompany?.id) };
    salesOsApi.getParties(filter).then((data) => {
      setParties(data);
      setLoading(false);
    })
      .catch(() => setLoading(false));
  }, [onlyDue, commonCompany, selectedCompany?.recordId, selectedCompany?.id]);

  const lowerSearch = search.toLowerCase();
  // Sort By UI removed — data is forced latest-first (reverse chronological by last payment).
  const filtered = parties
    .filter(
      (p) =>
        p.name.toLowerCase().includes(lowerSearch) ||
        p.city.toLowerCase().includes(lowerSearch),
    )
    .sort((a, b) => b.lastPayment.localeCompare(a.lastPayment));

  const totalOs = parties.reduce((sum, p) => sum + p.totalOs, 0);
  const overdueCount = parties.filter((p) => p.daysOverdue > 30).length;

  const renderItem = ({ item, index }: { item: SalesOsParty; index: number }) => {
    const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
    return (
      <TouchableOpacity
        style={styles.partyCard}
        onPress={() => navigation.navigate('SalesOsPartyDetail', {
          partyId: item.id,
          partyName: item.name,
          filter: { ...route.params.filter, onlyDue, commonCompany, companyId: String(selectedCompany?.recordId || selectedCompany?.id) },
        })}
        activeOpacity={0.85}
      >
        <View style={[styles.avatar, { backgroundColor: color }]}>
          <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
        </View>
        <View style={styles.partyInfo}>
          <View style={styles.partyNameRow}>
            <Text style={styles.partyName} numberOfLines={1}>{item.name}</Text>
            <Badge
              label={item.daysOverdue > 0 ? `${item.daysOverdue}d overdue` : 'Current'}
              variant={getDaysBadgeVariant(item.daysOverdue)}
            />
          </View>
          <View style={styles.partyMeta}>
            <Icon name="map-marker-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{item.city}</Text>
            <View style={styles.dot} />
            <Icon name="file-document-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{item.invoiceCount} invoices</Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.osLabel}>Outstanding</Text>
            <Text style={styles.osAmount}>{formatCurrency(item.totalOs)}</Text>
          </View>
        </View>
        <Icon name="chevron-right" size={18} color={Colors.gray300} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Sales Outstanding"
        subtitle="Party Wise Report"
        onBack={() => navigation.goBack()}
      />

      <OutstandingToggleBar
        onlyDue={onlyDue}
        commonCompany={commonCompany}
        onOnlyDueChange={setOnlyDue}
        onCommonCompanyChange={setCommonCompany}
      />

      {/* Summary Pills */}
      <View style={styles.summaryBar}>
        <View style={styles.pill}>
          <Text style={styles.pillValue}>{formatCurrency(totalOs)}</Text>
          <Text style={styles.pillLabel}>Total OS</Text>
        </View>
        <View style={styles.pill}>
          <Text style={styles.pillValue}>{parties.length}</Text>
          <Text style={styles.pillLabel}>Parties</Text>
        </View>
        <View style={[styles.pill, styles.pillDanger]}>
          <Text style={[styles.pillValue, styles.pillValueDanger]}>{overdueCount}</Text>
          <Text style={styles.pillLabel}>Overdue</Text>
        </View>
      </View>

      <View style={styles.searchWrapper}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search parties..."
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState icon="account-search" title="No parties found" subtitle="Try adjusting your search" />
        }
      />
      <LoadingOverlay visible={loading} message="Loading parties..." />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  summaryBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pill: {
    flex: 1,
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  pillDanger: { backgroundColor: Colors.dangerLight },
  pillValue: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  pillValueDanger: { color: Colors.danger },
  pillLabel: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  searchWrapper: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl },
  partyCard: {
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textWhite,
  },
  partyInfo: { flex: 1 },
  partyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: Spacing.sm,
  },
  partyName: {
    flex: 1,
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textPrimary,
  },
  partyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 6,
  },
  metaText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.gray300,
    marginHorizontal: 2,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  osLabel: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
  },
  osAmount: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.gradientStart,
  },
});
