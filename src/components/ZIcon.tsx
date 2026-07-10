import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { StyleProp, TextStyle } from 'react-native';

type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface ZIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
  onPress?: () => void;
}

// Wrapper that accepts any string icon name and casts internally.
// This avoids littering files with `as any` casts while keeping icon usage clean.
export const ZIcon: React.FC<ZIconProps> = ({ name, size = 20, color, style, onPress }) => (
  <MaterialCommunityIcons name={name as MCIName} size={size} color={color} style={style} onPress={onPress} />
);
