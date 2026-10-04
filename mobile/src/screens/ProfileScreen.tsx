import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Alert,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useMobileAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { AppHeader } from '../components/AppHeader';
import { SmoothReveal } from '../components/SmoothReveal';

export const ProfileScreen = ({ navigation }: any) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout } = useMobileAuth();

  // Account Customization States
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [dueRemindersEnabled, setDueRemindersEnabled] = useState(true);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);
  const [selectedDepot, setSelectedDepot] = useState('STC-101 (Science & Tech Desk)');
  
  // Customization Edit Modal
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [displayName, setDisplayName] = useState(
    user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Alex Morgan')
  );
  const [phone, setPhone] = useState('+1 (555) 382-9011');
  const [department, setDepartment] = useState('School of Engineering & Computing');
  const [studentId, setStudentId] = useState('STU-2024-8841');

  // Depot Selector Modal
  const [isDepotModalVisible, setIsDepotModalVisible] = useState(false);
  const DEPOTS = [
    'STC-101 (Science & Tech Desk)',
    'ENG-204 (Robotics Lab Annex)',
    'MED-012 (Media Production Studio)',
    'MAIN-LIB (Central Campus Library)',
  ];

  const handleSaveProfile = () => {
    setIsEditModalVisible(false);
    Alert.alert('Profile Updated', 'Your institutional account settings have been saved successfully.');
  };

  const handleLogoutPress = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to end your session on this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (e) {
              console.log('Error during logout:', e);
            }
          },
        },
      ]
    );
  };

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'AM';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.canvasBg }]}>
      <AppHeader />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── User Identity Hero Card ────────────────────────────────────────── */}
        <SmoothReveal delay={0} distance={12} scale={true}>
          <GlassCard padding={20} style={styles.heroCard}>
            <View style={styles.avatarRow}>
              <View
                style={[
                  styles.largeAvatar,
                  {
                    backgroundColor: theme.colors.brandForestDark,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(27, 106, 65, 0.40)',
                    shadowColor: isDark ? '#000' : theme.colors.brandForestMid,
                  },
                ]}
              >
                <Text style={styles.avatarText}>{initials}</Text>
              </View>

              <View style={styles.heroInfo}>
                <View style={styles.nameBadgeRow}>
                  <Text style={[styles.userName, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                    {displayName}
                  </Text>
                </View>
                <Text style={[styles.userEmail, { color: theme.colors.textMuted }]} numberOfLines={1}>
                  {user?.email || 'alex.morgan@university.edu'}
                </Text>
                <View style={styles.badgeRow}>
                  <Badge
                    label={user?.role?.toUpperCase() || 'STUDENT VERIFIED'}
                    variant="available"
                    size="sm"
                  />
                  <Text style={[styles.idText, { color: theme.colors.textMuted }]}>
                    {studentId}
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Metrics Strip */}
            <View
              style={[
                styles.metricsStrip,
                {
                  backgroundColor: theme.colors.surfaceSecondary,
                  borderColor: theme.colors.borderSubtle,
                },
              ]}
            >
              <View style={styles.metricItem}>
                <Text style={[styles.metricValue, { color: theme.colors.textPrimary }]}>4</Text>
                <Text style={[styles.metricLabel, { color: theme.colors.textMuted }]}>Loans</Text>
              </View>
              <View style={[styles.metricDivider, { backgroundColor: theme.colors.borderSubtle }]} />
              <View style={styles.metricItem}>
                <Text style={[styles.metricValue, { color: theme.colors.status.available.text }]}>99%</Text>
                <Text style={[styles.metricLabel, { color: theme.colors.textMuted }]}>On-Time</Text>
              </View>
              <View style={[styles.metricDivider, { backgroundColor: theme.colors.borderSubtle }]} />
              <View style={styles.metricItem}>
                <Text style={[styles.metricValue, { color: theme.colors.textPrimary }]}>0</Text>
                <Text style={[styles.metricLabel, { color: theme.colors.textMuted }]}>Overdue</Text>
              </View>
            </View>

            <Button
              title="Edit Account Details"
              variant="secondary"
              size="sm"
              icon={<Ionicons name="create-outline" size={15} color={theme.colors.textPrimary} />}
              onPress={() => setIsEditModalVisible(true)}
              style={{ marginTop: 14 }}
            />
          </GlassCard>
        </SmoothReveal>

        {/* ── Appearance & Interface Group ────────────────────────────────────── */}
        <SmoothReveal delay={60} distance={10}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
            APPEARANCE & INTERFACE
          </Text>
          <GlassCard padding={0} style={styles.groupCard}>
            {/* Dark Mode Row */}
            <View style={styles.tableRow}>
              <View style={styles.rowLeft}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.15)' : 'rgba(90, 45, 92, 0.15)' },
                  ]}
                >
                  <Ionicons
                    name={isDark ? 'sunny' : 'moon'}
                    size={18}
                    color={isDark ? '#FBBF24' : '#5A2D5C'}
                  />
                </View>
                <View style={styles.rowLabelContainer}>
                  <Text style={[styles.rowTitle, { color: theme.colors.textPrimary }]}>
                    Dark Mode
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: theme.colors.textMuted }]}>
                    {isDark ? 'Apple Deep Space Glass' : 'Clean Institutional Bright'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#767577', true: isDark ? '#007F7A' : '#004643' }}
                thumbColor={isDark ? '#2DD4BF' : '#F0EDE5'}
              />
            </View>

            <View style={[styles.separator, { backgroundColor: theme.colors.borderSubtle }]} />

            {/* Haptic Feedback Row */}
            <View style={styles.tableRow}>
              <View style={styles.rowLeft}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: isDark ? 'rgba(0, 70, 67, 0.28)' : 'rgba(0, 70, 67, 0.10)' },
                  ]}
                >
                  <Ionicons name="phone-portrait-outline" size={18} color={isDark ? '#2DD4BF' : '#004643'} />
                </View>
                <View style={styles.rowLabelContainer}>
                  <Text style={[styles.rowTitle, { color: theme.colors.textPrimary }]}>
                    Haptic Feedback
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: theme.colors.textMuted }]}>
                    Subtle vibration on button taps
                  </Text>
                </View>
              </View>
              <Switch
                value={hapticsEnabled}
                onValueChange={setHapticsEnabled}
                trackColor={{ false: '#767577', true: isDark ? '#007F7A' : '#004643' }}
                thumbColor={hapticsEnabled ? (isDark ? '#2DD4BF' : '#004643') : '#FAF8FB'}
              />
            </View>
          </GlassCard>
        </SmoothReveal>

        {/* ── Institutional Settings & Depot ─────────────────────────────────── */}
        <SmoothReveal delay={110} distance={10}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
            INSTITUTIONAL PREFERENCES
          </Text>
          <GlassCard padding={0} style={styles.groupCard}>
            {/* Preferred Pickup Depot */}
            <Pressable
              style={({ pressed }) => [
                styles.tableRow,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => setIsDepotModalVisible(true)}
            >
              <View style={styles.rowLeft}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: 'rgba(34, 197, 94, 0.15)' },
                  ]}
                >
                  <Ionicons name="location-outline" size={18} color="#22C55E" />
                </View>
                <View style={styles.rowLabelContainer}>
                  <Text style={[styles.rowTitle, { color: theme.colors.textPrimary }]}>
                    Pickup Depot
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: theme.colors.textMuted }]} numberOfLines={1}>
                    {selectedDepot}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </Pressable>

            <View style={[styles.separator, { backgroundColor: theme.colors.borderSubtle }]} />

            {/* Department Row */}
            <View style={styles.tableRow}>
              <View style={styles.rowLeft}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: 'rgba(167, 139, 250, 0.15)' },
                  ]}
                >
                  <Ionicons name="school-outline" size={18} color="#A78BFA" />
                </View>
                <View style={styles.rowLabelContainer}>
                  <Text style={[styles.rowTitle, { color: theme.colors.textPrimary }]}>
                    Department
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: theme.colors.textMuted }]} numberOfLines={1}>
                    {department}
                  </Text>
                </View>
              </View>
            </View>
          </GlassCard>
        </SmoothReveal>

        {/* ── Notification Group ────────────────────────────────────────────── */}
        <SmoothReveal delay={160} distance={10}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
            NOTIFICATIONS & REMINDERS
          </Text>
          <GlassCard padding={0} style={styles.groupCard}>
            <View style={styles.tableRow}>
              <View style={styles.rowLeft}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
                  ]}
                >
                  <Ionicons name="time-outline" size={18} color="#F59E0B" />
                </View>
                <View style={styles.rowLabelContainer}>
                  <Text style={[styles.rowTitle, { color: theme.colors.textPrimary }]}>
                    Due Date Alerts
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: theme.colors.textMuted }]}>
                    Receive alert 24h before return deadline
                  </Text>
                </View>
              </View>
              <Switch
                value={dueRemindersEnabled}
                onValueChange={setDueRemindersEnabled}
                trackColor={{ false: '#767577', true: isDark ? '#007F7A' : '#004643' }}
                thumbColor={dueRemindersEnabled ? (isDark ? '#2DD4BF' : '#004643') : '#FAF8FB'}
              />
            </View>

            <View style={[styles.separator, { backgroundColor: theme.colors.borderSubtle }]} />

            <View style={styles.tableRow}>
              <View style={styles.rowLeft}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: isDark ? 'rgba(0, 70, 67, 0.28)' : 'rgba(0, 70, 67, 0.10)' },
                  ]}
                >
                  <Ionicons name="mail-outline" size={18} color={isDark ? '#2DD4BF' : '#004643'} />
                </View>
                <View style={styles.rowLabelContainer}>
                  <Text style={[styles.rowTitle, { color: theme.colors.textPrimary }]}>
                    Email Receipts
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: theme.colors.textMuted }]}>
                    Send approval PDFs & handoff confirmations
                  </Text>
                </View>
              </View>
              <Switch
                value={emailAlertsEnabled}
                onValueChange={setEmailAlertsEnabled}
                trackColor={{ false: '#767577', true: isDark ? '#007F7A' : '#004643' }}
                thumbColor={emailAlertsEnabled ? (isDark ? '#2DD4BF' : '#004643') : '#FAF8FB'}
              />
            </View>
          </GlassCard>
        </SmoothReveal>

        {/* ── Security & System ─────────────────────────────────────────────── */}
        <SmoothReveal delay={210} distance={10}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
            SYSTEM & SECURITY
          </Text>
          <GlassCard padding={0} style={styles.groupCard}>
            <Pressable
              style={({ pressed }) => [
                styles.tableRow,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() =>
                Alert.alert(
                  'Security Check',
                  'Your institutional SSO credentials are managed via University Active Directory.'
                )
              }
            >
              <View style={styles.rowLeft}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: 'rgba(148, 163, 184, 0.15)' },
                  ]}
                >
                  <Ionicons name="shield-checkmark-outline" size={18} color="#94A3B8" />
                </View>
                <View style={styles.rowLabelContainer}>
                  <Text style={[styles.rowTitle, { color: theme.colors.textPrimary }]}>
                    Single Sign-On (SSO)
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: theme.colors.textMuted }]}>
                    Connected to Campus Directory
                  </Text>
                </View>
              </View>
              <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
            </Pressable>

            <View style={[styles.separator, { backgroundColor: theme.colors.borderSubtle }]} />

            <View style={styles.tableRow}>
              <View style={styles.rowLeft}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: 'rgba(27, 106, 65, 0.15)' },
                  ]}
                >
                  <Ionicons name="information-circle-outline" size={18} color="#34D399" />
                </View>
                <View style={styles.rowLabelContainer}>
                  <Text style={[styles.rowTitle, { color: theme.colors.textPrimary }]}>
                    RESERViT Mobile
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: theme.colors.textMuted }]}>
                    Version 1.4.2 • Apple HIG Design Engine
                  </Text>
                </View>
              </View>
              <Text style={[styles.versionBadge, { color: theme.colors.textMuted }]}>
                v1.4.2
              </Text>
            </View>
          </GlassCard>
        </SmoothReveal>

        {/* ── Sign Out Action ───────────────────────────────────────────────── */}
        <SmoothReveal delay={250} distance={8}>
          <View style={styles.logoutContainer}>
            <Button
              title="Sign Out of RESERViT"
              variant="danger"
              size="md"
              icon={<Ionicons name="log-out-outline" size={18} color="#FFF" />}
              onPress={handleLogoutPress}
              style={styles.logoutButton}
            />
            <Text style={[styles.legalText, { color: theme.colors.textMuted }]}>
              University Equipment Reservation Service • Authorized Academic Use Only
            </Text>
          </View>
        </SmoothReveal>
      </ScrollView>

      {/* ── Edit Profile Modal ──────────────────────────────────────────────── */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassCard padding={24} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                Edit Account Details
              </Text>
              <Pressable
                onPress={() => setIsEditModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={22} color={theme.colors.textMuted} />
              </Pressable>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textMuted }]}>
                Full Display Name
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.colors.surfaceSecondary,
                    color: theme.colors.textPrimary,
                    borderColor: theme.colors.borderMedium,
                  },
                ]}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Full Name"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textMuted }]}>
                Phone Number
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.colors.surfaceSecondary,
                    color: theme.colors.textPrimary,
                    borderColor: theme.colors.borderMedium,
                  },
                ]}
                value={phone}
                onChangeText={setPhone}
                placeholder="+1 (555) 000-0000"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textMuted }]}>
                Department / Program
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.colors.surfaceSecondary,
                    color: theme.colors.textPrimary,
                    borderColor: theme.colors.borderMedium,
                  },
                ]}
                value={department}
                onChangeText={setDepartment}
                placeholder="Department"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textMuted }]}>
                Institutional ID
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.colors.surfaceSecondary,
                    color: theme.colors.textPrimary,
                    borderColor: theme.colors.borderMedium,
                  },
                ]}
                value={studentId}
                onChangeText={setStudentId}
                placeholder="ID Number"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="secondary"
                size="md"
                onPress={() => setIsEditModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Save Changes"
                variant="primary"
                size="md"
                onPress={handleSaveProfile}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </GlassCard>
        </View>
      </Modal>

      {/* ── Depot Selector Modal ────────────────────────────────────────────── */}
      <Modal
        visible={isDepotModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsDepotModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassCard padding={20} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                Select Preferred Depot
              </Text>
              <Pressable
                onPress={() => setIsDepotModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={22} color={theme.colors.textMuted} />
              </Pressable>
            </View>

            {DEPOTS.map((depot) => {
              const isSelected = selectedDepot === depot;
              return (
                <Pressable
                  key={depot}
                  style={[
                    styles.depotOption,
                    {
                      backgroundColor: isSelected
                        ? theme.colors.surfaceElevated
                        : theme.colors.surfaceSecondary,
                      borderColor: isSelected
                        ? theme.colors.status.available.border
                        : theme.colors.borderSubtle,
                    },
                  ]}
                  onPress={() => {
                    setSelectedDepot(depot);
                    setIsDepotModalVisible(false);
                  }}
                >
                  <View style={styles.rowLeft}>
                    <Ionicons
                      name="location"
                      size={18}
                      color={isSelected ? (isDark ? '#2DD4BF' : '#004643') : theme.colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.depotText,
                        {
                          color: isSelected
                            ? theme.colors.textPrimary
                            : theme.colors.textSecondary,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {depot}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={isDark ? '#2DD4BF' : '#004643'} />
                  )}
                </Pressable>
              );
            })}
          </GlassCard>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    marginBottom: 24,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  largeAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroInfo: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  idText: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '600',
  },
  metricsStrip: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  groupCard: {
    marginBottom: 22,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowLabelContainer: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  rowSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  separator: {
    height: 1,
    marginLeft: 56,
  },
  versionBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  logoutContainer: {
    marginTop: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  logoutButton: {
    width: '100%',
  },
  legalText: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalCloseButton: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  depotOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  depotText: {
    fontSize: 13,
    marginLeft: 10,
    flex: 1,
  },
});
