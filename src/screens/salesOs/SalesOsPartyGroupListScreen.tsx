import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ZIcon as Icon } from '../../components/ZIcon';
import { GradientHeader } from '../../components/GradientHeader';
import { SearchBar } from '../../components/SearchBar';
import { EmptyState } from '../../components/EmptyState';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { OutstandingToggleBar } from '../../components/OutstandingToggleBar';
import { salesOsApi } from '../../services/api';
import { useCompanyStore } from '../../store/companyStore';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import type { SalesOsStackParamList, SalesOsPartyGroup } from '../../types';
import { formatCurrency } from '../../utils/currency';

type Props = {
  navigation: NativeStackNavigationProp<SalesOsStackParamList, 'SalesOsPartyGroupList'>;
  route: RouteProp<SalesOsStackParamList, 'SalesOsPartyGroupList'>;
};


const groupColors = ['#7C3AED', '#10B981', '#F59E0B', '#2563EB'];

export const SalesOsPartyGroupListScreen: React.FC<Props> = ({ navigation, route }) => {
  const { selectedCompany } = useCompanyStore();
  const [groups, setGroups] = useState<SalesOsPartyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [onlyDue, setOnlyDue] = useState(false);
  const [commonCompany, setCommonCompany] = useState(false);

  // Re-fetch whenever a toggle changes (mirrors the OG getSummary() re-fetch).
  useEffect(() => {
    setLoading(true);
    const filter = { ...route.params.filter, onlyDue, commonCompany, companyId: selectedCompany?.id };
    salesOsApi.getPartyGroups(filter).then((data) => {
      setGroups(data);
      setLoading(false);
    })
      .catch(() => setLoading(false));
  }, [onlyDue, commonCompany, selectedCompany?.id]);

  const filtered = groups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));

  const renderItem = ({ item, index }: { item: SalesOsPartyGroup; index: number }) => {
    const color = groupColors[index % groupColors.length];
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('SalesOsPartyGroupDetail', {
          groupId: item.id,
          groupName: item.name,
          filter: { ...route.params.filter, onlyDue, commonCompany, companyId: selectedCompany?.id },
        })}
        activeOpacity={0.85}
      >
        <View style={[styles.icon, { backgroundColor: color + '20' }]}>
          <Icon name="folder-open" size={22} color={color} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>{item.partyCount} parties</Text>
        </View>
        <Text style={[styles.amount, { color }]}>{formatCurrency(item.totalOs)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <GradientHeader title="Sales OS" subtitle="Party Groups" onBack={() => navigation.goBack()} />
      <OutstandingToggleBar
        onlyDue={onlyDue}
        commonCompany={commonCompany}
        onOnlyDueChange={setOnlyDue}
        onCommonCompanyChange={setCommonCompany}
      />
      <View style={styles.searchWrapper}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search groups..." />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="folder-outline" title="No groups found" />}
      />
      <LoadingOverlay visible={loading} message="Loading..." />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
  icon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  info: { flex: 1 },
  name: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.semiBold, color: Colors.textPrimary, marginBottom: 4 },
  meta: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary },
  amount: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.bold },
});
