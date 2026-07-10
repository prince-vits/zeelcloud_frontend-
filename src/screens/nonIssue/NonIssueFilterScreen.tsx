import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ZIcon as Icon } from '../../components/ZIcon';
import { GradientHeader } from '../../components/GradientHeader';
import { Card } from '../../components/Card';
import { SelectField } from '../../components/SelectField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Colors, Typography, Spacing } from '../../theme';
import type { NonIssueStackParamList, StockReportType } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<NonIssueStackParamList, 'NonIssueFilter'>;
  route: RouteProp<NonIssueStackParamList, 'NonIssueFilter'>;
};

const REPORT_META: Record<Props['route']['params']['report'], { title: string; target: keyof NonIssueStackParamList; icon: string }> = {
  yarn: { title: 'Yarn', target: 'NonIssueYarn', icon: 'thread' },
  gray: { title: 'Gray', target: 'NonIssueGray', icon: 'grid-large' },
  beam: { title: 'Beam', target: 'NonIssueBeam', icon: 'layers' },
};

// Report-type options per category, matching the OG NonIssueReportSelection.
const OPTIONS_BY_REPORT: Record<Props['route']['params']['report'], string[]> = {
  yarn: ['Quality Wise', 'Quality + Lot No. + Grade Wise'],
  gray: ['Quality Wise'],
  beam: ['Quality Wise'],
};
const toReportType = (label: string): StockReportType =>
  label.startsWith('Quality + Lot') ? 'qualityLotGrade' : 'quality';

export const NonIssueFilterScreen: React.FC<Props> = ({ navigation, route }) => {
  const meta = REPORT_META[route.params.report];
  const options = OPTIONS_BY_REPORT[route.params.report];
  const [reportTypeLabel, setReportTypeLabel] = useState(options[0]);

  const handleView = () => {
    const reportType = toReportType(reportTypeLabel);
    navigation.navigate(meta.target as any, { reportType });
  };

  return (
    <View style={styles.container}>
      <GradientHeader title={meta.title} subtitle="Select Report" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Card style={styles.card}>
          <View style={styles.iconRow}>
            <View style={styles.iconWrap}>
              <Icon name={meta.icon} size={22} color={Colors.primary} />
            </View>
            <View style={styles.iconInfo}>
              <Text style={styles.cardTitle}>{meta.title}</Text>
              <Text style={styles.cardSub}>Choose how you want to view this report</Text>
            </View>
          </View>
          <SelectField
            label="Report Type"
            value={reportTypeLabel}
            options={options}
            onSelect={setReportTypeLabel}
            leftIcon="filter-variant"
          />
        </Card>

        <PrimaryButton title="View Report" icon="table" onPress={handleView} style={styles.viewBtn} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md },
  card: { marginBottom: Spacing.lg },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconInfo: { flex: 1 },
  cardTitle: { fontSize: Typography.fontSizes.md, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  cardSub: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  viewBtn: {},
});
