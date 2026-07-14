import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ZIcon as Icon } from '../../components/ZIcon';
import { GradientHeader } from '../../components/GradientHeader';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { stockApi } from '../../services/api';
import { useCompanyStore } from '../../store/companyStore';
import { formatCurrency } from '../../utils/currency';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import type { StockStackParamList, StockItem } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<StockStackParamList, 'Stock'>;
};

interface StockReport {
  label: string;
  desc: string;
  category: StockItem['category'];
  icon: string;
  accent: string;
  report: 'yarn' | 'gray' | 'beam';
}

const reports: StockReport[] = [
  { label: 'Yarn Stock', desc: 'Cotton, polyester, viscose & silk yarn', category: 'yarn', icon: 'thread', accent: Colors.primary, report: 'yarn' },
  { label: 'Gray Stock', desc: 'Undyed / gray fabric inventory', category: 'nonIssue', icon: 'package-variant-closed', accent: Colors.success, report: 'gray' },
  { label: 'Beam Stock', desc: 'Warp beams on the loom floor', category: 'beam', icon: 'layers', accent: '#7C3AED', report: 'beam' },
];

export const StockScreen: React.FC<Props> = ({ navigation }) => {
  const { selectedCompany } = useCompanyStore();
  const [stock, setStock] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    stockApi
      .getAll(selectedCompany?.id)
      .then((data) => {
        setStock(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedCompany?.id]);

  const statsFor = (r: StockReport) => {
    const items = stock.filter((s) => s.category === r.category);
    const value = items.reduce((sum, s) => sum + s.value, 0);
    return { count: items.length, value };
  };

  return (
    <View style={styles.container}>
      <GradientHeader title="Stock" subtitle="Inventory reports" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.hint}>Select a report to view its inventory</Text>

        {reports.map((r) => {
          const { count, value } = statsFor(r);
          return (
            <TouchableOpacity
              key={r.report}
              style={styles.card}
              onPress={() => navigation.navigate('StockFilter', { report: r.report })}
              activeOpacity={0.85}
            >
              <View style={[styles.icon, { backgroundColor: `${r.accent}1A` }]}>
                <Icon name={r.icon} size={24} color={r.accent} />
              </View>
              <View style={styles.info}>
                <Text style={styles.label}>{r.label}</Text>
                <Text style={styles.desc}>{r.desc}</Text>
                {!loading ? (
                  <Text style={styles.stats}>
                    {count} items · <Text style={{ color: r.accent }}>{formatCurrency(value)}</Text>
                  </Text>
                ) : null}
              </View>
              <Icon name="chevron-right" size={22} color={Colors.gray400} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <LoadingOverlay visible={loading} message="Loading stock..." />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xl },
  hint: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },
  icon: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  info: { flex: 1 },
  label: { fontSize: Typography.fontSizes.md, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  desc: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, marginTop: 1 },
  stats: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, fontWeight: Typography.fontWeights.medium, marginTop: 6 },
});
