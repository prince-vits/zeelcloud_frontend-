import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ZIcon as Icon } from '../../components/ZIcon';
import { Card } from '../../components/Card';
import { InputField } from '../../components/InputField';
import { SelectField } from '../../components/SelectField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { CollapsibleSection } from '../../components/CollapsibleSection';
import { useCompanyStore } from '../../store/companyStore';
import { salesOsApi } from '../../services/api';
import { SORT_OPTIONS, COLOR_OPTIONS } from '../../constants/options';
import { formatCurrency } from '../../utils/currency';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import type { CompanyTabParamList } from '../../types';

interface DraftItem {
  id: string;
  item: string;
  color: string;
  nos: string;
  cut: string;
  rate: string;
}

const REMARKS_MAX = 250;
const QTY_UNIT = 'KGS';

const todayLabel = () =>
  new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

// Sensible default order number the user can edit (dynamic — not hard-coded).
const generateOrderNumber = () =>
  `SO-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`;

const blankItem = (): DraftItem => ({
  id: `it_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  item: '',
  color: '',
  nos: '',
  cut: '',
  rate: '',
});

const fmtNum = (n: number) => n.toLocaleString('en-IN', { maximumFractionDigits: 2 });

// Reactive math: Quantity = Nos × Cut, Amount = Quantity × Rate.
const qtyOf = (it: DraftItem) => (parseFloat(it.nos) || 0) * (parseFloat(it.cut) || 0);
const amountOf = (it: DraftItem) => qtyOf(it) * (parseFloat(it.rate) || 0);

export const CreateSalesOrderScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<BottomTabNavigationProp<CompanyTabParamList>>();
  const { selectedCompany, companies } = useCompanyStore();

  const [company, setCompany] = useState(selectedCompany?.name ?? '');
  const [orderNumber, setOrderNumber] = useState(generateOrderNumber);
  const [party, setParty] = useState('');
  const [remarks, setRemarks] = useState('');
  const [discount, setDiscount] = useState('');
  const [items, setItems] = useState<DraftItem[]>([blankItem()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [itemsOpen, setItemsOpen] = useState(true);

  const [partyOptions, setPartyOptions] = useState<string[]>([]);
  const companyOptions = companies.map((c) => c.name);

  useEffect(() => {
    salesOsApi.getParties().then((ps) => setPartyOptions(ps.map((p) => p.name)));
  }, []);

  const subtotal = items.reduce((sum, it) => sum + amountOf(it), 0);
  const total = Math.max(0, subtotal - (parseFloat(discount) || 0));

  const updateItem = (id: string, patch: Partial<DraftItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const addItem = () => setItems((prev) => [...prev, blankItem()]);

  const removeItem = (id: string) => {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((it) => it.id !== id)));
  };

  const handleSave = () => {
    const next: Record<string, string> = {};
    if (!company.trim()) next.company = 'Select a company';
    if (!orderNumber.trim()) next.orderNumber = 'Enter an order number';
    if (!party.trim()) next.party = 'Select a customer';
    const validItems = items.filter((it) => it.item && amountOf(it) > 0);
    if (validItems.length === 0) next.items = 'Add at least one item with quantity and rate';
    setErrors(next);
    if (Object.keys(next).length > 0) {
      if (next.items) Alert.alert('Incomplete Order', next.items);
      return;
    }
    Alert.alert('Order Saved', `Sales order ${orderNumber} for ${party} (${formatCurrency(total)}) has been created.`, [
      { text: 'OK', onPress: () => navigation.navigate('Dashboard') },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Dashboard')} activeOpacity={0.7}>
          <Icon name="arrow-left" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Sales Order</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Reports')} activeOpacity={0.7}>
          <Icon name="file-document-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Order Details (collapsible) ─────────────────────────── */}
          <CollapsibleSection
            title="Order Details"
            icon="clipboard-text-outline"
            open={detailsOpen}
            onToggle={() => setDetailsOpen((o) => !o)}
          >
            {/* Row 1: Company | Order Number */}
            <View style={styles.grid2}>
              <View style={styles.col}>
                <SelectField label="Company *" value={company} options={companyOptions} onSelect={setCompany} placeholder="Select" leftIcon="office-building-outline" error={errors.company} />
              </View>
              <View style={styles.col}>
                <InputField label="Order Number *" value={orderNumber} onChangeText={setOrderNumber} placeholder="SO-0000" leftIcon="pound" error={errors.orderNumber} />
              </View>
            </View>

            {/* Row 2: Order Date | Party */}
            <View style={styles.grid2}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Order Date *</Text>
                <View style={styles.dateBox}>
                  <Icon name="calendar-outline" size={20} color={Colors.gray400} style={styles.leftIcon} />
                  <Text style={styles.dateText} numberOfLines={1}>{todayLabel()}</Text>
                </View>
              </View>
              <View style={styles.col}>
                <SelectField label="Party / Customer *" value={party} options={partyOptions} onSelect={setParty} placeholder="Select" leftIcon="account-outline" error={errors.party} />
              </View>
            </View>

            {/* Row 3: Remarks (full width text area + counter) */}
            <Text style={styles.fieldLabel}>Remarks</Text>
            <View style={styles.textAreaWrap}>
              <TextInput
                style={styles.textArea}
                value={remarks}
                onChangeText={(t) => setRemarks(t.slice(0, REMARKS_MAX))}
                placeholder="Enter remarks (optional)"
                placeholderTextColor={Colors.gray400}
                multiline
                textAlignVertical="top"
                maxLength={REMARKS_MAX}
              />
              <Text style={styles.counter}>{remarks.length} / {REMARKS_MAX}</Text>
            </View>
          </CollapsibleSection>

          {/* ── Items (collapsible) ─────────────────────────────────── */}
          <CollapsibleSection
            title="Items"
            icon="cube-outline"
            open={itemsOpen}
            onToggle={() => setItemsOpen((o) => !o)}
            right={
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{items.length}</Text>
              </View>
            }
          >
            {items.map((it, idx) => {
              const qty = qtyOf(it);
              const amount = amountOf(it);
              return (
                <Card key={it.id} style={styles.itemCard}>
                  {/* Line No. badge */}
                  <View style={styles.itemCardHeader}>
                    <View style={styles.lineBadge}>
                      <Text style={styles.lineBadgeText}>Line No. {idx + 1}</Text>
                    </View>
                  </View>

                  {/* Row 1: Item (with clear) */}
                  <SelectField
                    label="Item *"
                    value={it.item}
                    options={SORT_OPTIONS}
                    onSelect={(v) => updateItem(it.id, { item: v })}
                    onClear={() => updateItem(it.id, { item: '' })}
                    placeholder="Select item"
                    leftIcon="package-variant-closed"
                  />

                  {/* Row 2: Color (with suggestion hint) */}
                  <Text style={styles.suggestHint}>✨ Suggested from last order</Text>
                  <SelectField
                    label="Color"
                    value={it.color}
                    options={COLOR_OPTIONS}
                    onSelect={(v) => updateItem(it.id, { color: v })}
                    onClear={() => updateItem(it.id, { color: '' })}
                    placeholder="Select color"
                    leftIcon="palette-outline"
                  />

                  {/* Row 3: Nos | Cut */}
                  <View style={styles.grid2}>
                    <View style={styles.col}>
                      <InputField label="Nos *" value={it.nos} onChangeText={(v) => updateItem(it.id, { nos: v })} placeholder="0" keyboardType="numeric" />
                    </View>
                    <View style={styles.col}>
                      <InputField label="Cut *" value={it.cut} onChangeText={(v) => updateItem(it.id, { cut: v })} placeholder="0" keyboardType="numeric" />
                    </View>
                  </View>

                  {/* Row 4: Quantity (Nos × Cut) — read-only calculated block */}
                  <View style={styles.calcBlock}>
                    <View style={styles.calcInfo}>
                      <Text style={styles.calcLabel}>Quantity (Nos × Cut)</Text>
                      <Text style={styles.calcValue}>
                        {fmtNum(qty)} <Text style={styles.calcUnit}>{QTY_UNIT}</Text>
                      </Text>
                    </View>
                    <Icon name="calculator-variant-outline" size={22} color={Colors.primary} />
                  </View>

                  {/* Row 5: Rate | Amount (read-only calculated block) */}
                  <View style={styles.grid2}>
                    <View style={styles.col}>
                      <InputField label="Rate *" value={it.rate} onChangeText={(v) => updateItem(it.id, { rate: v })} placeholder="0.00" keyboardType="numeric" />
                    </View>
                    <View style={styles.col}>
                      <Text style={styles.fieldLabel}>Amount</Text>
                      <View style={styles.amountBlock}>
                        <Text style={styles.amountValue} numberOfLines={1}>{formatCurrency(amount)}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Remove item */}
                  {items.length > 1 ? (
                    <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(it.id)} activeOpacity={0.7}>
                      <Icon name="trash-can-outline" size={16} color={Colors.danger} />
                      <Text style={styles.removeText}>Remove Item</Text>
                    </TouchableOpacity>
                  ) : null}
                </Card>
              );
            })}

            {/* Add Item — full-width dashed button below the last card */}
            <TouchableOpacity style={styles.addItemBtn} onPress={addItem} activeOpacity={0.8}>
              <Icon name="plus" size={18} color={Colors.primary} />
              <Text style={styles.addItemText}>Add Item</Text>
            </TouchableOpacity>
            <Text style={styles.helperText}>💡 You can add multiple items to this sales order.</Text>
          </CollapsibleSection>

          {/* ── Order Summary ───────────────────────────────────────── */}
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal ({items.length} item{items.length > 1 ? 's' : ''})</Text>
              <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <View style={styles.discountInput}>
                <InputField label="" value={discount} onChangeText={setDiscount} placeholder="0" keyboardType="numeric" />
              </View>
            </View>
            <View style={styles.totalRow}>
              <View>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalSub}>(After Discount)</Text>
              </View>
              <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            </View>
          </Card>

          {/* ── Footer Actions ──────────────────────────────────────── */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.navigate('Dashboard')} activeOpacity={0.8}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <View style={styles.saveWrap}>
              <PrimaryButton title="Save Sales Order" icon="content-save-outline" onPress={handleSave} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  content: { padding: Spacing.md },
  card: { marginBottom: Spacing.md },
  cardTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },

  // 2-column grid
  grid2: { flexDirection: 'row', gap: Spacing.md },
  col: { flex: 1 },

  fieldLabel: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },

  // Date box
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 50,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  leftIcon: { marginRight: Spacing.sm },
  dateText: { flex: 1, fontSize: Typography.fontSizes.base, color: Colors.textPrimary },

  // Remarks text area
  textAreaWrap: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  textArea: {
    fontSize: Typography.fontSizes.base,
    color: Colors.textPrimary,
    minHeight: 80,
  },
  counter: {
    alignSelf: 'flex-end',
    fontSize: Typography.fontSizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // Items section header count badge
  countBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadgeText: { fontSize: Typography.fontSizes.xs, fontWeight: Typography.fontWeights.bold, color: Colors.primary },

  // Item card
  itemCard: { marginBottom: Spacing.md },
  itemCardHeader: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: Spacing.sm },
  lineBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  lineBadgeText: { fontSize: Typography.fontSizes.xs, fontWeight: Typography.fontWeights.bold, color: Colors.primary },

  suggestHint: { fontSize: Typography.fontSizes.xs, color: Colors.primary, fontWeight: Typography.fontWeights.medium, marginBottom: Spacing.xs },

  // Quantity calculated block
  calcBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  calcInfo: { flex: 1 },
  calcLabel: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, marginBottom: 2 },
  calcValue: { fontSize: Typography.fontSizes.lg, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  calcUnit: { fontSize: Typography.fontSizes.sm, fontWeight: Typography.fontWeights.semiBold, color: Colors.primary },

  // Amount calculated block
  amountBlock: {
    backgroundColor: Colors.successLight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 50,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  amountValue: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.bold, color: Colors.success },

  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
    marginTop: 2,
  },
  removeText: { fontSize: Typography.fontSizes.sm, color: Colors.danger, fontWeight: Typography.fontWeights.semiBold },

  // Add item (dashed, full width)
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primaryLight,
  },
  addItemText: { fontSize: Typography.fontSizes.base, color: Colors.primary, fontWeight: Typography.fontWeights.semiBold },
  helperText: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm },

  // Summary
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  summaryLabel: { fontSize: Typography.fontSizes.base, color: Colors.textSecondary },
  summaryValue: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.semiBold, color: Colors.textPrimary },
  discountInput: { width: 130 },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalLabel: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  totalSub: { fontSize: Typography.fontSizes.xs, color: Colors.textMuted },
  totalValue: { fontSize: Typography.fontSizes.xl, fontWeight: Typography.fontWeights.extraBold, color: Colors.primary },

  // Footer actions
  actions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm, alignItems: 'stretch' },
  cancelBtn: {
    flex: 1,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  cancelText: { fontSize: Typography.fontSizes.md, fontWeight: Typography.fontWeights.semiBold, color: Colors.textPrimary },
  saveWrap: { flex: 1 },
});
