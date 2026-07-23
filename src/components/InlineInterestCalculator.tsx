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
  const gst = totalInterest * 0.05;
  const tds = totalInterest * 0.10;
  const netInterest = totalInterest + gst - tds;
  const totalOs = selectedBillAmount + netInterest;

  return (
    <View style={styles.container}>
      {/* Radio Buttons */}
      <View style={styles.radioRow}>
        <TouchableOpacity style={styles.radio} onPress={() => setInterestType('yearly')} activeOpacity={0.7}>
          <Icon name={interestType === 'yearly' ? 'radiobox-marked' : 'radiobox-blank'} size={20} color={interestType === 'yearly' ? Colors.primary : Colors.gray400} />
          <Text style={styles.radioLabel}>Yearly</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.radio} onPress={() => setInterestType('monthly')} activeOpacity={0.7}>
          <Icon name={interestType === 'monthly' ? 'radiobox-marked' : 'radiobox-blank'} size={20} color={interestType === 'monthly' ? Colors.primary : Colors.gray400} />
          <Text style={styles.radioLabel}>Monthly</Text>
        </TouchableOpacity>
      </View>

      {/* Inputs */}
      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Interest(%)</Text>
          <TextInput
            style={styles.input}
            value={interestRate}
            onChangeText={setInterestRate}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Days</Text>
          <TextInput
            style={styles.input}
            value={interestDays}
            onChangeText={setInterestDays}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Extra Days</Text>
          <TextInput
            style={styles.input}
            value={extraDays}
            onChangeText={setExtraDays}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
      </View>

      {/* Selected Bills Total O/s Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Selected Bills Total O/s</Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>Bills Interest Amount:</Text>
          <Text style={styles.value}>{formatMoney(totalInterest)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>GST(5%):</Text>
          <Text style={styles.value}>+ {formatMoney(gst)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>TDS(10%):</Text>
          <Text style={styles.value}>- {formatMoney(tds)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Net Interest Amount After TDS:</Text>
          <Text style={styles.value}>{formatMoney(netInterest)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Selected Bill Amount:</Text>
          <Text style={styles.value}>{formatMoney(selectedBillAmount)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.labelBold}>Total Selected Bill O/s:</Text>
          <Text style={styles.valueBold}>{formatMoney(totalOs)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.md,
  },
  radioRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    gap: Spacing.xl,
  },
  radio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  radioLabel: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.medium,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.semiBold,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    fontSize: Typography.fontSizes.sm,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  card: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
  },
  cardHeader: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textPrimary,
  },
  value: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.medium,
  },
  labelBold: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.bold,
  },
  valueBold: {
    fontSize: Typography.fontSizes.base,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.bold,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.textPrimary,
    marginVertical: Spacing.sm,
  },
});
