import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { ReportsScreen } from '../screens/company/ReportsScreen';
import { MoreScreen } from '../screens/company/MoreScreen';
import { SalesOrderStack } from './stacks/SalesOrderStack';
import { StockStack } from './stacks/StockStack';
import { useBaseTabScreenOptions, tabIcon } from './tabConfig';
import type { CompanyTabParamList } from '../types';

const Tab = createBottomTabNavigator<CompanyTabParamList>();

export const CompanyTabs: React.FC = () => {
  const screenOptions = useBaseTabScreenOptions();
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
    <Tab.Screen
      name="SalesOrders"
      component={SalesOrderStack}
      options={{ tabBarLabel: 'Sales Orders', tabBarIcon: tabIcon('file-document-outline') }}
    />
    <Tab.Screen
      name="More"
      component={MoreScreen}
      options={{ tabBarLabel: 'More', tabBarIcon: tabIcon('dots-horizontal') }}
    />
  </Tab.Navigator>
  );
};
