import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mobileUsersApi, MobileUser } from '../api/users';
import { useTheme } from '../context/ThemeContext';
import { useMobileAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { AppHeader } from '../components/AppHeader';
import { SmoothReveal } from '../components/SmoothReveal';

export const UserManagementScreen = ({ navigation }: any) => {
  const { user: currentUser } = useMobileAuth();
  const { theme, isDark } = useTheme();
  const [users, setUsers] = useState<MobileUser[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isAdmin = currentUser?.roles?.some((r: string) => r?.toUpperCase() === 'ADMIN');

  // Add User Modal State
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    student_number: '',
    email: '',
    password: '',
    role: 'STUDENT',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string> = {};
      if (search.trim()) params.search = search.trim();
      const res = await mobileUsersApi.getAll(params);
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleCreateUser = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      setModalError('First name, last name, and email are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setModalError(null);
      await mobileUsersApi.create({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        middle_name: formData.middle_name.trim() || undefined,
        student_number: formData.student_number.trim() || undefined,
        email: formData.email.trim(),
        password: formData.password || 'emmie',
        role: formData.role,
      });

      setAddModalVisible(false);
      setFormData({
        first_name: '',
        last_name: '',
        middle_name: '',
        student_number: '',
        email: '',
        password: '',
        role: 'STUDENT',
      });
      setFeedbackMessage(`User '${formData.email}' provisioned for SSO successfully.`);
      setTimeout(() => setFeedbackMessage(null), 3500);
      fetchUsers();
    } catch (err: any) {
      setModalError(err.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderItem = ({ item, index }: { item: MobileUser; index: number }) => {
    const roles = Array.isArray(item.roles) ? item.roles : [];
    const primaryRole = roles[0] || 'STUDENT';
    const isActive = item.account_status === 'active';

    return (
      <SmoothReveal delay={Math.min(index, 7) * 45} distance={10}>
        <GlassCard style={styles.card} padding={16}>
          <View style={styles.cardHeader}>
            <View style={styles.userInfo}>
              <View style={[styles.avatar, { backgroundColor: isDark ? 'rgba(0, 128, 128, 0.25)' : 'rgba(0, 128, 128, 0.12)' }]}>
                <Text style={[styles.avatarText, { color: isDark ? '#2DD4BF' : '#008080' }]}>
                  {item.first_name?.[0] || 'U'}
                </Text>
              </View>
              <View>
                <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>
                  {item.first_name} {item.last_name}
                </Text>
                <Text style={[styles.userEmail, { color: theme.colors.textMuted }]}>
                  {item.email}
                </Text>
              </View>
            </View>

            <Badge
              label={primaryRole}
              variant={primaryRole === 'ADMIN' ? 'active' : 'available'}
              size="sm"
            />
          </View>

          <View style={[styles.detailsBox, { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.borderSubtle }]}>
            {item.student_number ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.textMuted }]}>Student No:</Text>
                <Text style={[styles.detailValue, { color: isDark ? '#2DD4BF' : '#008080' }]}>
                  {item.student_number}
                </Text>
              </View>
            ) : null}
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.textMuted }]}>Account Status:</Text>
              <Text style={[styles.detailValue, { color: isActive ? '#22c55e' : '#ef4444' }]}>
                {isActive ? 'Active (SSO Verified)' : 'Inactive'}
              </Text>
            </View>
          </View>
        </GlassCard>
      </SmoothReveal>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.canvasBg }]}>
      <AppHeader />

      <View style={styles.topBar}>
        <View>
          <Text style={[styles.screenTitle, { color: theme.colors.textPrimary }]}>
            Institutional Users
          </Text>
          <Text style={[styles.screenSubtitle, { color: theme.colors.textMuted }]}>
            Provision students and university staff for SSO authentication
          </Text>
        </View>

        <Button
          title="+ Provision User"
          variant="primary"
          size="sm"
          onPress={() => setAddModalVisible(true)}
        />
      </View>

      {feedbackMessage && (
        <View style={[styles.toast, { backgroundColor: 'rgba(0, 128, 128, 0.15)', borderColor: 'rgba(0, 128, 128, 0.35)' }]}>
          <Ionicons name="checkmark-circle" size={16} color="#2DD4BF" />
          <Text style={[styles.toastText, { color: '#2DD4BF' }]}>{feedbackMessage}</Text>
        </View>
      )}

      <View style={[styles.searchBar, { backgroundColor: theme.colors.surfaceInput, borderColor: theme.colors.borderInput }]}>
        <Ionicons name="search" size={16} color={theme.colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.textPrimary }]}
          placeholder="Search by name, email, or student number..."
          placeholderTextColor={theme.colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={isDark ? '#2DD4BF' : '#008080'} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.user_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDark ? '#2DD4BF' : '#008080'}
            />
          }
        />
      )}

      {/* Provision User Modal */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.borderMedium }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                Provision User for SSO
              </Text>
              <Pressable onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={20} color={theme.colors.textMuted} />
              </Pressable>
            </View>

            {modalError && (
              <View style={[styles.errorBox, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
                <Text style={{ color: '#ef4444', fontSize: 12 }}>{modalError}</Text>
              </View>
            )}

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>First Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.surfaceInput, borderColor: theme.colors.borderInput, color: theme.colors.textPrimary }]}
                value={formData.first_name}
                onChangeText={(t) => setFormData({ ...formData, first_name: t })}
                placeholder="e.g. Emmanuel"
                placeholderTextColor={theme.colors.textMuted}
              />

              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Last Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.surfaceInput, borderColor: theme.colors.borderInput, color: theme.colors.textPrimary }]}
                value={formData.last_name}
                onChangeText={(t) => setFormData({ ...formData, last_name: t })}
                placeholder="e.g. Mugisha"
                placeholderTextColor={theme.colors.textMuted}
              />

              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Student ID / Matriculation No</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.surfaceInput, borderColor: theme.colors.borderInput, color: theme.colors.textPrimary }]}
                value={formData.student_number}
                onChangeText={(t) => setFormData({ ...formData, student_number: t })}
                placeholder="e.g. GU/2026/BIT/042"
                placeholderTextColor={theme.colors.textMuted}
              />

              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Institutional Email *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.surfaceInput, borderColor: theme.colors.borderInput, color: theme.colors.textPrimary }]}
                value={formData.email}
                onChangeText={(t) => setFormData({ ...formData, email: t })}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="e.g. student@gmail.com"
                placeholderTextColor={theme.colors.textMuted}
              />

              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Temporary Password (Default: emmie)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.surfaceInput, borderColor: theme.colors.borderInput, color: theme.colors.textPrimary }]}
                value={formData.password}
                onChangeText={(t) => setFormData({ ...formData, password: t })}
                secureTextEntry
                placeholder="emmie"
                placeholderTextColor={theme.colors.textMuted}
              />

              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Role Assignment</Text>
              <View style={styles.roleRow}>
                {['STUDENT', 'LECTURER', 'ATTENDANT', 'ADMIN'].map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => setFormData({ ...formData, role: r })}
                    style={[
                      styles.rolePill,
                      {
                        backgroundColor: formData.role === r ? (isDark ? '#008080' : '#006666') : theme.colors.surfaceSecondary,
                        borderColor: formData.role === r ? '#2DD4BF' : theme.colors.borderSubtle,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: formData.role === r ? '#FFF' : theme.colors.textMuted }}>
                      {r}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setAddModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title={isSubmitting ? 'Provisioning...' : 'Provision User'}
                variant="primary"
                onPress={handleCreateUser}
                disabled={isSubmitting}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  screenTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  toast: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toastText: {
    fontSize: 12,
    fontWeight: '600',
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
    gap: 10,
  },
  card: {
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 12,
  },
  detailsBox: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 12,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  errorBox: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
    fontSize: 13,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
    marginBottom: 10,
  },
  rolePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
});
