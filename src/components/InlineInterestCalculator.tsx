import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { ZIcon as Icon } from './ZIcon';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

import { useState, useEffect, useMemo } from 'react';

export const useInlineInterest = () => {
  const [interestType, setInterestType] = useState<'yearly' | 'monthly'>('yearly');
  const [interestRate, setInterestRate] = useState('18');
  const [interestDays, setInterestDays] = useState('365');
  const [extraDays, setExtraDays] = useState('');

  useEffect(() => {
    if (interestType === 'yearly') {
      setInterestRate('18');
      setInterestDays('365');
    } else {
      setInterestRate('1.5');
      setInterestDays('30');
    }
  }, [interestType]);

  const calculateBillInterest = (billNet: number, billTotalDueDays: number) => {
    const rate = parseFloat(interestRate) || 0;
    const baseDays = parseInt(interestDays, 10) || (interestType === 'yearly' ? 365 : 30);
    const extra = parseInt(extraDays, 10) || 0;
    const interest = (billNet * rate / 100 / baseDays) * (billTotalDueDays + extra);
    return Math.round((interest + Number.EPSILON) * 100) / 100;
  };

  return {
    interestType, setInterestType,
    interestRate, setInterestRate,
    interestDays, setInterestDays,
    extraDays, setExtraDays,
    calculateBillInterest,
  };
};

export interface InlineInterestCalculatorProps {
  interestType: 'yearly' | 'monthly';
  setInterestType: (type: 'yearly' | 'monthly') => void;
  interestRate: string;
  setInterestRate: (rate: string) => void;
  interestDays: string;
  setInterestDays: (days: string) => void;
  extraDays: string;
  setExtraDays: (days: string) => void;
  totalInterest: number;
  selectedBillAmount: number;
}

const formatMoney = (n: number): string =>
  `₹ ${n.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;

export const InlineInterestCalculator: React.FC<InlineInterestCalculatorProps> = ({
  interestType,
  setInterestType,
  interestRate,
  setInterestRate,
  interestDays,
  setInterestDays,
  extraDays,
  setExtraDays,
  totalInterest,
  selectedBillAmount,
}) => {
  const roundedInterest = Math.round(totalInterest);
  const gst = roundedInterest * 0.05;
  const tds = Math.round(roundedInterest * 0.10);
  const netInterest = roundedInterest + gst - tds;
  const totalOs = selectedBillAmount + netInterest;

  return (
    <View style={styles.container}>
      {/* Settings Row (All inline) */}
      <View style={styles.settingsRow}>
        <TouchableOpacity style={styles.compactTypeBtn} onPress={() => setInterestType(interestType === 'yearly' ? 'monthly' : 'yearly')} activeOpacity={0.7}>
          <Text style={styles.compactTypeBtnText}>{interestType === 'yearly' ? 'Yearly' : 'Monthly'}</Text>
          <Icon name="swap-horizontal" size={14} color={Colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.compactInputGroup}>
          <Text style={styles.inputLabel}>Int(%)</Text>
          <TextInput style={styles.compactInput} value={interestRate} onChangeText={setInterestRate} keyboardType="numeric" />
        </View>
        <View style={styles.compactInputGroup}>
          <Text style={styles.inputLabel}>Days</Text>
          <TextInput style={styles.compactInput} value={interestDays} onChangeText={setInterestDays} keyboardType="numeric" />
        </View>
        <View style={styles.compactInputGroup}>
          <Text style={styles.inputLabel}>+Days</Text>
          <TextInput style={styles.compactInput} value={extraDays} onChangeText={setExtraDays} keyboardType="numeric" placeholder="0" />
        </View>
      </View>

      {/* Selected Bills Total O/s Card (Single Column List) */}
      <View style={styles.card}>
        <Text style={styles.cardTitleCentered}>Selected Bills Total O/s</Text>
        
        <View style={styles.rowCompact}>
          <Text style={styles.labelCompact}>Bills Interest Amount:</Text>
          <Text style={styles.valueCompact}>{formatMoney(roundedInterest)}</Text>
        </View>
        <View style={styles.rowCompact}>
          <Text style={styles.labelCompact}>GST(5%):</Text>
          <Text style={styles.valueCompact}>+ {formatMoney(gst)}</Text>
        </View>
        <View style={styles.rowCompact}>
          <Text style={styles.labelCompact}>TDS(10%):</Text>
          <Text style={styles.valueCompact}>- {formatMoney(tds)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.rowCompact}>
          <Text style={styles.labelCompact}>Net Interest Amount After TDS:</Text>
          <Text style={styles.valueCompact}>{formatMoney(netInterest)}</Text>
        </View>
        <View style={styles.rowCompact}>
          <Text style={styles.labelCompact}>Selected Bill Amount:</Text>
          <Text style={styles.valueCompact}>{formatMoney(selectedBillAmount)}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.rowCompact}>
          <Text style={styles.labelBold}>Total Selected Bill O/s:</Text>
          <Text style={styles.valueBold}>{formatMoney(totalOs)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.sm,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  compactTypeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    height: 32,
    backgroundColor: Colors.surface,
  },
  compactTypeBtnText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.semiBold,
  },
  compactInputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.semiBold,
    marginBottom: 2,
    textAlign: 'center',
  },
  compactInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 4,
    height: 32,
    fontSize: Typography.fontSizes.xs,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
    textAlign: 'center',
  },
  card: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
  },
  cardTitleCentered: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary, // Brand indigo
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  rowCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  labelCompact: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.medium,
  },
  valueCompact: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.semiBold,
  },
  labelBold: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.bold,
  },
  valueBold: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.bold,
  },
});
