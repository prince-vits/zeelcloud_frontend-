import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ZeelCloudLogo } from '../components/ZeelCloudLogo';
import { GradientHeader } from '../components/GradientHeader';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { Colors, Typography, Spacing } from '../theme';

const PRIVACY_URL = 'https://zeelinfotech.co.in/privacy';
const APP_VERSION = '1.0.0';

export const AboutScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <View style={styles.container}>
      <GradientHeader title="About" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <ZeelCloudLogo size={100} style={styles.logo} />
          <Text style={styles.companyName}>Zeel Infosys</Text>
          <Text style={styles.version}>Version: {APP_VERSION}</Text>
          <Text style={styles.copyright}>
            {'©'} Copyright Zeel Infosys. All Rights Reserved
          </Text>

          <PrimaryButton
            title="Privacy"
            onPress={() => Linking.openURL(PRIVACY_URL)}
            style={styles.privacyButton}
          />
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>About the App</Text>
          <Text style={styles.description}>
            ZeelCloud is a comprehensive ERP mobile application designed specifically for the textile
            and manufacturing business. It provides real-time access to critical business data
            including outstanding reports, stock management, ledger statements, and production records.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  hero: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  logo: {
    marginBottom: Spacing.md,
  },
  companyName: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  version: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  copyright: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  privacyButton: {
    alignSelf: 'stretch',
    marginHorizontal: Spacing.xl,
  },
  card: {
    marginTop: Spacing.md,
  },
  cardTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: Typography.fontSizes.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});
