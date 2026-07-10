import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ZIcon as Icon } from '../../components/ZIcon';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAuthStore } from '../../store/authStore';
import { Colors, Typography, Spacing } from '../../theme';

interface Row {
  icon: string;
  label: string;
  type: 'toggle' | 'link';
  value?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
}

export const SettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { logout } = useAuthStore();
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const preferences: Row[] = [
    { icon: 'bell-outline', label: 'Push Notifications', type: 'toggle', value: notifications, onToggle: setNotifications },
    { icon: 'fingerprint', label: 'Biometric Login', type: 'toggle', value: biometric, onToggle: setBiometric },
    {
      icon: 'lock-reset',
      label: 'Change Password',
      type: 'link',
      onPress: () => Alert.alert('Change Password', 'Please contact your administrator to reset your password.'),
    },
  ];

  const about: Row[] = [
    { icon: 'information-outline', label: 'About ZeelCloud', type: 'link', onPress: () => Alert.alert('ZeelCloud', 'Version 1.0.0\nEnterprise ERP for the textile industry.') },
    { icon: 'help-circle-outline', label: 'Help & Support', type: 'link', onPress: () => Alert.alert('Help & Support', 'Email: support@zeelinfosys.com') },
  ];

  const renderRow = (row: Row, isLast: boolean) => (
    <TouchableOpacity
      key={row.label}
      style={[styles.row, isLast && styles.rowLast]}
      activeOpacity={row.type === 'link' ? 0.7 : 1}
      onPress={row.onPress}
      disabled={row.type === 'toggle'}
    >
      <View style={styles.rowIcon}>
        <Icon name={row.icon} size={18} color={Colors.primary} />
      </View>
      <Text style={styles.rowLabel}>{row.label}</Text>
      {row.type === 'toggle' ? (
        <Switch
          value={row.value}
          onValueChange={row.onToggle}
          trackColor={{ false: Colors.gray300, true: Colors.primary }}
          thumbColor={Colors.surface}
        />
      ) : (
        <Icon name="chevron-right" size={20} color={Colors.gray400} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSub}>Preferences and account</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>Preferences</Text>
        <Card style={styles.card}>{preferences.map((r, i) => renderRow(r, i === preferences.length - 1))}</Card>

        <Text style={styles.sectionLabel}>About</Text>
        <Card style={styles.card}>{about.map((r, i) => renderRow(r, i === about.length - 1))}</Card>

        <PrimaryButton title="Sign Out" icon="logout" variant="danger" onPress={handleLogout} style={styles.logout} />
      </ScrollView>
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
  content: { padding: Spacing.md },
  sectionLabel: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  card: { padding: 0, marginBottom: Spacing.lg, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowLast: { borderBottomWidth: 0 },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  rowLabel: {
    flex: 1,
    fontSize: Typography.fontSizes.base,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.medium,
  },
  logout: { marginTop: Spacing.sm },
});
