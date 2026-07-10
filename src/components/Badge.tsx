import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

type BadgeVariant = 'overdue' | 'warning' | 'ok' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  overdue: { bg: Colors.dangerLight, text: Colors.danger },
  warning: { bg: Colors.warningLight, text: Colors.warning },
  ok: { bg: Colors.successLight, text: Colors.success },
  info: { bg: Colors.infoLight, text: Colors.info },
  neutral: { bg: Colors.gray100, text: Colors.gray600 },
};

export const Badge: React.FC<BadgeProps> = ({ label, variant }) => {
  const vs = variantStyles[variant];
  return (
    <View style={[styles.badge, { backgroundColor: vs.bg }]}>
      <Text style={[styles.text, { color: vs.text }]}>{label}</Text>
    </View>
  );
};

export const getDaysBadgeVariant = (daysOverdue: number): BadgeVariant => {
  if (daysOverdue <= 0) return 'ok';
  if (daysOverdue <= 15) return 'warning';
  if (daysOverdue <= 45) return 'overdue';
  return 'overdue';
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semiBold,
  },
});
