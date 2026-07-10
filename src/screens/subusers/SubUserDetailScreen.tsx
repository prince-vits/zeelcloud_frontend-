import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ZIcon as Icon } from '../../components/ZIcon';
import { GradientHeader } from '../../components/GradientHeader';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useSubUserStore } from '../../store/subUserStore';
import { getInitials } from '../../utils/strings';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import type { SubUserStackParamList } from '../../types';

const splitName = (name: string) => {
  const parts = name.trim().split(' ');
  return { first: parts[0] ?? '', last: parts.slice(1).join(' ') };
};

export const SubUserDetailScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<SubUserStackParamList>>();
  const route = useRoute<RouteProp<SubUserStackParamList, 'SubUserDetail'>>();
  const { getById, deleteSubUser } = useSubUserStore();
  const user = getById(route.params.userId);
  const [showPass, setShowPass] = useState(false);

  if (!user) {
    return (
      <View style={styles.container}>
        <GradientHeader title="Sub User Details" onBack={() => navigation.goBack()} />
        <View style={styles.missing}>
          <Icon name="account-off-outline" size={48} color={Colors.gray300} />
          <Text style={styles.missingText}>This sub user no longer exists.</Text>
        </View>
      </View>
    );
  }

  const { first, last } = splitName(user.name);

  const handleDelete = () => {
    Alert.alert('Delete Sub User', `Remove ${user.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteSubUser(user.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const infoRows: { icon: string; label: string; value: string; secure?: boolean }[] = [
    { icon: 'account-outline', label: 'Username', value: user.username },
    { icon: 'lock-outline', label: 'Password', value: user.password, secure: true },
    { icon: 'phone-outline', label: 'Contact Number', value: user.phone },
    { icon: 'card-account-details-outline', label: 'First Name', value: first },
    { icon: 'card-account-details-outline', label: 'Last Name', value: last || '-' },
    { icon: 'email-outline', label: 'Email', value: user.email },
    { icon: 'office-building-outline', label: 'Company Name', value: user.companyName },
  ];

  return (
    <View style={styles.container}>
      <GradientHeader title="Sub User Details" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileHandle}>@{user.username}</Text>
            <Text style={styles.profileCompany}>{user.companyName}</Text>
          </View>
          <View style={[styles.statusBadge, user.isActive ? styles.activeBadge : styles.inactiveBadge]}>
            <View style={[styles.statusDot, { backgroundColor: user.isActive ? Colors.success : Colors.gray400 }]} />
            <Text style={[styles.statusText, { color: user.isActive ? Colors.success : Colors.gray500 }]}>
              {user.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </Card>

        {/* User information */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>User Information</Text>
          {infoRows.map((row, idx) => (
            <View key={row.label} style={[styles.infoRow, idx === infoRows.length - 1 && styles.infoRowLast]}>
              <View style={styles.infoIcon}>
                <Icon name={row.icon} size={16} color={Colors.primary} />
              </View>
              <Text style={styles.infoLabel}>{row.label}</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {row.secure && !showPass ? '••••••••' : row.value}
              </Text>
              {row.secure ? (
                <Icon
                  name={showPass ? 'eye-off-outline' : 'eye-outline'}
                  size={16}
                  color={Colors.textMuted}
                  style={styles.eye}
                  onPress={() => setShowPass((s) => !s)}
                />
              ) : null}
            </View>
          ))}
        </Card>

        {/* Allowed modules */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Allowed Modules ({user.allowedModules.length})</Text>
          {user.allowedModules.length === 0 ? (
            <Text style={styles.noModules}>No modules assigned.</Text>
          ) : (
            <View style={styles.moduleWrap}>
              {user.allowedModules.map((m) => (
                <View key={m} style={styles.moduleChip}>
                  <Icon name="check-circle" size={14} color={Colors.success} />
                  <Text style={styles.moduleText}>{m}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        <PrimaryButton
          title="Edit Sub User"
          icon="pencil-outline"
          onPress={() => navigation.navigate('EditSubUser', { userId: user.id })}
          style={styles.actionBtn}
        />
        <PrimaryButton
          title="Delete Sub User"
          icon="trash-can-outline"
          variant="danger"
          onPress={handleDelete}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xl },
  missing: { alignItems: 'center', paddingTop: 80, gap: Spacing.sm },
  missingText: { fontSize: Typography.fontSizes.base, color: Colors.textSecondary },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  profileHandle: { fontSize: Typography.fontSizes.sm, color: Colors.primary },
  profileCompany: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, marginTop: 1 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  activeBadge: { backgroundColor: Colors.successLight },
  inactiveBadge: { backgroundColor: Colors.gray100 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: Typography.fontSizes.xs, fontWeight: Typography.fontWeights.semiBold },

  card: { marginBottom: Spacing.md },
  cardTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoRowLast: { borderBottomWidth: 0 },
  infoIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  infoLabel: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, width: 110 },
  infoValue: {
    flex: 1,
    fontSize: Typography.fontSizes.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.medium,
    textAlign: 'right',
  },
  eye: { marginLeft: Spacing.sm },
  noModules: { fontSize: Typography.fontSizes.sm, color: Colors.textMuted },
  moduleWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  moduleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.gray50,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  moduleText: { fontSize: Typography.fontSizes.xs, color: Colors.textPrimary },
  actionBtn: { marginBottom: Spacing.sm },
  deleteOutline: { borderColor: Colors.danger },
});
