import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

const logoSource = require('../../assets/zeel-cloud-logo.webp');

interface ZeelCloudLogoProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

export const ZeelCloudLogo: React.FC<ZeelCloudLogoProps> = ({ size = 100, style }) => (
  <Image
    source={logoSource}
    style={[{ width: size, height: size, resizeMode: 'contain' }, style]}
    accessibilityLabel="Zeel Cloud logo"
  />
);
