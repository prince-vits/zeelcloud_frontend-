import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ZeelCloudLogo } from '../../components/ZeelCloudLogo';
import { useAuthStore } from '../../store/authStore';
import { Colors, Typography, Spacing } from '../../theme';
import type { RootStackParamList } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoggedIn) {
        navigation.replace('App');
      } else {
        navigation.replace('Login');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [isLoggedIn, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoBadge}>
          <ZeelCloudLogo size={100} style={styles.logo} />
        </View>
        <Text style={styles.appName}>ZeelCloud</Text>
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotMid]} />
          <View style={styles.dot} />
        </View>
      </View>
      <Text style={styles.poweredBy}>Powered by Zeel Infosys</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  logoContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoBadge: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logo: {
    marginBottom: 0,
  },
  appName: {
    fontSize: Typography.fontSizes.xxxl,
    fontWeight: Typography.fontWeights.extraBold,
    color: Colors.textWhite,
    letterSpacing: 1,
    marginBottom: Spacing.xl,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotMid: {
    backgroundColor: Colors.primaryLight,
  },
  dotActive: {
    backgroundColor: Colors.textWhite,
    width: 24,
    borderRadius: 4,
  },
  poweredBy: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.primaryLight,
    marginBottom: Spacing.xl,
  },
});
