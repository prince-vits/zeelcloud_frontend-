import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StockScreen } from '../../screens/stock/StockScreen';
import { StockFilterScreen } from '../../screens/stock/StockFilterScreen';
import { YarnStockScreen } from '../../screens/stock/YarnStockScreen';
import { GrayStockScreen } from '../../screens/stock/GrayStockScreen';
import { BeamStockScreen } from '../../screens/stock/BeamStockScreen';
import { StockItemDetailScreen } from '../../screens/stock/StockItemDetailScreen';
import type { StockStackParamList } from '../../types';

const Stack = createNativeStackNavigator<StockStackParamList>();

export const StockStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Stock" component={StockScreen} />
    <Stack.Screen name="StockFilter" component={StockFilterScreen} />
    <Stack.Screen name="YarnStock" component={YarnStockScreen} />
    <Stack.Screen name="GrayStock" component={GrayStockScreen} />
    <Stack.Screen name="BeamStock" component={BeamStockScreen} />
    <Stack.Screen name="StockItemDetail" component={StockItemDetailScreen} />
  </Stack.Navigator>
);
