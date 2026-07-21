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
import { API_BASE_URL } from '../../config';
import { Colors, Typography, Spacing } from '../../theme';
import type { RootStackParamList } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export const LoginScreen: React.FC<Props> = () => {
  const insets = useSafeAreaInsets();
  const { login, isLoading } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLogin = async () => {
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
    const success = await login(username, password);
    if (!success) {
      Alert.alert('Login Failed', 'Invalid username or password. Please try again.');
    }
  };

  const handleForgot = () => {
    Alert.alert(
      'Forgot Password',
      'Please contact your administrator to reset your password.',
    );
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
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Icon name="cloud" size={30} color={Colors.primary} />
              <View style={styles.logoArrow}>
                <Icon name="trending-up" size={14} color={Colors.success} />
              </View>
            </View>
          </View>
          <Text style={styles.brand}>
            ZEEL <Text style={styles.brandLight}>CLOUD</Text>
          </Text>
          <Text style={styles.tagline}>Manage. Monitor. Grow.</Text>
        </View>

        {/* Welcome */}
        <Text style={styles.welcomeText}>Welcome Back!</Text>
        <Text style={styles.signInText}>Login to continue to your account.</Text>

        {/* Form */}
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

          {/* Remember + Forgot */}
          <View style={styles.rowBetween}>
            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                {rememberMe && <Icon name="check" size={13} color={Colors.textWhite} />}
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleForgot} activeOpacity={0.7}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <PrimaryButton
            title="LOGIN"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.loginButton}
          />

          {/* Secure login badge */}
          <View style={styles.secureRow}>
            <View style={styles.divider} />
            <View style={styles.secureBadge}>
              <Text style={styles.secureText}>Secure Login</Text>
              <Icon name="shield-check" size={16} color={Colors.success} />
            </View>
            <View style={styles.divider} />
          </View>
        </View>

        <Text style={styles.version}>Version 1.0.0</Text>
        {/* Diagnostic: the exact server the app is talking to. */}
        <Text style={styles.serverHint}>server: {API_BASE_URL}</Text>
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

  // Logo
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoRow: { marginBottom: Spacing.md },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoArrow: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  brand: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.extraBold,
    color: Colors.primary,
    letterSpacing: 1,
  },
  brandLight: {
    color: Colors.textPrimary,
  },
  tagline: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 4,
    letterSpacing: 0.5,
  },

  welcomeText: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  signInText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  form: { gap: 0 },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    marginTop: -Spacing.xs,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  rememberText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  forgotText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.semiBold,
  },
  loginButton: {
    marginBottom: Spacing.lg,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  secureText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  version: {
    textAlign: 'center',
    fontSize: Typography.fontSizes.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xl,
  },
  serverHint: {
    textAlign: 'center',
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
  },
});

