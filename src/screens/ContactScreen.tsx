import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ZeelCloudLogo } from '../components/ZeelCloudLogo';
import { GradientHeader } from '../components/GradientHeader';
import { Colors, Typography, Spacing } from '../theme';

const HEAD_OFFICE = {
  title: 'Head Office',
  lines: ['C433 Sumel Business Park-4,', 'Amdupura, Ahmedabad - 380025'],
  phone: '9016433675',
  tel: 'tel:9016433675',
};

const BRANCH_OFFICE = {
  title: 'Branch Office',
  lines: [
    'B311 Udhna sangh building, Udhyog nagar,',
    'Road no 10, Udhna, Surat - 394210',
  ],
  phone: '9712999741',
  tel: 'tel:9712999741',
};

const WEBSITE_URL = 'https://www.zeelinfotech.co.in';
const WEBSITE_LABEL = 'www.zeelinfotech.co.in';
const EMAIL = 'info@zeelinfotech.co.in';

export const ContactScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <View style={styles.container}>
      <GradientHeader title="Contact Us" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centered}>
          <ZeelCloudLogo size={80} style={styles.logo} />
          <Text style={styles.companyName}>Zeel Infosys</Text>

          <View style={styles.officeBlock}>
            <Text style={styles.officeText}>
              {HEAD_OFFICE.title}: {HEAD_OFFICE.lines[0]}
            </Text>
            <Text style={styles.officeText}>{HEAD_OFFICE.lines[1]}</Text>
            <TouchableOpacity onPress={() => Linking.openURL(HEAD_OFFICE.tel)} activeOpacity={0.7}>
              <Text style={styles.contactLine}>
                Contact : <Text style={styles.link}>{HEAD_OFFICE.phone}</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.officeBlock}>
            <Text style={styles.officeText}>
              {BRANCH_OFFICE.title}: {BRANCH_OFFICE.lines[0]}
            </Text>
            <Text style={styles.officeText}>{BRANCH_OFFICE.lines[1]}</Text>
            <TouchableOpacity onPress={() => Linking.openURL(BRANCH_OFFICE.tel)} activeOpacity={0.7}>
              <Text style={styles.contactLine}>
                Contact : <Text style={styles.link}>{BRANCH_OFFICE.phone}</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerLinks}>
            <Text style={styles.footerPlain}>
              For more details visit :{' '}
              <Text style={styles.link} onPress={() => Linking.openURL(WEBSITE_URL)}>
                {WEBSITE_LABEL}
              </Text>
            </Text>
            <Text style={styles.footerPlain}>
              Email :{' '}
              <Text style={styles.link} onPress={() => Linking.openURL(`mailto:${EMAIL}`)}>
                {EMAIL}
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  centered: {
    alignItems: 'center',
  },
  logo: {
    marginBottom: Spacing.md,
  },
  companyName: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  officeBlock: {
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  officeText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 18,
  },
  contactLine: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  divider: {
    alignSelf: 'stretch',
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  footerLinks: {
    marginTop: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  footerPlain: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: Colors.info,
    textDecorationLine: 'underline',
    fontWeight: Typography.fontWeights.medium,
  },
});
