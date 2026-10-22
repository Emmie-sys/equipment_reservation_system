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
import { ProfileScreen } from '../screens/ProfileScreen';
import { NotificationListScreen } from '../screens/NotificationListScreen';
import { FaultyEquipmentScreen } from '../screens/FaultyEquipmentScreen';
import { UserManagementScreen } from '../screens/UserManagementScreen';

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
  const { user } = useMobileAuth();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const primaryRole = (user?.roles?.[0] || 'STUDENT').toUpperCase();
  const isStaffOrAdmin = ['ADMIN', 'ATTENDANT', 'TECHNICIAN'].includes(primaryRole);
  const isAdmin = primaryRole === 'ADMIN';
  const isAttendant = ['ATTENDANT', 'TECHNICIAN'].includes(primaryRole);

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
        tabBarActiveTintColor: isDark ? '#2DD4BF' : '#008080',
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'monospace',
          fontWeight: '700',
          letterSpacing: 0.2,
        },
      }}
    >
      {/* ── Tab 1: Dashboard / Overview ── */}
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: isAttendant ? 'Dispatch' : isAdmin ? 'Governance' : 'Overview',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={
                isAdmin
                  ? focused ? 'shield-checkmark' : 'shield-checkmark-outline'
                  : isAttendant
                  ? focused ? 'clipboard' : 'clipboard-outline'
                  : focused ? 'home' : 'home-outline'
              }
              size={21}
              color={color}
            />
          ),
        }}
      />

      {/* ── Tab 2: Equipment Catalog ── */}
      <Tab.Screen
        name="CatalogTab"
        component={CatalogStack}
        options={{
          title: isStaffOrAdmin ? 'Fleet' : 'Catalog',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'grid' : 'grid-outline'}
              size={21}
              color={color}
            />
          ),
        }}
      />

      {/* ── Tab 3: Reservations ── */}
      <Tab.Screen
        name="MyReservations"
        component={MyReservationsScreen}
        options={{
          title: isStaffOrAdmin ? 'Bookings' : 'My Loans',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'calendar' : 'calendar-outline'}
              size={21}
              color={color}
            />
          ),
        }}
      />

      {/* ── Tab 4 (Privileged): Faulty Equipment ── */}
      {isStaffOrAdmin && (
        <Tab.Screen
          name="FaultyTab"
          component={FaultyEquipmentScreen}
          options={{
            title: 'Faulty',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'warning' : 'warning-outline'}
                size={21}
                color={color}
              />
            ),
          }}
        />
      )}

      {/* ── Tab 5 (Privileged): User Governance / SSO Provisioning ── */}
      {isStaffOrAdmin && (
        <Tab.Screen
          name="UsersTab"
          component={UserManagementScreen}
          options={{
            title: isAdmin ? 'Users' : 'Add User',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={
                  isAdmin
                    ? focused ? 'people' : 'people-outline'
                    : focused ? 'person-add' : 'person-add-outline'
                }
                size={21}
                color={color}
              />
            ),
          }}
        />
      )}

      {/* ── Tab 4 (Student/Lecturer): Notifications & Messages ── */}
      {!isStaffOrAdmin && (
        <Tab.Screen
          name="MessagesTab"
          component={NotificationListScreen}
          options={{
            title: 'Messages',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'notifications' : 'notifications-outline'}
                size={21}
                color={color}
              />
            ),
          }}
        />
      )}

      {/* ── Profile / Account ── */}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={21}
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
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="Notifications"
              component={NotificationListScreen}
              options={{
                animation: 'slide_from_right',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen
              name="FaultyFleet"
              component={FaultyEquipmentScreen}
              options={{
                animation: 'slide_from_right',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen
              name="UserManagement"
              component={UserManagementScreen}
              options={{
                animation: 'slide_from_right',
                gestureEnabled: true,
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
