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

export const LoginScreen = () => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useMobileAuth();
  const { theme, isDark } = useTheme();

  const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : insets.top;
  const topPadding = Math.max(insets.top, statusBarHeight) + 16;

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const res = await mobileApiClient('/auth/login', {
        method: 'POST',
        body: { email: email.trim(), password },
      });
      const { token, user } = res.data;
      await setAuthToken(token);
      await login(user, token);
    } catch (err: any) {
      setError(err.message || 'Incorrect email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.colors.canvasBg }]}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPadding }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.brand}>
          <View
            style={[
              styles.glyph,
              { backgroundColor: '#008080', borderColor: 'rgba(255,255,255,0.22)' },
            ]}
          >
            <Text style={styles.glyphText}>R</Text>
          </View>
          <View style={styles.logoRow}>
            <Text style={[styles.logoMain, { color: theme.colors.textPrimary }]}>RESERV</Text>
            <Text style={styles.logoAccent}>iT</Text>
          </View>
          <Text style={[styles.tagline, { color: theme.colors.textMuted }]}>
            Campus Equipment Reservation
          </Text>
        </View>

        {/* Form */}
        <GlassCard style={styles.card} padding={24}>
          <Text style={[styles.heading, { color: theme.colors.textPrimary }]}>Sign in</Text>
          <Text style={[styles.sub, { color: theme.colors.textMuted }]}>
            University email or student ID
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={15} color="#FB7185" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Email field */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>Email or Student ID</Text>
            <View
              style={[
                styles.inputRow,
                { backgroundColor: theme.colors.surfaceInput, borderColor: theme.colors.borderInput },
              ]}
            >
              <Ionicons name="mail-outline" size={17} color={theme.colors.textMuted} style={styles.icon} />
              <TextInput
                placeholder="user@gu.ac.ug"
                placeholderTextColor={theme.colors.textMuted}
                value={email}
                onChangeText={setEmail}
                style={[styles.input, { color: theme.colors.textPrimary }]}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Password field */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>Password</Text>
            <View
              style={[
                styles.inputRow,
                { backgroundColor: theme.colors.surfaceInput, borderColor: theme.colors.borderInput },
              ]}
            >
              <Ionicons name="lock-closed-outline" size={17} color={theme.colors.textMuted} style={styles.icon} />
              <TextInput
                placeholder="••••••••"
                placeholderTextColor={theme.colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={[styles.input, { color: theme.colors.textPrimary }]}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={10}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={17}
                  color={theme.colors.textMuted}
                />
              </Pressable>
            </View>
          </View>

          <Button
            title={isLoading ? 'Signing in…' : 'Sign In'}
            onPress={handleLogin}
            variant="primary"
            size="lg"
            isLoading={isLoading}
            style={styles.btn}
          />
        </GlassCard>

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="shield-checkmark-outline" size={13} color={theme.colors.textMuted} />
          <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
            Secured via institutional SSO
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    flexGrow: 1,
    justifyContent: 'center',
  },
  brand: {
    alignItems: 'center',
    marginBottom: 28,
  },
  glyph: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  glyphText: {
    color: '#FAF8FB',
    fontSize: 28,
    fontFamily: 'Chirp-Heavy',
    fontWeight: '800',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoMain: {
    fontSize: 26,
    fontFamily: 'Chirp-Heavy',
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  logoAccent: {
    fontSize: 26,
    fontFamily: 'Chirp-Heavy',
    fontWeight: '800',
    color: '#F26419',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 11.5,
    fontFamily: 'Chirp-Medium',
    fontWeight: '500',
    marginTop: 4,
    letterSpacing: 0.2,
  },
  card: {
    marginBottom: 16,
  },
  heading: {
    fontSize: 20,
    fontFamily: 'Chirp-Heavy',
    fontWeight: '800',
    marginBottom: 2,
  },
  sub: {
    fontSize: 13,
    fontFamily: 'Chirp-Regular',
    marginBottom: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(225, 29, 72, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.30)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#FB7185',
    fontSize: 12.5,
    fontFamily: 'Chirp-Medium',
    fontWeight: '500',
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11.5,
    fontFamily: 'Chirp-Bold',
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Chirp-Medium',
    height: '100%',
  },
  btn: {
    marginTop: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 4,
  },
  footerText: {
    fontSize: 11,
    fontFamily: 'Chirp-Regular',
  },
});
