import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMobileAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { mobileApiClient } from '../api/client';
import { setAuthToken } from '../utils/storage';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';

export const LoginScreen = () => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('alex.rivera@student.school.edu');
  const [password, setPassword] = useState('emmie');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useMobileAuth();
  const { theme, isDark, toggleTheme } = useTheme();

  const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : insets.top;
  const topPadding = Math.max(insets.top, statusBarHeight) + 12;

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await mobileApiClient('/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      const { token, user } = res.data;
      await setAuthToken(token);
      await login(user, token);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify institutional credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoUser = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('emmie');
    setError(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.keyboardContainer, { backgroundColor: theme.colors.canvasBg }]}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: topPadding }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top bar with Theme Toggle */}
        <View style={styles.topUtilityBar}>
          <View />
          <Pressable
            onPress={toggleTheme}
            style={[
              styles.themeToggle,
              {
                backgroundColor: isDark ? 'rgba(230, 212, 230, 0.12)' : 'rgba(9, 56, 31, 0.08)',
                borderColor: isDark ? 'rgba(230, 212, 230, 0.22)' : 'rgba(9, 56, 31, 0.18)',
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
            <Text style={[styles.themeToggleText, { color: theme.colors.textPrimary }]}>
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </Text>
          </Pressable>
        </View>

        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View
            style={[
              styles.glyphContainer,
              {
                backgroundColor: theme.colors.brandForestDark,
                borderColor: theme.colors.borderStrong,
              },
            ]}
          >
            <Text style={styles.glyphText}>R</Text>
          </View>
          <View style={styles.logoRow}>
            <Text style={[styles.titleMain, { color: theme.colors.textPrimary }]}>RESERV</Text>
            <Text style={styles.titleAccent}>iT</Text>
          </View>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Institutional Equipment Network
          </Text>
          <View style={{ marginTop: 8 }}>
            <Badge label="Verified Campus Directory" variant="brand" size="sm" />
          </View>
        </View>

        {/* Login Glass Form Card */}
        <GlassCard style={styles.formCard} padding={20}>
          <Text style={[styles.formTitle, { color: theme.colors.textPrimary }]}>
            Institutional Sign In
          </Text>
          <Text style={[styles.formSubtitle, { color: theme.colors.textMuted }]}>
            Use your authorized institutional SSO account
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#FB7185" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>INSTITUTIONAL EMAIL</Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme.colors.surfaceInput,
                  borderColor: theme.colors.borderInput,
                },
              ]}
            >
              <Ionicons name="mail-outline" size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput
                placeholder="name@school.edu"
                placeholderTextColor={theme.colors.textMuted}
                value={email}
                onChangeText={setEmail}
                style={[styles.input, { color: theme.colors.textPrimary }]}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>PASSWORD</Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme.colors.surfaceInput,
                  borderColor: theme.colors.borderInput,
                },
              ]}
            >
              <Ionicons name="lock-closed-outline" size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput
                placeholder="••••••••"
                placeholderTextColor={theme.colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={[styles.input, { color: theme.colors.textPrimary }]}
              />
            </View>
          </View>

          <Button
            title={isLoading ? 'Authenticating...' : 'Sign In to Portal'}
            onPress={handleLogin}
            variant="primary"
            size="lg"
            isLoading={isLoading}
            style={styles.submitButton}
          />
        </GlassCard>

        {/* Quick Demo Credentials */}
        <GlassCard style={styles.demoCard} padding={16}>
          <Text style={[styles.demoLabel, { color: theme.colors.textMuted }]}>
            Instant Demo Sign In Profiles
          </Text>
          <View style={styles.demoButtonsRow}>
            <Pressable
              onPress={() => setDemoUser('alex.rivera@student.school.edu')}
              style={[
                styles.demoPill,
                {
                  backgroundColor: theme.colors.surfaceSecondary,
                  borderColor: theme.colors.borderMedium,
                },
                email.includes('alex') && {
                  borderColor: isDark ? '#34D399' : theme.colors.brandForestMid,
                  backgroundColor: isDark ? 'rgba(27, 106, 65, 0.25)' : 'rgba(27, 106, 65, 0.12)',
                },
              ]}
            >
              <Text
                style={[
                  styles.demoPillText,
                  { color: email.includes('alex') ? (isDark ? '#34D399' : '#155E38') : theme.colors.textSecondary },
                ]}
              >
                Student (Alex)
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setDemoUser('sarah.jenkins@faculty.school.edu')}
              style={[
                styles.demoPill,
                {
                  backgroundColor: theme.colors.surfaceSecondary,
                  borderColor: theme.colors.borderMedium,
                },
                email.includes('jenkins') && {
                  borderColor: isDark ? '#34D399' : theme.colors.brandForestMid,
                  backgroundColor: isDark ? 'rgba(27, 106, 65, 0.25)' : 'rgba(27, 106, 65, 0.12)',
                },
              ]}
            >
              <Text
                style={[
                  styles.demoPillText,
                  { color: email.includes('jenkins') ? (isDark ? '#34D399' : '#155E38') : theme.colors.textSecondary },
                ]}
              >
                Staff (Jenkins)
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setDemoUser('admin@school.edu')}
              style={[
                styles.demoPill,
                {
                  backgroundColor: theme.colors.surfaceSecondary,
                  borderColor: theme.colors.borderMedium,
                },
                email.includes('admin') && {
                  borderColor: isDark ? '#34D399' : theme.colors.brandForestMid,
                  backgroundColor: isDark ? 'rgba(27, 106, 65, 0.25)' : 'rgba(27, 106, 65, 0.12)',
                },
              ]}
            >
              <Text
                style={[
                  styles.demoPillText,
                  { color: email.includes('admin') ? (isDark ? '#34D399' : '#155E38') : theme.colors.textSecondary },
                ]}
              >
                Admin
              </Text>
            </Pressable>
          </View>
        </GlassCard>

        <Text style={[styles.footerNote, { color: theme.colors.textMuted }]}>
          Protected by Institutional Single Sign-On • RESERViT v2.0
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 36,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  topUtilityBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9999,
    borderWidth: 1,
  },
  themeToggleText: {
    fontSize: 12,
    fontFamily: 'Chirp-Bold',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  glyphContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  glyphText: {
    color: '#FAF8FB',
    fontSize: 30,
    fontFamily: 'Chirp-Heavy',
    fontWeight: '800',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleMain: {
    fontSize: 28,
    fontFamily: 'Chirp-Heavy',
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  titleAccent: {
    fontSize: 28,
    fontFamily: 'Chirp-Heavy',
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Chirp-Medium',
    fontWeight: '500',
    marginTop: 4,
    letterSpacing: 0.2,
  },
  formCard: {
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontFamily: 'Chirp-Heavy',
    fontWeight: '800',
  },
  formSubtitle: {
    fontSize: 12,
    fontFamily: 'Chirp-Regular',
    marginTop: 3,
    marginBottom: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(225, 29, 72, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.35)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#FB7185',
    fontSize: 12,
    fontFamily: 'Chirp-Medium',
    fontWeight: '500',
    flex: 1,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontFamily: 'Chirp-Bold',
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Chirp-Medium',
    height: '100%',
  },
  submitButton: {
    marginTop: 8,
  },
  demoCard: {
    marginBottom: 20,
  },
  demoLabel: {
    fontSize: 11,
    fontFamily: 'Chirp-Bold',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoPill: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoPillText: {
    fontSize: 11,
    fontFamily: 'Chirp-Bold',
    fontWeight: '700',
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 11,
    fontFamily: 'Chirp-Regular',
    marginTop: 8,
  },
});
