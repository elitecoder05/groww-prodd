import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import StocksScreen from '../screens/StocksScreen';
import StockListScreen from '../screens/StockListScreen';
import CompanyOverviewScreen from '../screens/CompanyOverviewScreen';

const Stack = createStackNavigator();

export default function StocksStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="StocksHome"
        component={StocksScreen}
        options={{
          headerShown: false, // We'll use the tab header
        }}
      />
      <Stack.Screen
        name="StockList"
        component={StockListScreen}
        options={{
          headerStyle: {
            backgroundColor: '#00D09C',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen
        name="CompanyOverview"
        component={CompanyOverviewScreen}
        options={{
          headerStyle: {
            backgroundColor: '#00D09C',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>
  );
}
