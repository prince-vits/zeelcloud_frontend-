import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  View,
  TextStyle,
} from 'react-native';
import { ZIcon as Icon } from './ZIcon';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'solid' | 'outline' | 'ghost' | 'danger' | 'secondary';
  icon?: string;
  style?: ViewStyle;
}

const ButtonContent: React.FC<{
  loading: boolean;
  icon?: string;
  title: string;
  iconColor: string;
  textStyle: TextStyle;
  indicatorColor: string;
}> = ({ loading, icon, title, iconColor, textStyle, indicatorColor }) => {
  if (loading) return <ActivityIndicator color={indicatorColor} size="small" />;
  return (
    <View style={styles.content}>
      {icon ? <Icon name={icon} size={18} color={iconColor} style={styles.icon} /> : null}
      <Text style={textStyle}>{title}</Text>
    </View>
  );
};

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'solid',
  icon,
  style,
}) => {
  const isDisabled = disabled || loading;

  if (variant === 'solid') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[styles.solidButton, isDisabled && styles.disabledTouchable, style]}
      >
        <ButtonContent
          loading={loading}
          icon={icon}
          title={title}
          iconColor={Colors.textWhite}
          textStyle={styles.solidText}
          indicatorColor={Colors.textWhite}
        />
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[styles.secondaryButton, isDisabled && styles.disabledTouchable, style]}
      >
        <ButtonContent
          loading={loading}
          icon={icon}
          title={title}
          iconColor={Colors.textWhite}
          textStyle={styles.solidText}
          indicatorColor={Colors.textWhite}
        />
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[styles.outlineButton, isDisabled && styles.disabledOutline, style]}
      >
        <ButtonContent
          loading={loading}
          icon={icon}
          title={title}
          iconColor={Colors.primary}
          textStyle={styles.outlineText}
          indicatorColor={Colors.primary}
        />
      </TouchableOpacity>
    );
  }

  if (variant === 'danger') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[styles.dangerButton, isDisabled && styles.disabledOutline, style]}
      >
        <ButtonContent
          loading={loading}
          icon={icon}
          title={title}
          iconColor={Colors.danger}
          textStyle={styles.dangerText}
          indicatorColor={Colors.danger}
        />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[styles.ghostButton, style]}
    >
      <ButtonContent
        loading={loading}
        icon={icon}
        title={title}
        iconColor={Colors.primary}
        textStyle={styles.ghostText}
        indicatorColor={Colors.primary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  solidButton: {
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  secondaryButton: {
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryLight,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  disabledTouchable: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: Spacing.xs,
  },
  solidText: {
    color: Colors.textWhite,
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semiBold,
  },
  outlineButton: {
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
    paddingVertical: 13,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  disabledOutline: {
    borderColor: Colors.gray300,
    opacity: 0.6,
  },
  outlineText: {
    color: Colors.primary,
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semiBold,
  },
  dangerButton: {
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.danger,
    backgroundColor: Colors.surface,
    paddingVertical: 13,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  dangerText: {
    color: Colors.danger,
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semiBold,
  },
  ghostButton: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  ghostText: {
    color: Colors.primary,
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.medium,
  },
});
