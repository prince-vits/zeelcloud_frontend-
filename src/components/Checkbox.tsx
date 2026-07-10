import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { ZIcon as Icon } from './ZIcon';
import { Colors, Typography, Spacing } from '../theme';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onToggle, disabled }) => (
  <TouchableOpacity
    style={styles.row}
    onPress={onToggle}
    activeOpacity={0.7}
    disabled={disabled}
  >
    <View style={[styles.box, checked && styles.boxChecked]}>
      {checked ? <Icon name="check" size={14} color={Colors.textWhite} /> : null}
    </View>
    <Text style={[styles.label, disabled && styles.labelDisabled]} numberOfLines={2}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    flex: 1,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.gray300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  label: {
    flex: 1,
    fontSize: Typography.fontSizes.sm,
    color: Colors.textPrimary,
  },
  labelDisabled: {
    color: Colors.textMuted,
  },
});
