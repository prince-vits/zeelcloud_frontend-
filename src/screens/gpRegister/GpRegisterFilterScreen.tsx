import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ZIcon as Icon } from '../../components/ZIcon';
import { GradientHeader } from '../../components/GradientHeader';
import { Card } from '../../components/Card';
import { DateField } from '../../components/DateField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useCompanyStore } from '../../store/companyStore';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { rangeFor, PeriodKey } from '../../utils/dateRange';
import { OG_START_DATE, todayIso } from '../../utils/formatDate';
import type { GpRegisterStackParamList, ReportFilter } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<GpRegisterStackParamList, 'GpRegisterFilter'>;
};

const quickPresets: PeriodKey[] = ['This Week', 'This Month', 'This Quarter', 'This Year'];

export const GpRegisterFilterScreen: React.FC<Props> = ({ navigation }) => {
  const { selectedCompany } = useCompanyStore();
  const [activePreset, setActivePreset] = useState<PeriodKey | 'Custom'>('Custom');
  const [fromDate, setFromDate] = useState(OG_START_DATE);
  const [toDate, setToDate] = useState(todayIso());

  React.useEffect(() => {
    if (activePreset !== 'Custom') {
      const range = rangeFor(activePreset);
      setFromDate(range?.from ?? '');
      setToDate(range?.to ?? '');
    }
  }, [activePreset]);

  const handleCustomDateChange = (field: 'from' | 'to', value: string) => {
    setActivePreset('Custom');
    if (field === 'from') setFromDate(value);
    else setToDate(value);
  };

  const handleGenerate = () => {
    const filter: ReportFilter = {
      reportType: 'gp',
      fromDate,
      toDate,
      companyId: selectedCompany?.id,
    };
    navigation.navigate('GpRegister', { filter });
  };

  return (
    <View style={styles.container}>
      <GradientHeader
        title="GP Register"
        subtitle={selectedCompany?.name}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Text style={styles.label}>Date Range</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <DateField label="From" value={fromDate} defaultDate={OG_START_DATE} onChange={(val) => handleCustomDateChange('from', val)} />
            </View>
            <Icon name="arrow-right" size={18} color={Colors.gray400} style={styles.arrow} />
            <View style={styles.dateField}>
              <DateField label="To" value={toDate} onChange={(val) => handleCustomDateChange('to', val)} />
            </View>
          </View>
          <Text style={styles.presetLabel}>Quick Presets</Text>
          <View style={styles.presetRow}>
            {quickPresets.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.presetChip, activePreset === p && styles.presetChipActive]}
                onPress={() => setActivePreset(p)}
              >
                <Text style={[styles.presetText, activePreset === p && styles.presetTextActive]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <PrimaryButton title="Generate Report" onPress={handleGenerate} icon="chart-bar" />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xl },
  card: { marginBottom: Spacing.md },
  label: { fontSize: Typography.fontSizes.sm, fontWeight: Typography.fontWeights.semiBold, color: Colors.textSecondary, marginBottom: Spacing.sm, textTransform: 'uppercase' },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  dateField: { flex: 1 },
  arrow: { marginHorizontal: Spacing.sm, marginTop: 14 },
  presetLabel: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, marginBottom: Spacing.sm, fontWeight: Typography.fontWeights.medium },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  presetChip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.sm, backgroundColor: Colors.gray100, borderWidth: 1, borderColor: Colors.border },
  presetChipActive: { backgroundColor: Colors.infoLight, borderColor: Colors.info },
  presetText: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, fontWeight: Typography.fontWeights.medium },
  presetTextActive: { color: Colors.info },
});
