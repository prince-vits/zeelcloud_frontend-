import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ZIcon as Icon } from '../components/ZIcon';
import { GradientHeader } from '../components/GradientHeader';
import { Card } from '../components/Card';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

const contactDetails = [
  {
    icon: 'phone',
    label: 'Phone',
    value: '+91 98765 43210',
    action: () => Linking.openURL('tel:+919876543210'),
    color: Colors.success,
  },
  {
    icon: 'email-outline',
    label: 'Email',
    value: 'info@zeelinfosys.com',
    action: () => Linking.openURL('mailto:info@zeelinfosys.com'),
    color: Colors.info,
  },
  {
    icon: 'whatsapp',
    label: 'WhatsApp',
    value: '+91 98765 43210',
    action: () => Linking.openURL('https://wa.me/919876543210'),
    color: '#25D366',
  },
  {
    icon: 'map-marker',
    label: 'Address',
    value: 'Zeel Infosys Pvt Ltd, Ring Road, Surat - 395002, Gujarat, India',
    action: () => Linking.openURL('https://maps.google.com/?q=Surat,Gujarat'),
    color: Colors.danger,
  },
  {
    icon: 'web',
    label: 'Website',
    value: 'www.zeelinfosys.com',
    action: () => Linking.openURL('https://www.zeelinfosys.com'),
    color: Colors.gradientStart,
  },
];

const officeHours = [
  { day: 'Monday - Friday', time: '9:00 AM - 6:00 PM' },
  { day: 'Saturday', time: '9:00 AM - 2:00 PM' },
  { day: 'Sunday', time: 'Closed' },
];

export const ContactScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <View style={styles.container}>
      <GradientHeader title="Contact Us" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Get in Touch</Text>
          <Text style={styles.subtitle}>
            For support, queries, or feedback, feel free to reach out to us through any of the following channels.
          </Text>
          {contactDetails.map((c) => (
            <TouchableOpacity
              key={c.label}
              style={styles.contactRow}
              onPress={c.action}
              activeOpacity={0.8}
            >
              <View style={[styles.contactIcon, { backgroundColor: c.color + '20' }]}>
                <Icon name={c.icon} size={22} color={c.color} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>{c.label}</Text>
                <Text style={styles.contactValue}>{c.value}</Text>
              </View>
              <Icon name="chevron-right" size={18} color={Colors.gray300} />
            </TouchableOpacity>
          ))}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Office Hours</Text>
          {officeHours.map((h) => (
            <View key={h.day} style={styles.hoursRow}>
              <Text style={styles.hoursDay}>{h.day}</Text>
              <Text style={[styles.hoursTime, h.time === 'Closed' && styles.closedText]}>
                {h.time}
              </Text>
            </View>
          ))}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Support</Text>
          <TouchableOpacity
            style={styles.supportBtn}
            onPress={() =>
              Alert.alert('Support', 'Support ticket creation will be available in the next update.')
            }
            activeOpacity={0.85}
          >
            <Icon name="ticket-account" size={20} color={Colors.gradientStart} />
            <Text style={styles.supportText}>Create Support Ticket</Text>
            <Icon name="arrow-right" size={16} color={Colors.gradientStart} />
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xl },
  card: { marginBottom: Spacing.md },
  cardTitle: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  subtitle: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.md, lineHeight: 20 },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: { flex: 1 },
  contactLabel: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, marginBottom: 2 },
  contactValue: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.medium, color: Colors.textPrimary },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  hoursDay: { fontSize: Typography.fontSizes.base, color: Colors.textPrimary },
  hoursTime: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.medium, color: Colors.success },
  closedText: { color: Colors.danger },
  supportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.purple100,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gradientStart,
  },
  supportText: {
    flex: 1,
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.gradientStart,
  },
});
