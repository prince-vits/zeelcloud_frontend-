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
import { dashboardApi } from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import type { AppStackParamList, BankAccount, SalesReportPoint } from '../../types';

export const DashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { bookmarks, loadBookmarks } = useBookmarkStore();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [report, setReport] = useState<SalesReportPoint[]>([]);
  const [editingBookmarks, setEditingBookmarks] = useState(false);

  useEffect(() => {
    dashboardApi.getBankAccounts().then(setAccounts);
    dashboardApi.getSalesReport().then(setReport);
    loadBookmarks();
  }, []);

  // Resolve saved bookmark keys into module definitions (in saved order).
  const bookmarkedModules = bookmarks
    .map((k) => APP_MODULES.find((m) => m.key === k))
    .filter((m): m is (typeof APP_MODULES)[number] => Boolean(m));

  const totalBalance = accounts.reduce((sum, a) => sum + a.amount, 0);
  const maxVal = Math.max(1, ...report.flatMap((p) => [p.thisWeek, p.lastWeek]));

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
          {accounts.map((acc) => (
            <View key={acc.id} style={styles.balanceRow}>
              <View style={styles.balanceLeft}>
                <View style={styles.balanceDot} />
                <View>
                  <Text style={styles.balanceName} numberOfLines={1}>{acc.name}</Text>
                  {acc.accountNo ? <Text style={styles.balanceAcc}>A/C {acc.accountNo}</Text> : null}
                </View>
              </View>
              <Text style={styles.balanceAmount}>{formatCurrency(acc.amount)}</Text>
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

        {/* Sales Report Overview */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Sales Report Overview</Text>
          <View style={styles.periodPill}>
            <Text style={styles.periodText}>This Week</Text>
            <Icon name="chevron-down" size={14} color={Colors.textSecondary} />
          </View>
        </View>
        <Card style={styles.chartCard}>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
              <Text style={styles.legendText}>This Week</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.primaryLight }]} />
              <Text style={styles.legendText}>Last Week</Text>
            </View>
          </View>
          <View style={styles.chart}>
            {report.map((p) => (
              <View key={p.label} style={styles.barGroup}>
                <View style={styles.barPair}>
                  <View style={[styles.bar, { height: `${(p.thisWeek / maxVal) * 100}%`, backgroundColor: Colors.primary }]} />
                  <View style={[styles.bar, { height: `${(p.lastWeek / maxVal) * 100}%`, backgroundColor: Colors.primaryLight }]} />
                </View>
                <Text style={styles.barLabel}>{p.label}</Text>
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
    justifyContent: 'space-between',
    height: 160,
  },
  barGroup: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barPair: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 130 },
  bar: { width: 9, borderTopLeftRadius: 3, borderTopRightRadius: 3, minHeight: 3 },
  barLabel: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, marginTop: 6 },
});
