import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ZIcon as Icon } from '../../components/ZIcon';
import { useAuthStore } from '../../store/authStore';
import { InputField } from '../../components/InputField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Colors, Typography, Spacing } from '../../theme';
import type { RootStackParamList } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AppLock'>;
};

export const AppLockScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, unlockApp, isLoading, deactivateSession, getActiveAccount } = useAuthStore();
  const activeAccount = getActiveAccount();

  const [username, setUsername] = useState(user?.username ?? '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleUnlock = async () => {
    setUsernameError('');
    setPasswordError('');
    let valid = true;
    if (!username.trim()) {
      setUsernameError('Username is required');
      valid = false;
    }
    if (!password.trim()) {
      setPasswordError('Password is required');
      valid = false;
    }
    if (!valid) return;

    const success = await unlockApp(username, password);
    if (!success) {
      Alert.alert(
        'Unlock Failed',
        'Invalid credentials for this account. Please try again.',
      );
      return;
    }

    navigation.reset({ index: 0, routes: [{ name: 'App' }] });
  };

  const handleSwitchAccount = () => {
    navigation.navigate('AccountSwitcher');
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Sign out of this account on this device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await deactivateSession();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.xxl, paddingBottom: insets.bottom + Spacing.lg },
        ]}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.lockBadge}>
          <Icon name="lock" size={36} color={Colors.primary} />
        </View>

        <Text style={styles.title}>App Locked</Text>
        <Text style={styles.subtitle}>
          Enter your username and password to continue. Your session is still saved.
        </Text>

        {(activeAccount || user) && (
          <View style={styles.accountChip}>
            <Icon name="account-circle" size={22} color={Colors.primary} />
            <View style={styles.accountText}>
              <Text style={styles.accountName} numberOfLines={1}>
                {activeAccount?.name || user?.name || user?.username}
              </Text>
              <Text style={styles.accountMeta} numberOfLines={1}>
                {activeAccount?.role || (user?.isSubuser ? 'Sub User' : 'Admin')}
                {activeAccount?.companyName ? ` · ${activeAccount.companyName}` : ''}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.form}>
          <InputField
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            leftIcon="account-outline"
            error={usernameError}
            autoCapitalize="none"
          />
          <InputField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            leftIcon="lock-outline"
            rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowPassword(!showPassword)}
            error={passwordError}
            autoCapitalize="none"
          />

          <PrimaryButton
            title="UNLOCK"
            onPress={handleUnlock}
            loading={isLoading}
            style={styles.unlockButton}
          />

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={handleSwitchAccount}
            activeOpacity={0.8}
          >
            <Icon name="account-switch" size={18} color={Colors.primary} />
            <Text style={styles.secondaryText}>Switch Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.surface },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
  },
  lockBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: Typography.fontSizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  accountChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.gray100,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    marginBottom: Spacing.xl,
  },
  accountText: { flex: 1 },
  accountName: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textPrimary,
  },
  accountMeta: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  form: { gap: 0 },
  unlockButton: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
  },
  secondaryText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.semiBold,
  },
  signOutBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  signOutText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.danger,
    fontWeight: Typography.fontWeights.semiBold,
  },
});
