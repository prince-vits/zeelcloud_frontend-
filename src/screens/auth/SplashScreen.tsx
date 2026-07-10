import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>ZI</Text>
        </View>
        <Text style={styles.appName}>ZeelCloud</Text>
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>
      <Text style={styles.poweredBy}>Powered by Zeel Infosys</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  logoText: {
    fontSize: 36,
    fontWeight: Typography.fontWeights.extraBold,
    color: Colors.textWhite,
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
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: Colors.textWhite,
    width: 24,
    borderRadius: 4,
  },
  poweredBy: {
    fontSize: Typography.fontSizes.sm,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: Spacing.xl,
  },
});
