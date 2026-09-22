import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { ReportsScreen } from '../screens/company/ReportsScreen';
import { MoreScreen } from '../screens/company/MoreScreen';
import { SalesOrderStack } from './stacks/SalesOrderStack';
import { StockStack } from './stacks/StockStack';
import { useBaseTabScreenOptions, tabIcon } from './tabConfig';
import { useAuthStore } from '../store/authStore';
import type { CompanyTabParamList } from '../types';

const Tab = createBottomTabNavigator<CompanyTabParamList>();

export const CompanyTabs: React.FC = () => {
  const screenOptions = useBaseTabScreenOptions();
  const canAccessSalesOrders = useAuthStore(
    (s) => s.user?.isSalesOrderCreationAllowed === true,
  );

  return (
  <Tab.Navigator screenOptions={screenOptions}>
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{ tabBarLabel: 'Dashboard', tabBarIcon: tabIcon('view-dashboard-outline') }}
    />
    <Tab.Screen
      name="Reports"
      component={ReportsScreen}
      options={{ tabBarLabel: 'Reports', tabBarIcon: tabIcon('chart-box-outline') }}
    />
    <Tab.Screen
      name="Stocks"
      component={StockStack}
      options={{ tabBarLabel: 'Stocks', tabBarIcon: tabIcon('package-variant') }}
    />
    {canAccessSalesOrders ? (
      <Tab.Screen
        name="SalesOrders"
        component={SalesOrderStack}
        options={{ tabBarLabel: 'Sales Orders', tabBarIcon: tabIcon('file-document-outline') }}
      />
    ) : null}
    <Tab.Screen
      name="More"
      component={MoreScreen}
      options={{ tabBarLabel: 'More', tabBarIcon: tabIcon('dots-horizontal') }}
    />
  </Tab.Navigator>
  );
};
