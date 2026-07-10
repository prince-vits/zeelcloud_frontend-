import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

interface Props {
  onlyDue: boolean;
  commonCompany: boolean;
  onOnlyDueChange: (value: boolean) => void;
  onCommonCompanyChange: (value: boolean) => void;
}

// Two toggles shared by every Sales / Purchase Outstanding summary page (ported
// from the OG .NET MAUI header card). Grouped into one compact pill in the
// top-right corner ("Common Company" holds the "Only Due" toggle beside it) so
// they no longer sprawl across the page.
export const OutstandingToggleBar: React.FC<Props> = ({
  onlyDue,
  commonCompany,
  onOnlyDueChange,
  onCommonCompanyChange,
}) => (
  <View style={styles.bar}>
    <View style={styles.cluster}>
      <View style={styles.segment}>
        <Text style={styles.label}>Only Due</Text>
        <Switch
          value={onlyDue}
          onValueChange={onOnlyDueChange}
          trackColor={{ false: Colors.gray300, true: Colors.primary }}
          thumbColor={Colors.surface}
          ios_backgroundColor={Colors.gray300}
          style={styles.switch}
        />
      </View>
      <View style={styles.divider} />
      <View style={styles.segment}>
        <Text style={styles.label}>Common Company</Text>
        <Switch
          value={commonCompany}
          onValueChange={onCommonCompanyChange}
          trackColor={{ false: Colors.gray300, true: Colors.primary }}
          thumbColor={Colors.surface}
          ios_backgroundColor={Colors.gray300}
          style={styles.switch}
        />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  bar: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'flex-end', // tuck the control cluster into the top-right corner
  },
  cluster: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  divider: {
    width: 1,
    height: 18,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.sm,
  },
  label: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textSecondary,
  },
  switch: {
    transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }],
  },
});
