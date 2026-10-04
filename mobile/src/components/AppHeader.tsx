import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  StatusBar as RNStatusBar,
  Modal,
  Alert,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useMobileAuth } from '../context/AuthContext';
import { GlassCard } from './GlassCard';
import { useNotifications } from '../context/NotificationContext';
import { Badge } from './Badge';

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
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout } = useMobileAuth();
  const { unreadCount } = useNotifications();

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Apple HIG spring reveal animation values
  const menuAnim = useRef(new Animated.Value(0)).current;

  const openMenu = () => {
    setIsMenuVisible(true);
    menuAnim.setValue(0);
    Animated.spring(menuAnim, {
      toValue: 1,
      damping: 18,
      stiffness: 240,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = (callback?: () => void) => {
    Animated.timing(menuAnim, {
      toValue: 0,
      duration: 160,
      useNativeDriver: true,
    }).start(() => {
      setIsMenuVisible(false);
      if (callback) callback();
    });
  };

  const displayName = user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Alex Morgan');
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U';

  const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : insets.top;
  const topPadding = Math.max(insets.top, statusBarHeight) + 8;

  const handleNavigateToProfile = () => {
    closeMenu(() => {
      try {
        navigation.navigate('ProfileTab');
      } catch (e) {
        console.log('Navigation error:', e);
      }
    });
  };

  const handleNavigateToCatalog = () => {
    closeMenu(() => {
      try {
        navigation.navigate('CatalogTab');
      } catch (e) {
        console.log('Navigation error:', e);
      }
    });
  };

  const handleSupportPress = () => {
    closeMenu(() => {
      Alert.alert(
        'Institutional Equipment Desk',
        'Location: Science & Tech Center (STC-101)\nHours: Mon–Fri, 8:00 AM – 6:00 PM\nPhone: ext. 4402 / +1 (555) 019-4402\nEmail: reservations-support@university.edu',
        [{ text: 'OK', style: 'default' }]
      );
    });
  };

  const handleLogoutPress = () => {
    closeMenu(() => {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to end your current session?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: async () => {
              try {
                await logout();
              } catch (e) {
                console.log('Logout error:', e);
              }
            },
          },
        ]
      );
    });
  };

  // Interpolations for smooth Apple spring reveal
  const backdropOpacity = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const menuScale = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.91, 1],
  });

  const menuTranslateY = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-16, 0],
  });

  const menuOpacity = menuAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0.7, 1],
  });

  return (
    <>
      <View
        style={[
          styles.headerContainer,
          {
            paddingTop: topPadding,
            // Apple HIG: Navigation bar = chrome vibrancy (deepest glass)
            backgroundColor: isDark
              ? 'rgba(3, 12, 6, 0.94)'
              : 'rgba(244, 242, 247, 0.96)',
            borderBottomColor: isDark
              ? 'rgba(255, 255, 255, 0.06)'
              : 'rgba(9, 56, 31, 0.08)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDark ? 0.35 : 0.08,
            shadowRadius: 8,
            elevation: 8,
          },
        ]}
      >
        <View style={styles.topRow}>
          {/* Brand Left Section */}
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
                    borderColor: 'rgba(255, 255, 255, 0.22)',
                    borderTopColor: 'rgba(255, 255, 255, 0.35)',
                    shadowColor: theme.colors.brandForestDark,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.55,
                    shadowRadius: 10,
                    elevation: 6,
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

          {/* Right Controls */}
          <View style={styles.rightControls}>
            {/* Notification Bell with Badge */}
            <Pressable
              onPress={() => {
                try { navigation.navigate('Notifications'); } catch (e) { console.log(e); }
              }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={({ pressed }) => [
                styles.bareMenuButton,
                {
                  opacity: pressed ? 0.5 : 1,
                  transform: [{ scale: pressed ? 0.92 : 1 }],
                },
              ]}
              accessibilityLabel="Notifications"
              accessibilityRole="button"
            >
              <View style={styles.bellWrapper}>
                <Ionicons
                  name={unreadCount > 0 ? 'notifications' : 'notifications-outline'}
                  size={23}
                  color={theme.colors.textPrimary}
                />
                {unreadCount > 0 && (
                  <View style={styles.bellBadge}>
                    <Text style={styles.bellBadgeText}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>

            {/* Bare Vertical Three-Dots (No Container, No Border) */}
            <Pressable
              onPress={openMenu}
              hitSlop={{ top: 12, bottom: 12, left: 14, right: 14 }}
              style={({ pressed }) => [
                styles.bareMenuButton,
                {
                  opacity: pressed ? 0.5 : 1,
                  transform: [{ scale: pressed ? 0.92 : 1 }],
                },
              ]}
              accessibilityLabel="More options"
              accessibilityRole="button"
            >
              <Ionicons
                name="ellipsis-vertical"
                size={23}
                color={theme.colors.textPrimary}
              />
            </Pressable>
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

      {/* ── Apple HIG Spring-Revealed Action Sheet / Overflow Menu Modal ──────────────── */}
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => closeMenu()}
      >
        <Animated.View
          style={[
            styles.modalOverlay,
            {
              opacity: backdropOpacity,
            },
          ]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => closeMenu()}
          />
          <Animated.View
            style={[
              styles.menuSheetWrapper,
              {
                opacity: menuOpacity,
                transform: [
                  { translateY: menuTranslateY },
                  { scale: menuScale },
                ],
              },
            ]}
          >
            <GlassCard padding={0} style={styles.menuCard}>
              {/* User Account Snapshot Header */}
              <Pressable
                style={[
                  styles.userHeaderRow,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.04)'
                      : 'rgba(9, 56, 31, 0.03)',
                    borderBottomColor: theme.colors.borderSubtle,
                  },
                ]}
                onPress={handleNavigateToProfile}
              >
                <View
                  style={[
                    styles.avatarMonogram,
                    {
                      backgroundColor: theme.colors.brandForestDark,
                      borderColor: theme.colors.borderMedium,
                    },
                  ]}
                >
                  <Text style={styles.avatarMonogramText}>{initials}</Text>
                </View>
                <View style={styles.userHeaderInfo}>
                  <Text
                    style={[styles.userHeaderName, { color: theme.colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {displayName}
                  </Text>
                  <Text
                    style={[styles.userHeaderEmail, { color: theme.colors.textMuted }]}
                    numberOfLines={1}
                  >
                    {user?.email || 'alex.morgan@university.edu'}
                  </Text>
                </View>
                <Badge
                  label={user?.role?.toUpperCase() || 'STUDENT'}
                  variant="available"
                  size="sm"
                />
              </Pressable>

              {/* Menu Actions List */}
              <View style={styles.menuList}>
                {/* 1. Settings & Account Customization */}
                <Pressable
                  style={({ pressed }) => [
                    styles.menuRow,
                    pressed && { backgroundColor: theme.colors.surfaceSecondary },
                  ]}
                  onPress={handleNavigateToProfile}
                >
                  <View style={styles.menuRowLeft}>
                    <View
                      style={[
                        styles.menuIconBox,
                        { backgroundColor: 'rgba(56, 189, 248, 0.15)' },
                      ]}
                    >
                      <Ionicons name="settings-outline" size={18} color="#38BDF8" />
                    </View>
                    <View>
                      <Text style={[styles.menuRowTitle, { color: theme.colors.textPrimary }]}>
                        Settings & Account
                      </Text>
                      <Text style={[styles.menuRowSub, { color: theme.colors.textMuted }]}>
                        Preferences, depot & notifications
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={17} color={theme.colors.textMuted} />
                </Pressable>

                <View style={[styles.menuDivider, { backgroundColor: theme.colors.borderSubtle }]} />

                {/* 2. Theme Appearance Toggle */}
                <Pressable
                  style={({ pressed }) => [
                    styles.menuRow,
                    pressed && { backgroundColor: theme.colors.surfaceSecondary },
                  ]}
                  onPress={toggleTheme}
                >
                  <View style={styles.menuRowLeft}>
                    <View
                      style={[
                        styles.menuIconBox,
                        {
                          backgroundColor: isDark
                            ? 'rgba(251, 191, 36, 0.15)'
                            : 'rgba(90, 45, 92, 0.15)',
                        },
                      ]}
                    >
                      <Ionicons
                        name={isDark ? 'sunny' : 'moon'}
                        size={18}
                        color={isDark ? '#FBBF24' : '#5A2D5C'}
                      />
                    </View>
                    <View>
                      <Text style={[styles.menuRowTitle, { color: theme.colors.textPrimary }]}>
                        Appearance
                      </Text>
                      <Text style={[styles.menuRowSub, { color: theme.colors.textMuted }]}>
                        Currently {isDark ? 'Dark Mode' : 'Light Mode'}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.modePill,
                      {
                        backgroundColor: isDark
                          ? 'rgba(230, 212, 230, 0.12)'
                          : 'rgba(9, 56, 31, 0.08)',
                        borderColor: isDark
                          ? 'rgba(230, 212, 230, 0.22)'
                          : 'rgba(9, 56, 31, 0.16)',
                      },
                    ]}
                  >
                    <Text style={[styles.modePillText, { color: theme.colors.textPrimary }]}>
                      Switch to {isDark ? 'Light' : 'Dark'}
                    </Text>
                  </View>
                </Pressable>

                <View style={[styles.menuDivider, { backgroundColor: theme.colors.borderSubtle }]} />

                {/* 3. Institutional Catalog */}
                <Pressable
                  style={({ pressed }) => [
                    styles.menuRow,
                    pressed && { backgroundColor: theme.colors.surfaceSecondary },
                  ]}
                  onPress={handleNavigateToCatalog}
                >
                  <View style={styles.menuRowLeft}>
                    <View
                      style={[
                        styles.menuIconBox,
                        { backgroundColor: 'rgba(34, 197, 94, 0.15)' },
                      ]}
                    >
                      <Ionicons name="grid-outline" size={18} color="#22C55E" />
                    </View>
                    <View>
                      <Text style={[styles.menuRowTitle, { color: theme.colors.textPrimary }]}>
                        Browse Equipment
                      </Text>
                      <Text style={[styles.menuRowSub, { color: theme.colors.textMuted }]}>
                        Explore available devices & units
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={17} color={theme.colors.textMuted} />
                </Pressable>

                <View style={[styles.menuDivider, { backgroundColor: theme.colors.borderSubtle }]} />

                {/* 4. Support Desk & Hotline */}
                <Pressable
                  style={({ pressed }) => [
                    styles.menuRow,
                    pressed && { backgroundColor: theme.colors.surfaceSecondary },
                  ]}
                  onPress={handleSupportPress}
                >
                  <View style={styles.menuRowLeft}>
                    <View
                      style={[
                        styles.menuIconBox,
                        { backgroundColor: 'rgba(167, 139, 250, 0.15)' },
                      ]}
                    >
                      <Ionicons name="help-buoy-outline" size={18} color="#A78BFA" />
                    </View>
                    <View>
                      <Text style={[styles.menuRowTitle, { color: theme.colors.textPrimary }]}>
                        Desk Support & Info
                      </Text>
                      <Text style={[styles.menuRowSub, { color: theme.colors.textMuted }]}>
                        STC-101 Desk • Ext 4402
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="information-circle-outline" size={18} color={theme.colors.textMuted} />
                </Pressable>

                <View style={[styles.menuDivider, { backgroundColor: theme.colors.borderSubtle }]} />

                {/* 5. Sign Out (Destructive) */}
                <Pressable
                  style={({ pressed }) => [
                    styles.menuRow,
                    pressed && { backgroundColor: 'rgba(239, 68, 68, 0.10)' },
                  ]}
                  onPress={handleLogoutPress}
                >
                  <View style={styles.menuRowLeft}>
                    <View
                      style={[
                        styles.menuIconBox,
                        { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
                      ]}
                    >
                      <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                    </View>
                    <View>
                      <Text style={[styles.menuRowTitle, { color: '#EF4444', fontWeight: '700' }]}>
                        Sign Out
                      </Text>
                      <Text style={[styles.menuRowSub, { color: theme.colors.textMuted }]}>
                        End institutional session
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={17} color="#EF4444" />
                </Pressable>
              </View>

              {/* Close Button Footer */}
              <Pressable
                style={[
                  styles.closeFooter,
                  {
                    borderTopColor: theme.colors.borderSubtle,
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.03)'
                      : 'rgba(9, 56, 31, 0.02)',
                  },
                ]}
                onPress={() => closeMenu()}
              >
                <Text style={[styles.closeFooterText, { color: theme.colors.textMuted }]}>
                  Dismiss
                </Text>
              </Pressable>
            </GlassCard>
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
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
    color: '#F26419',
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
    justifyContent: 'flex-end',
    gap: 2,
  },
  bareMenuButton: {
    paddingHorizontal: 6,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    // No background, no border, no rounded container
  },
  bellWrapper: {
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: -4,
    right: -5,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F26419',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  bellBadgeText: {
    color: '#FFF',
    fontSize: 8.5,
    fontWeight: '800',
    lineHeight: 11,
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

  /* Modal Menu Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.60)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 70 : 60,
    paddingRight: 16,
  },
  menuSheetWrapper: {
    width: 310,
    maxWidth: '92%',
  },
  menuCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.50,
    shadowRadius: 24,
    elevation: 18,
  },
  userHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
  },
  avatarMonogram: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarMonogramText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  userHeaderInfo: {
    flex: 1,
    marginRight: 8,
  },
  userHeaderName: {
    fontSize: 14,
    fontWeight: '700',
  },
  userHeaderEmail: {
    fontSize: 11,
    marginTop: 1,
  },
  menuList: {
    paddingVertical: 4,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  menuRowTitle: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  menuRowSub: {
    fontSize: 10.5,
    marginTop: 1,
  },
  modePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  modePillText: {
    fontSize: 10,
    fontWeight: '600',
  },
  menuDivider: {
    height: 1,
    marginLeft: 55,
  },
  closeFooter: {
    alignItems: 'center',
    paddingVertical: 11,
    borderTopWidth: 1,
  },
  closeFooterText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
