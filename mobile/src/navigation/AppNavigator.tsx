import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMobileAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { EquipmentCatalogScreen } from '../screens/EquipmentCatalogScreen';
import { MyReservationsScreen } from '../screens/MyReservationsScreen';
import { NewReservationScreen } from '../screens/NewReservationScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CatalogStack() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.canvasBg },
      }}
    >
      <Stack.Screen
        name="CatalogList"
        component={EquipmentCatalogScreen}
      />
      <Stack.Screen
        name="NewReservation"
        component={NewReservationScreen}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.canvasBg,
          borderTopColor: theme.colors.borderSubtle,
          borderTopWidth: 1,
          height: 60 + Math.max(insets.bottom, 6),
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 6,
        },
        tabBarActiveTintColor: isDark ? '#34D399' : '#155E38',
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Chirp-Bold',
          fontWeight: '700',
          letterSpacing: 0.3,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="CatalogTab"
        component={CatalogStack}
        options={{
          title: 'Catalog',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'grid' : 'grid-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="MyReservations"
        component={MyReservationsScreen}
        options={{
          title: 'My Bookings',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'calendar' : 'calendar-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export const AppNavigator = () => {
  const { isAuthenticated } = useMobileAuth();
  const { theme, isDark } = useTheme();

  const navTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: theme.colors.canvasBg,
          card: theme.colors.canvasBg,
          text: theme.colors.textPrimary,
          border: theme.colors.borderSubtle,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: theme.colors.canvasBg,
          card: theme.colors.canvasBg,
          text: theme.colors.textPrimary,
          border: theme.colors.borderSubtle,
        },
      };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.canvasBg },
        }}
      >
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
