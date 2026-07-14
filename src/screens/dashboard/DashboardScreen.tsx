import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ZIcon as Icon } from '../../components/ZIcon';
import { Card } from '../../components/Card';
import { CompanySwitcher } from '../../components/CompanySwitcher';
import { BookmarkEditModal } from '../../components/BookmarkEditModal';
import { useBookmarkStore } from '../../store/bookmarkStore';
import { APP_MODULES } from '../../data/modules';
import { dashboardApi, companyApi } from '../../services/api';
import { useCompanyStore } from '../../store/companyStore';
import { formatCurrency } from '../../utils/currency';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import type { AppStackParamList, BankAccount } from '../../types';

interface OsSummary {
  totalPurchase: number;
  totalSales: number;
  totalGp: number;
}

export const DashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { bookmarks, loadBookmarks } = useBookmarkStore();
  const { selectedCompany } = useCompanyStore();
  const [osSummary, setOsSummary] = useState<OsSummary>({ totalPurchase: 0, totalSales: 0, totalGp: 0 });
  const [editingBookmarks, setEditingBookmarks] = useState(false);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  useEffect(() => {
    if (selectedCompany?.recordId) {
      companyApi.getSummary(String(selectedCompany.recordId)).then(setOsSummary).catch(() => {});
    } else {
      setOsSummary({ totalPurchase: 0, totalSales: 0, totalGp: 0 });
    }
  }, [selectedCompany?.recordId]);

  // Resolve saved bookmark keys into module definitions (in saved order).
  const bookmarkedModules = bookmarks
    .map((k) => APP_MODULES.find((m) => m.key === k))
    .filter((m): m is (typeof APP_MODULES)[number] => Boolean(m));

  const accounts = selectedCompany?.banks || [];
  const totalBalance = accounts.reduce((sum, a) => sum + (a.dc === 'DB' ? a.balance : -a.balance), 0);

  // Build chart bars from real OS totals
  const osBars = [
    { label: 'Purchase', value: osSummary.totalPurchase, color: '#7C3AED' },
    { label: 'Sales', value: osSummary.totalSales, color: '#2563EB' },
    { label: 'GP', value: osSummary.totalGp, color: '#10B981' },

  ];
  const maxVal = Math.max(1, ...osBars.map((b) => b.value));

  return (
    <View style={styles.container}>
      {/* Header — global company switcher at the very top */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <CompanySwitcher />
        <Text style={styles.title}>Dashboard</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Bank & Cash Balance */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Bank &amp; Cash Balance</Text>
          {accounts.map((acc, index) => (
            <View key={index} style={styles.balanceRow}>
              <View style={styles.balanceLeft}>
                <View style={styles.balanceDot} />
                <View>
                  <Text style={styles.balanceName} numberOfLines={1}>{acc.name}</Text>
                  <Text style={styles.balanceAcc}>{acc.dc === 'DB' ? 'Debit' : 'Credit'}</Text>
                </View>
              </View>
              <Text style={styles.balanceAmount}>
                {acc.dc === 'DB' ? formatCurrency(acc.balance) : `-${formatCurrency(acc.balance)}`}
              </Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Balance</Text>
            <Text style={styles.totalAmount}>{formatCurrency(totalBalance)}</Text>
          </View>
        </Card>

        {/* Bookmarked Modules */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Bookmarked Modules</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditingBookmarks(true)} activeOpacity={0.7}>
            <Icon name="pencil-outline" size={14} color={Colors.primary} />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
        {bookmarkedModules.length === 0 ? (
          <TouchableOpacity style={styles.emptyBookmarks} onPress={() => setEditingBookmarks(true)} activeOpacity={0.8}>
            <Icon name="bookmark-plus-outline" size={22} color={Colors.primary} />
            <Text style={styles.emptyBookmarksText}>Tap Edit to add modules to your dashboard</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.bookmarkGrid}>
            {bookmarkedModules.map((b) => (
              <TouchableOpacity
                key={b.key}
                style={styles.bookmarkCard}
                onPress={() => navigation.navigate(b.route)}
                activeOpacity={0.85}
              >
                <View style={[styles.bookmarkIcon, { backgroundColor: `${b.color}1A` }]}>
                  <Icon name={b.icon} size={22} color={b.color} />
                </View>
                <Text style={styles.bookmarkLabel} numberOfLines={2}>{b.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Outstanding Summary */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Outstanding Summary</Text>
          <View style={styles.periodPill}>
            <Text style={styles.periodText}>All Time</Text>
          </View>
        </View>
        <Card style={styles.chartCard}>
          <View style={styles.legendRow}>
            {osBars.map((b) => (
              <View key={b.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: b.color }]} />
                <Text style={styles.legendText}>{b.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.chart}>
            {osBars.map((b) => (
              <View key={b.label} style={styles.barGroup}>
                <View style={styles.barPair}>
                  <View style={[styles.bar, { height: `${(b.value / maxVal) * 100}%`, backgroundColor: b.color }]} />
                </View>
                <Text style={styles.barLabel}>{b.label}</Text>
                <Text style={styles.barValue}>{formatCurrency(b.value)}</Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>

      <BookmarkEditModal visible={editingBookmarks} onClose={() => setEditingBookmarks(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  content: { padding: Spacing.md },
  card: { marginBottom: Spacing.lg },
  cardTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  balanceLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  balanceDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  balanceName: { fontSize: Typography.fontSizes.sm, color: Colors.textPrimary, fontWeight: Typography.fontWeights.medium },
  balanceAcc: { fontSize: Typography.fontSizes.xs, color: Colors.textMuted },
  balanceAmount: { fontSize: Typography.fontSizes.sm, color: Colors.textPrimary, fontWeight: Typography.fontWeights.semiBold },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
  },
  totalLabel: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  totalAmount: { fontSize: Typography.fontSizes.lg, fontWeight: Typography.fontWeights.extraBold, color: Colors.primary },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: { fontSize: Typography.fontSizes.md, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  editText: { fontSize: Typography.fontSizes.sm, color: Colors.primary, fontWeight: Typography.fontWeights.semiBold },
  emptyBookmarks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  emptyBookmarksText: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, flexShrink: 1 },

  bookmarkGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  bookmarkCard: {
    width: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.card,
  },
  bookmarkIcon: { width: 40, height: 40, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  bookmarkLabel: { flex: 1, fontSize: Typography.fontSizes.sm, fontWeight: Typography.fontWeights.semiBold, color: Colors.textPrimary },

  periodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.gray100,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  periodText: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, fontWeight: Typography.fontWeights.medium },

  chartCard: { marginBottom: Spacing.lg },
  legendRow: { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendText: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 180,
  },
  barGroup: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barPair: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 130 },
  bar: { width: 28, borderTopLeftRadius: 6, borderTopRightRadius: 6, minHeight: 4 },
  barLabel: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, marginTop: 6 },
  barValue: { fontSize: 9, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },
});
