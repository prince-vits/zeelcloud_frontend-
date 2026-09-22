import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ZIcon as Icon } from '../../components/ZIcon';
import { useAuthStore, SavedAccount } from '../../store/authStore';
import { Colors, Typography, Spacing } from '../../theme';
import type { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function AccountSwitcherScreen() {
  const navigation = useNavigation<NavigationProp>();
  const savedAccounts = useAuthStore((state) => state.savedAccounts);
  const activeAccountId = useAuthStore((state) => state.activeAccountId);
  const switchAccount = useAuthStore((state) => state.switchAccount);
  const removeAccount = useAuthStore((state) => state.removeAccount);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const isAppLocked = useAuthStore((state) => state.isAppLocked);

  const handleSwitchAccount = async (account: SavedAccount) => {
    if (account.accountId === activeAccountId && isLoggedIn) {
      // Already active — return to lock gate or app
      if (isAppLocked) {
        navigation.navigate('AppLock');
      } else {
        navigation.navigate('App');
      }
      return;
    }
    await switchAccount(account.accountId);
  };

  const handleRemoveAccount = (account: SavedAccount) => {
    Alert.alert(
      'Remove Account',
      `Are you sure you want to remove ${account.name} from this device?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeAccount(account.accountId),
        },
      ]
    );
  };

  const renderAccount = ({ item }: { item: SavedAccount }) => {
    const isActive = item.accountId === activeAccountId && isLoggedIn;

    return (
      <TouchableOpacity
        style={[styles.accountCard, isActive && styles.accountCardActive]}
        onPress={() => handleSwitchAccount(item)}
      >
        <View style={styles.avatarContainer}>
          <Icon
            name="account"
            size={24}
            color={isActive ? Colors.primary : Colors.textSecondary}
          />
        </View>
        <View style={styles.accountInfo}>
          <Text style={[styles.accountName, isActive && styles.accountNameActive]}>
            {item.name}
          </Text>
          <Text style={styles.accountRole}>
            {item.role} • {item.companyName}
          </Text>
          <Text style={styles.accountUsername}>@{item.username}</Text>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveAccount(item)}
        >
          <Icon name="trash-can-outline" size={20} color={Colors.danger} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Switch Account</Text>
        <Text style={styles.subtitle}>Select an account to continue</Text>
      </View>

      <FlatList
        data={savedAccounts}
        keyExtractor={(item) => item.accountId}
        renderItem={renderAccount}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Icon name="plus" size={20} color={Colors.primary} />
          <Text style={styles.addButtonText}>Add New Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSizes.xxxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
  },
  listContainer: {
    padding: Spacing.md,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  accountCardActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}05`, // 5% opacity
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: Typography.fontSizes.md,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  accountNameActive: {
    color: Colors.primary,
  },
  accountRole: {
    fontSize: Typography.fontSizes.base,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  accountUsername: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textMuted,
  },
  removeButton: {
    padding: Spacing.sm,
  },
  separator: {
    height: 12,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    backgroundColor: `${Colors.primary}10`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
  },
  addButtonText: {
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSizes.md,
    fontWeight: '600',
    color: Colors.primary,
  },
});
