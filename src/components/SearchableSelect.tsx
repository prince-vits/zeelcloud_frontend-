import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import { ZIcon as Icon } from './ZIcon';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

interface SearchableSelectProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  placeholder?: string;
  leftIcon?: string;
  error?: string;
  onClear?: () => void;
  // Show a search box in the picker and filter options by it.
  searchable?: boolean;
  // Allow choosing a typed value that is not in the list (e.g. a new colour).
  allowCustom?: boolean;
  // Optional second line under each option (e.g. a party's address).
  subtitleFor?: (value: string) => string | undefined;
}

// A dropdown that can be searched and (optionally) accept a freely-typed value.
// Used for the party picker (search + address subtitle) and the colour picker
// (search + add-your-own).
export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Select...',
  leftIcon,
  error,
  onClear,
  searchable = true,
  allowCustom = false,
  subtitleFor,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  // Offer "Add <query>" when free entry is on and the text isn't already an option.
  const trimmed = query.trim();
  const showAddCustom =
    allowCustom &&
    trimmed.length > 0 &&
    !options.some((o) => o.toLowerCase() === trimmed.toLowerCase());

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const choose = (v: string) => {
    onSelect(v);
    close();
  };

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

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={close}>
          <TouchableOpacity style={styles.sheet} activeOpacity={1} onPress={() => {}}>
            <Text style={styles.sheetTitle}>{label}</Text>

            {searchable || allowCustom ? (
              <View style={styles.searchRow}>
                <Icon name="magnify" size={18} color={Colors.gray400} />
                <TextInput
                  style={styles.searchInput}
                  value={query}
                  onChangeText={setQuery}
                  placeholder={allowCustom ? 'Search or type to add…' : 'Search…'}
                  placeholderTextColor={Colors.gray400}
                  autoFocus
                />
                {query ? (
                  <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Icon name="close-circle" size={16} color={Colors.gray400} />
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}

            <FlatList
              data={filtered}
              keyExtractor={(item, idx) => `${item}-${idx}`}
              keyboardShouldPersistTaps="handled"
              ListHeaderComponent={
                showAddCustom ? (
                  <TouchableOpacity style={styles.addRow} onPress={() => choose(trimmed)} activeOpacity={0.7}>
                    <Icon name="plus-circle-outline" size={18} color={Colors.primary} />
                    <Text style={styles.addText}>Add “{trimmed}”</Text>
                  </TouchableOpacity>
                ) : null
              }
              ListEmptyComponent={
                !showAddCustom ? <Text style={styles.empty}>No matches</Text> : null
              }
              renderItem={({ item }) => {
                const subtitle = subtitleFor?.(item);
                return (
                  <TouchableOpacity style={styles.option} onPress={() => choose(item)} activeOpacity={0.7}>
                    <View style={styles.optionTextWrap}>
                      <Text style={[styles.optionText, item === value && styles.optionSelected]} numberOfLines={1}>
                        {item}
                      </Text>
                      {subtitle ? (
                        <Text style={styles.optionSubtitle} numberOfLines={2}>
                          {subtitle}
                        </Text>
                      ) : null}
                    </View>
                    {item === value ? <Icon name="check" size={18} color={Colors.primary} /> : null}
                  </TouchableOpacity>
                );
              }}
            />
          </TouchableOpacity>
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
    maxHeight: '70%',
  },
  sheetTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSizes.base,
    color: Colors.textPrimary,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.primaryLight,
  },
  addText: { fontSize: Typography.fontSizes.base, color: Colors.primary, fontWeight: Typography.fontWeights.semiBold },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  optionTextWrap: { flex: 1, marginRight: Spacing.sm },
  optionText: { fontSize: Typography.fontSizes.base, color: Colors.textPrimary },
  optionSelected: { color: Colors.primary, fontWeight: Typography.fontWeights.semiBold },
  optionSubtitle: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  empty: { textAlign: 'center', padding: Spacing.md, color: Colors.textSecondary, fontSize: Typography.fontSizes.sm },
});
