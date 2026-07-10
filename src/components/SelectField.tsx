import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import { ZIcon as Icon } from './ZIcon';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

interface SelectFieldProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  placeholder?: string;
  leftIcon?: string;
  error?: string;
  onClear?: () => void; // when set and a value is chosen, show an inline 'x' clear button
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Select...',
  leftIcon,
  error,
  onClear,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.field, error ? styles.fieldError : null]}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        {leftIcon ? <Icon name={leftIcon} size={20} color={Colors.gray400} style={styles.leftIcon} /> : null}
        <Text style={[styles.value, !value && styles.placeholder]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        {value && onClear ? (
          <TouchableOpacity
            onPress={onClear}
            style={styles.clearBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Icon name="close-circle" size={18} color={Colors.gray400} />
          </TouchableOpacity>
        ) : null}
        <Icon name="chevron-down" size={20} color={Colors.gray400} />
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionText, item === value && styles.optionSelected]}>{item}</Text>
                  {item === value ? <Icon name="check" size={18} color={Colors.primary} /> : null}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  label: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 50,
    paddingHorizontal: Spacing.md,
  },
  fieldError: { borderColor: Colors.danger },
  leftIcon: { marginRight: Spacing.sm },
  clearBtn: { marginRight: Spacing.xs },
  value: { flex: 1, fontSize: Typography.fontSizes.base, color: Colors.textPrimary },
  placeholder: { color: Colors.gray400 },
  errorText: { fontSize: Typography.fontSizes.xs, color: Colors.danger, marginTop: 4 },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    maxHeight: '60%',
  },
  sheetTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  optionText: { fontSize: Typography.fontSizes.base, color: Colors.textPrimary },
  optionSelected: { color: Colors.primary, fontWeight: Typography.fontWeights.semiBold },
});
