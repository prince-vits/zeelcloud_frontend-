import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ZIcon as Icon } from '../../components/ZIcon';
import { SearchBar } from '../../components/SearchBar';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useSubUserStore } from '../../store/subUserStore';
import { getInitials } from '../../utils/strings';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import type { SubUser, SubUserStackParamList } from '../../types';

export const SubUserListScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<SubUserStackParamList>>();
  const { subUsers, isLoading, loaded, fetchSubUsers, deleteSubUser } = useSubUserStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!loaded) fetchSubUsers();
  }, [loaded]);

  const lower = search.toLowerCase();
  const filtered = subUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(lower) ||
      u.username.toLowerCase().includes(lower),
  );

  const confirmDelete = (user: SubUser) => {
    Alert.alert('Delete Sub User', `Remove ${user.name}? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteSubUser(user.id) },
    ]);
  };

  const renderItem = ({ item }: { item: SubUser }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('SubUserDetail', { userId: item.id })}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
        <View style={[styles.statusDot, { backgroundColor: item.isActive ? Colors.success : Colors.gray400 }]} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.username} numberOfLines={1}>@{item.username}</Text>
        <Text style={styles.company} numberOfLines={1}>{item.companyName}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.viewBtn]}
          onPress={() => navigation.navigate('SubUserDetail', { userId: item.id })}
          activeOpacity={0.7}
        >
          <Icon name="eye-outline" size={18} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => navigation.navigate('EditSubUser', { userId: item.id })}
          activeOpacity={0.7}
        >
          <Icon name="pencil-outline" size={18} color={Colors.warning} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => confirmDelete(item)}
          activeOpacity={0.7}
        >
          <Icon name="trash-can-outline" size={18} color={Colors.danger} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Text style={styles.headerTitle}>Sub User Management</Text>
        <Text style={styles.headerSub}>Manage and control access for your sub users</Text>
        <PrimaryButton
          title="Create New Sub User"
          icon="account-plus-outline"
          onPress={() => navigation.navigate('CreateSubUser')}
          style={styles.createBtn}
        />
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search by name or username..." />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeaderRow}>
            <Text style={styles.sectionTitle}>Available Sub Users</Text>
            <View style={styles.totalBadge}>
              <Text style={styles.totalText}>Total: {subUsers.length}</Text>
            </View>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchSubUsers}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="account-off-outline" size={48} color={Colors.gray300} />
            <Text style={styles.emptyText}>No sub users found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  headerSub: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  createBtn: { marginVertical: Spacing.md },

  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  totalBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  totalText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.semiBold,
  },

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
    borderRadius: 23,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  info: { flex: 1 },
  name: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  username: { fontSize: Typography.fontSizes.sm, color: Colors.primary },
  company: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, marginTop: 1 },
  actions: { flexDirection: 'row', gap: 6 },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewBtn: { backgroundColor: Colors.primaryLight },
  editBtn: { backgroundColor: Colors.warningLight },
  deleteBtn: { backgroundColor: Colors.dangerLight },
  empty: { alignItems: 'center', paddingTop: 60, gap: Spacing.sm },
  emptyText: { fontSize: Typography.fontSizes.base, color: Colors.textSecondary },
});
