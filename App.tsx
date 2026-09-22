import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, AppState, type AppStateStatus } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { GlobalPdfPreview } from './src/components/GlobalPdfPreview';
import { navigationRef } from './src/navigation/navigationRef';
import { useAuthStore } from './src/store/authStore';
import { Colors } from './src/theme';

/** Re-lock after this many ms in background (0 = immediately on return). */
const APP_LOCK_BACKGROUND_MS = 0;

const AccountSwitchingOverlay = () => {
  const isSwitchingAccount = useAuthStore((state) => state.isSwitchingAccount);

  if (!isSwitchingAccount) return null;

  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
};

const useAppLockOnBackground = () => {
  const backgroundAtRef = useRef<number | null>(null);

  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      const { isLoggedIn, appLockEnabled, isAppLocked, lockApp } = useAuthStore.getState();

      if (next === 'background') {
        if (isLoggedIn && appLockEnabled && !isAppLocked) {
          backgroundAtRef.current = Date.now();
        }
        return;
      }

      if (next === 'active' && backgroundAtRef.current != null) {
        const elapsed = Date.now() - backgroundAtRef.current;
        backgroundAtRef.current = null;
        if (elapsed >= APP_LOCK_BACKGROUND_MS) {
          lockApp();
        }
      }
    };

    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, []);
};

export default function App() {
  useAppLockOnBackground();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef}>
          <RootNavigator />
        </NavigationContainer>
        <GlobalPdfPreview />
        <AccountSwitchingOverlay />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
});
