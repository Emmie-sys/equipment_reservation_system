import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMobileAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { EquipmentCatalogScreen } from '../screens/EquipmentCatalogScreen';
import { MyReservationsScreen } from '../screens/MyReservationsScreen';
import { NewReservationScreen } from '../screens/NewReservationScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CatalogStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0f172a' },
        headerTintColor: '#ffffff',
      }}
    >
      <Stack.Screen 
        name="CatalogList" 
        component={EquipmentCatalogScreen} 
        options={{ title: 'Equipment Catalog' }} 
      />
      <Stack.Screen 
        name="NewReservation" 
        component={NewReservationScreen} 
        options={{ title: 'Reserve Equipment' }} 
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0f172a' },
        headerTintColor: '#ffffff',
        tabBarStyle: { backgroundColor: '#0f172a', borderTopColor: '#334155' },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#64748b',
      }}
    >
      <Tab.Screen 
        name="CatalogTab" 
        component={CatalogStack} 
        options={{ title: 'Catalog', headerShown: false }} 
      />
      <Tab.Screen 
        name="MyReservations" 
        component={MyReservationsScreen} 
        options={{ title: 'My Bookings' }} 
      />
    </Tab.Navigator>
  );
}

export const AppNavigator = () => {
  const { isAuthenticated } = useMobileAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
