import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SubUserLoginScreen } from '../screens/auth/SubUserLoginScreen';
import { AccountSwitcherScreen } from '../screens/auth/AccountSwitcherScreen';
import { AppLockScreen } from '../screens/auth/AppLockScreen';
import { AppNavigator } from './AppNavigator';
import type { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isLoggedIn, isAppLocked, restoreSessions, savedAccounts } = useAuthStore();
  const [sessionRestored, setSessionRestored] = useState(false);

  useEffect(() => {
    restoreSessions().finally(() => setSessionRestored(true));
  }, [restoreSessions]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {!sessionRestored ? (
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : !isLoggedIn ? (
        savedAccounts.length > 0 ? (
          <>
            <Stack.Screen name="AccountSwitcher" component={AccountSwitcherScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SubUserLogin" component={SubUserLoginScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SubUserLogin" component={SubUserLoginScreen} />
          </>
        )
      ) : isAppLocked ? (
        <>
          <Stack.Screen name="AppLock" component={AppLockScreen} />
          <Stack.Screen name="AccountSwitcher" component={AccountSwitcherScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SubUserLogin" component={SubUserLoginScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="App" component={AppNavigator} />
          <Stack.Screen name="AccountSwitcher" component={AccountSwitcherScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SubUserLogin" component={SubUserLoginScreen} />
          <Stack.Screen name="AppLock" component={AppLockScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
