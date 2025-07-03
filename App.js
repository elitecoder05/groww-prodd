import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import StocksStackNavigator from './navigation/StocksStackNavigator';
import WishlistScreen from './screens/WishlistScreen';
import ErrorBoundary from './components/ErrorBoundary';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <ErrorBoundary>
      <NavigationContainer>
        <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Stocks') {
              iconName = focused ? 'trending-up' : 'trending-up-outline';
            } else if (route.name === 'Wishlist') {
              iconName = focused ? 'heart' : 'heart-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#00D09C',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          headerStyle: {
            backgroundColor: '#00D09C',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
        })}
      >
        <Tab.Screen 
          name="Stocks" 
          component={StocksStackNavigator}
          options={{
            title: 'Stocks',
            headerShown: false, // Let the stack navigator handle headers
          }}
        />
        <Tab.Screen 
          name="Wishlist" 
          component={WishlistScreen}
          options={{
            title: 'Wishlist',
          }}
        />
      </Tab.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
    </ErrorBoundary>
  );
}
