import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardTypeOptions,
} from 'react-native';
import { ZIcon as Icon } from './ZIcon';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  error?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  leftIcon,
  rightIcon,
  onRightIconPress,
  error,
  autoCapitalize = 'none',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        {leftIcon ? (
          <Icon name={leftIcon} size={20} color={Colors.gray400} style={styles.leftIcon} />
        ) : null}
        <TextInput
          style={[styles.input, leftIcon ? styles.inputWithLeft : null]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.gray400}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
        />
        {rightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
            activeOpacity={0.7}
          >
            <Icon name={rightIcon} size={20} color={Colors.gray400} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 50,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  leftIcon: {
    marginLeft: Spacing.md,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSizes.base,
    color: Colors.textPrimary,
    paddingVertical: Spacing.sm + 4,
  },
  inputWithLeft: {
    paddingLeft: Spacing.sm,
  },
  rightIcon: {
    padding: Spacing.md,
  },
  errorText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.danger,
    marginTop: 4,
  },
});
