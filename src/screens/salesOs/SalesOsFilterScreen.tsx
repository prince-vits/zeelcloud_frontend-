import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ZIcon as Icon } from '../../components/ZIcon';
import { GradientHeader } from '../../components/GradientHeader';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useCompanyStore } from '../../store/companyStore';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { rangeFor, PeriodKey } from '../../utils/dateRange';
import type { SalesOsStackParamList, ReportFilter } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<SalesOsStackParamList, 'SalesOsFilter'>;
};

const reportTypes = [
  { key: 'party', label: 'Party Wise', icon: 'account-group-outline' },
  { key: 'broker', label: 'Broker Wise', icon: 'handshake-outline' },
  { key: 'area', label: 'Area Wise', icon: 'map-marker-outline' },
  { key: 'partyGroup', label: 'Party Group', icon: 'folder-outline' },
  { key: 'salesPerson', label: 'Sales Person', icon: 'badge-account-outline' },
];

const quickPresets: PeriodKey[] = ['This Week', 'This Month', 'This Quarter', 'This Year'];

export const SalesOsFilterScreen: React.FC<Props> = ({ navigation }) => {
  const { selectedCompany } = useCompanyStore();

  const [reportType, setReportType] = useState('party');
  const [activePreset, setActivePreset] = useState<PeriodKey>('This Month');
  // Dates derived dynamically from the selected preset — no hard-coded values.
  const range = rangeFor(activePreset);
  const fromDate = range?.from ?? '';
  const toDate = range?.to ?? '';

  const handleGenerate = () => {
    const filter: ReportFilter = {
      reportType,
      fromDate,
      toDate,
    };
    switch (reportType) {
      case 'party':
        navigation.navigate('SalesOsPartyList', { filter });
        break;
      case 'broker':
        navigation.navigate('SalesOsBrokerList', { filter });
        break;
      case 'area':
        navigation.navigate('SalesOsAreaList', { filter });
        break;
      case 'partyGroup':
        navigation.navigate('SalesOsPartyGroupList', { filter });
        break;
      case 'salesPerson':
        navigation.navigate('SalesOsSalesPersonList', { filter });
        break;
    }
  };

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Sales Outstanding"
        subtitle={selectedCompany?.name}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Report Type */}
        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>Report Type</Text>
          <View style={styles.chipsRow}>
            {reportTypes.map((rt) => (
              <TouchableOpacity
                key={rt.key}
                style={[styles.chip, reportType === rt.key && styles.chipActive]}
                onPress={() => setReportType(rt.key)}
                activeOpacity={0.8}
              >
                <Icon
                  name={rt.icon}
                  size={14}
                  color={reportType === rt.key ? Colors.textWhite : Colors.gradientStart}
                />
                <Text style={[styles.chipText, reportType === rt.key && styles.chipTextActive]}>
                  {rt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Date Range */}
        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>Date Range</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>From</Text>
              <View style={styles.dateInput}>
                <Icon name="calendar-outline" size={16} color={Colors.gradientStart} />
                <Text style={styles.dateValue}>{fromDate}</Text>
              </View>
            </View>
            <Icon name="arrow-right" size={18} color={Colors.gray400} style={styles.dateArrow} />
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>To</Text>
              <View style={styles.dateInput}>
                <Icon name="calendar-outline" size={16} color={Colors.gradientStart} />
                <Text style={styles.dateValue}>{toDate}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.presetLabel}>Quick Presets</Text>
          <View style={styles.presetRow}>
            {quickPresets.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.presetChip, activePreset === p && styles.presetChipActive]}
                onPress={() => setActivePreset(p)}
                activeOpacity={0.8}
              >
                <Text style={[styles.presetText, activePreset === p && styles.presetTextActive]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <PrimaryButton
          title="Generate Report"
          onPress={handleGenerate}
          icon="chart-bar"
          style={styles.generateBtn}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xl },
  card: { marginBottom: Spacing.md },
  sectionLabel: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: Colors.gradientStart,
    backgroundColor: Colors.purple100,
  },
  chipActive: {
    backgroundColor: Colors.gradientStart,
    borderColor: Colors.gradientStart,
  },
  chipText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.gradientStart,
    fontWeight: Typography.fontWeights.medium,
  },
  chipTextActive: {
    color: Colors.textWhite,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dateField: { flex: 1 },
  dateLabel: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateValue: {
    fontSize: Typography.fontSizes.base,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.medium,
  },
  dateArrow: {
    marginHorizontal: Spacing.sm,
    marginTop: 14,
  },
  presetLabel: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    fontWeight: Typography.fontWeights.medium,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  presetChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetChipActive: {
    backgroundColor: Colors.infoLight,
    borderColor: Colors.info,
  },
  presetText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
  presetTextActive: {
    color: Colors.info,
  },
  generateBtn: { marginTop: Spacing.sm },
});
