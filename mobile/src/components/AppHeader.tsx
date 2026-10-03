import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform, StatusBar as RNStatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useMobileAuth } from '../context/AuthContext';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBack = false,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout } = useMobileAuth();

  const initials = user?.first_name
    ? user.first_name.charAt(0)
    : user?.name
    ? user.name.charAt(0)
    : 'U';

  const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : insets.top;
  const topPadding = Math.max(insets.top, statusBarHeight) + 8;

  return (
    <View
      style={[
        styles.headerContainer,
        {
          paddingTop: topPadding,
          backgroundColor: theme.colors.canvasBg,
          borderBottomColor: theme.colors.borderSubtle,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          {showBack ? (
            <Pressable
              onPress={onBack}
              style={[
                styles.backButton,
                {
                  backgroundColor: theme.colors.surfaceSecondary,
                  borderColor: theme.colors.borderMedium,
                },
              ]}
              accessibilityLabel="Back"
            >
              <Ionicons name="arrow-back" size={20} color={theme.colors.textPrimary} />
            </Pressable>
          ) : (
            <View
              style={[
                styles.brandGlyph,
                {
                  backgroundColor: theme.colors.brandForestDark,
                  borderColor: theme.colors.borderStrong,
                },
              ]}
            >
              <Text style={styles.glyphText}>R</Text>
            </View>
          )}

          <View style={styles.brandTitles}>
            <View style={styles.logoRow}>
              <Text style={[styles.brandTitle, { color: theme.colors.textPrimary }]}>
                RESERV
              </Text>
              <Text style={styles.brandTitleAccent}>iT</Text>
            </View>
            <Text style={[styles.brandSub, { color: theme.colors.textMuted }]}>
              Institutional Hub
            </Text>
          </View>
        </View>

        <View style={styles.rightControls}>
          {/* Theme Toggle Button */}
          <Pressable
            onPress={toggleTheme}
            style={[
              styles.themeToggle,
              {
                backgroundColor: isDark
                  ? 'rgba(230, 212, 230, 0.12)'
                  : 'rgba(9, 56, 31, 0.08)',
                borderColor: isDark
                  ? 'rgba(230, 212, 230, 0.22)'
                  : 'rgba(9, 56, 31, 0.18)',
              },
            ]}
            accessibilityLabel={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            accessibilityRole="button"
          >
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={15}
              color={isDark ? '#FBBF24' : '#5A2D5C'}
            />
            <Text
              style={[
                styles.themeToggleText,
                { color: theme.colors.textPrimary },
              ]}
            >
              {isDark ? 'Light' : 'Dark'}
            </Text>
          </Pressable>

          {user && (
            <View style={styles.userControls}>
              <View
                style={[
                  styles.avatarPill,
                  {
                    backgroundColor: theme.colors.brandForestDark,
                    borderColor: theme.colors.borderMedium,
                  },
                ]}
              >
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <Pressable
                onPress={logout}
                style={[
                  styles.logoutButton,
                  {
                    backgroundColor: theme.colors.surfaceSecondary,
                    borderColor: theme.colors.borderSubtle,
                  },
                ]}
                accessibilityLabel="Logout"
              >
                <Ionicons
                  name="log-out-outline"
                  size={19}
                  color={theme.colors.textSecondary}
                />
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {title ? (
        <View style={styles.pageTitleContainer}>
          <Text style={[styles.pageTitle, { color: theme.colors.textPrimary }]}>
            {title}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandGlyph: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphText: {
    color: '#FAF8FB',
    fontSize: 18,
    fontFamily: 'Chirp-Heavy',
    fontWeight: '800',
  },
  brandTitles: {
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 17,
    fontFamily: 'Chirp-Heavy',
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandTitleAccent: {
    fontSize: 17,
    fontFamily: 'Chirp-Heavy',
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: 9.5,
    fontFamily: 'Chirp-SemiBold',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
  },
  themeToggleText: {
    fontSize: 11,
    fontFamily: 'Chirp-Bold',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  userControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarPill: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FAF8FB',
    fontSize: 12,
    fontFamily: 'Chirp-Bold',
    fontWeight: '700',
  },
  logoutButton: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitleContainer: {
    marginTop: 12,
  },
  pageTitle: {
    fontSize: 20,
    fontFamily: 'Chirp-Heavy',
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
