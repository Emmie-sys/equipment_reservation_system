import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMobileAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { ReportIncidentScreen } from '../screens/ReportIncidentScreen';
import { MyIncidentsScreen } from '../screens/MyIncidentsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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
      <Tab.Screen name="MyIncidents" component={MyIncidentsScreen} options={{ title: 'Incidents' }} />
      <Tab.Screen name="Report" component={ReportIncidentScreen} options={{ title: 'Report Case' }} />
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
