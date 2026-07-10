import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ZIcon as Icon } from '../components/ZIcon';
import { GradientHeader } from '../components/GradientHeader';
import { Card } from '../components/Card';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

export const AboutScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const features = [
    { icon: 'currency-inr', label: 'Sales Outstanding', desc: 'Track party-wise outstanding reports' },
    { icon: 'cart-outline', label: 'Purchase Outstanding', desc: 'Monitor supplier outstanding amounts' },
    { icon: 'chart-bar', label: 'GP Register', desc: 'Job work / processing records' },
    { icon: 'package-variant', label: 'Stock Management', desc: 'Yarn, beam and fabric stock' },
    { icon: 'book-open-outline', label: 'Ledger', desc: 'Account-wise ledger statements' },
    { icon: 'receipt', label: 'Registers', desc: 'Sales and purchase invoice register' },
  ];

  return (
    <View style={styles.container}>
      <GradientHeader title="About ZeelCloud" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Logo */}
        <View style={styles.logoSection}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            style={styles.logoCircle}
          >
            <Text style={styles.logoText}>ZI</Text>
          </LinearGradient>
          <Text style={styles.appName}>ZeelCloud</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>Enterprise ERP for Textile Industry</Text>
          </View>
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>About the App</Text>
          <Text style={styles.description}>
            ZeelCloud is a comprehensive ERP mobile application designed specifically for the textile
            and manufacturing business. It provides real-time access to critical business data
            including outstanding reports, stock management, ledger statements, and production records.
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Key Features</Text>
          {features.map((f) => (
            <View key={f.label} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Icon name={f.icon} size={18} color={Colors.gradientStart} />
              </View>
              <View style={styles.featureInfo}>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Developer</Text>
          <View style={styles.devRow}>
            <View style={styles.devAvatar}>
              <Icon name="office-building" size={24} color={Colors.textWhite} />
            </View>
            <View>
              <Text style={styles.devName}>Zeel Infosys Pvt Ltd</Text>
              <Text style={styles.devRole}>Software Development</Text>
              <Text style={styles.devCity}>Surat, Gujarat, India</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.footer}>
          {'©'} 2024 Zeel Infosys Pvt Ltd. All rights reserved.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xl },
  logoSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logoText: { fontSize: 28, fontWeight: Typography.fontWeights.extraBold, color: Colors.textWhite },
  appName: { fontSize: Typography.fontSizes.xxl, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  version: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  tagBadge: {
    backgroundColor: Colors.purple100,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.gradientStart,
  },
  tagText: { fontSize: Typography.fontSizes.xs, color: Colors.gradientStart, fontWeight: Typography.fontWeights.medium },
  card: { marginBottom: Spacing.md },
  cardTitle: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  description: { fontSize: Typography.fontSizes.base, color: Colors.textSecondary, lineHeight: 22 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  featureIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.purple100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  featureInfo: { flex: 1 },
  featureLabel: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.semiBold, color: Colors.textPrimary },
  featureDesc: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary },
  devRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  devAvatar: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.gradientStart,
    justifyContent: 'center',
    alignItems: 'center',
  },
  devName: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  devRole: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary },
  devCity: { fontSize: Typography.fontSizes.xs, color: Colors.textMuted },
  footer: {
    textAlign: 'center',
    fontSize: Typography.fontSizes.xs,
    color: Colors.textMuted,
    marginTop: Spacing.lg,
  },
});
