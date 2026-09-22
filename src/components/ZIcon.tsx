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

/** Map non-MCI / deprecated names to valid MaterialCommunityIcons glyphs. */
const ICON_ALIASES: Record<string, MCIName> = {
  thread: 'needle',
  yarn: 'needle',
};

export const ZIcon: React.FC<ZIconProps> = ({ name, size = 20, color, style, onPress }) => {
  const resolved = (ICON_ALIASES[name] ?? name) as MCIName;
  return (
    <MaterialCommunityIcons name={resolved} size={size} color={color} style={style} onPress={onPress} />
  );
};
