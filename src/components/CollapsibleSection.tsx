import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ZIcon as Icon } from './ZIcon';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

interface Props {
  title: string;
  icon: string;               // leading icon shown left of the title
  open: boolean;
  onToggle: () => void;
  right?: React.ReactNode;    // optional element shown before the chevron (e.g. a badge)
  children: React.ReactNode;
}

// Accordion-style section: tappable header (icon + title + chevron) that shows
// or hides its body. Reusable across forms.
export const CollapsibleSection: React.FC<Props> = ({ title, icon, open, onToggle, right, children }) => (
  <View style={styles.wrap}>
    <TouchableOpacity style={styles.header} onPress={onToggle} activeOpacity={0.7}>
      <View style={styles.left}>
        <View style={styles.iconChip}>
          <Icon name={icon} size={18} color={Colors.primary} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.right}>
        {right}
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={22} color={Colors.gray400} />
      </View>
    </TouchableOpacity>
    {open ? <View style={styles.body}>{children}</View> : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadows.card,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  iconChip: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  right: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  body: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
});
