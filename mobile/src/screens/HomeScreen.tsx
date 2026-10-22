import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Animated,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useMobileAuth } from '../context/AuthContext';
import { mobileReservationApi, Reservation } from '../api/reservations';
import { mobileEquipmentApi } from '../api/equipment';
import { GlassCard } from '../components/GlassCard';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { AppHeader } from '../components/AppHeader';
import { SmoothReveal } from '../components/SmoothReveal';

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useMobileAuth();
  const { theme, isDark } = useTheme();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [equipmentCount, setEquipmentCount] = useState<number>(0);
  const [faultyCount, setFaultyCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const primaryRole = (user?.roles?.[0] || 'STUDENT').toUpperCase();
  const isStudent = primaryRole === 'STUDENT';
  const isLecturer = primaryRole === 'LECTURER' || primaryRole === 'STAFF';
  const isAttendant = primaryRole === 'ATTENDANT' || primaryRole === 'TECHNICIAN';
  const isAdmin = primaryRole === 'ADMIN';

  const fetchData = async () => {
    try {
      const [resData, eqData, faultyData] = await Promise.all([
        mobileReservationApi.getAll().catch(() => ({ data: [] })),
        mobileEquipmentApi.getAll({ is_bookable: isStudent || isLecturer ? 'true' : '' }).catch(() => ({ data: [] })),
        (isAttendant || isAdmin)
          ? mobileEquipmentApi.getFaulty().catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] }),
      ]);

      setReservations(resData.data || []);
      setEquipmentCount(eqData.data?.length ?? 0);
      setFaultyCount(faultyData.data?.length ?? 0);
    } catch (e) {
      console.log('Error fetching dashboard data:', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Staggered card entrance animations
  const cardAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;
  const cardSlides = useRef([0, 1, 2, 3].map(() => new Animated.Value(16))).current;

  useEffect(() => {
    const animations = cardAnims.map((anim, i) =>
      Animated.parallel([
        Animated.spring(anim, {
          toValue: 1,
          delay: i * 65,
          useNativeDriver: true,
          speed: 18,
          bounciness: 5,
        }),
        Animated.spring(cardSlides[i], {
          toValue: 0,
          delay: i * 65,
          useNativeDriver: true,
          speed: 18,
          bounciness: 5,
        }),
      ])
    );
    Animated.stagger(60, animations).start();
  }, []);

  // Quick dispatch action handlers for Attendant & Admin
  const handleHandover = async (id: number) => {
    try {
      await mobileReservationApi.checkin(id, 'Handed over at mobile dispatch desk.');
      setActionFeedback(`Reservation #${id} checked out to requester.`);
      setTimeout(() => setActionFeedback(null), 3000);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Handover failed');
    }
  };

  const handleReturn = async (id: number) => {
    try {
      await mobileReservationApi.checkout(id, 'Returned intact at mobile desk.', 'Inspected by attendant.');
      setActionFeedback(`Reservation #${id} marked as returned.`);
      setTimeout(() => setActionFeedback(null), 3000);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Return failed');
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await mobileReservationApi.approve(id, 'Approved via administrator mobile portal.');
      setActionFeedback(`Reservation #${id} approved.`);
      setTimeout(() => setActionFeedback(null), 3000);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    }
  };

  // Role-specific metrics
  const activeLoans = reservations.filter((r) => r.status?.status_name === 'active');
  const pendingRequests = reservations.filter((r) => r.status?.status_name === 'pending');
  const approvedReadyForPickup = reservations.filter((r) => r.status?.status_name === 'approved');

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.canvasBg }]}>
      <AppHeader />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? '#2DD4BF' : '#008080'}
          />
        }
      >
        {actionFeedback && (
          <View style={[styles.feedbackBanner, { backgroundColor: 'rgba(0, 128, 128, 0.15)', borderColor: 'rgba(0, 128, 128, 0.35)' }]}>
            <Ionicons name="checkmark-circle" size={16} color="#2DD4BF" />
            <Text style={[styles.feedbackText, { color: '#2DD4BF' }]}>{actionFeedback}</Text>
          </View>
        )}

        {/* ── 1. Role-Tailored Greeting Banner ─────────────────────────────── */}
        <SmoothReveal delay={0} distance={12} scale={true}>
          <GlassCard style={styles.welcomeBanner} padding={16}>
            <View style={styles.badgeRow}>
              <Badge
                label={
                  isStudent
                    ? 'Class Representative Portal'
                    : isLecturer
                    ? 'Academic Faculty Portal'
                    : isAttendant
                    ? 'Depot Dispatch Operations'
                    : 'Institutional Administrator'
                }
                variant="brand"
                size="sm"
              />
              <Badge
                label={
                  isStudent
                    ? (user?.student_number || 'GU/2026/BIT/042')
                    : isLecturer
                    ? 'Dept. of Computer Science'
                    : isAttendant
                    ? 'STC-101 Dispatch Desk'
                    : 'System Governance'
                }
                variant={isStudent ? 'available' : isAttendant ? 'lilac' : 'brand'}
                size="sm"
              />
            </View>

            <Text style={[styles.greetingTitle, { color: theme.colors.textPrimary }]}>
              {isLecturer
                ? `Dr. ${user?.first_name || 'Faculty'} ${user?.last_name || ''}`
                : `Hello, ${user?.first_name || 'User'}!`}
            </Text>
            <Text style={[styles.greetingSubtitle, { color: theme.colors.textSecondary }]}>
              {isStudent
                ? 'Your personal equipment reservations, active loan countdowns, and pickup schedules.'
                : isLecturer
                ? 'Schedule teaching hardware and lab kits for lectures and practical student sessions.'
                : isAttendant
                ? 'Dispatch hardware loans, perform return check-ins, verify students, and report faulty gear.'
                : 'Campus-wide equipment governance, user SSO provisioning, role permissions, and asset auditing.'}
            </Text>

            <View style={styles.actionButtons}>
              <Button
                title={isStudent || isLecturer ? 'Browse Available Gear' : 'Depot Catalog'}
                variant="primary"
                size="sm"
                icon={<Ionicons name="search" size={14} color="#FFF" />}
                onPress={() => navigation.navigate('CatalogTab')}
              />
              <Button
                title={isStudent || isLecturer ? 'My Reservations' : 'All Reservations'}
                variant="secondary"
                size="sm"
                icon={<Ionicons name="calendar-outline" size={14} color={theme.colors.textPrimary} />}
                onPress={() => navigation.navigate('MyReservations')}
              />
            </View>
          </GlassCard>
        </SmoothReveal>

        {/* ── 2. Role-Tailored KPI Stats Grid ──────────────────────────────── */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <Animated.View style={{ flex: 1, opacity: cardAnims[0], transform: [{ translateY: cardSlides[0] }] }}>
              <StatCard
                label={isStudent || isLecturer ? 'My Active Loans' : 'Active Dispatches'}
                value={activeLoans.length}
                icon={<Ionicons name="checkmark-circle-outline" size={18} color="#2DD4BF" />}
                trend={activeLoans.length > 0 ? 'Currently in custody' : 'No active loans'}
                trendType={activeLoans.length > 0 ? 'up' : 'neutral'}
                variant="forest"
                onPress={() => navigation.navigate('MyReservations')}
              />
            </Animated.View>
            <Animated.View style={{ flex: 1, opacity: cardAnims[1], transform: [{ translateY: cardSlides[1] }] }}>
              <StatCard
                label={isStudent || isLecturer ? 'Pending Requests' : 'Pending Approvals'}
                value={pendingRequests.length}
                icon={<Ionicons name="time-outline" size={18} color="#F26419" />}
                trend={pendingRequests.length > 0 ? 'Awaiting review' : 'Queue clear'}
                trendType={pendingRequests.length > 0 ? 'warning' : 'neutral'}
                variant="lilac"
                onPress={() => navigation.navigate('MyReservations')}
              />
            </Animated.View>
          </View>

          <View style={styles.statsRow}>
            <Animated.View style={{ flex: 1, opacity: cardAnims[2], transform: [{ translateY: cardSlides[2] }] }}>
              <StatCard
                label={isStudent || isLecturer ? 'Available Catalog' : 'Depot Inventory'}
                value={equipmentCount}
                icon={<Ionicons name="cube-outline" size={18} color="#008080" />}
                trend={isStudent || isLecturer ? 'Ready for booking' : 'Total hardware units'}
                trendType="up"
                variant="forest"
                onPress={() => navigation.navigate('CatalogTab')}
              />
            </Animated.View>
            <Animated.View style={{ flex: 1, opacity: cardAnims[3], transform: [{ translateY: cardSlides[3] }] }}>
              <StatCard
                label={isAttendant || isAdmin ? 'Faulty Fleet' : 'Depot Depot'}
                value={isAttendant || isAdmin ? faultyCount : 'STC-101'}
                icon={<Ionicons name={isAttendant || isAdmin ? 'warning-outline' : 'location-outline'} size={18} color="#FB923C" />}
                trend={isAttendant || isAdmin ? 'Needs maintenance' : 'Science Complex'}
                trendType={faultyCount > 0 ? 'warning' : 'neutral'}
                variant="neutral"
                onPress={() => (isAttendant || isAdmin) && navigation.navigate('FaultyTab')}
              />
            </Animated.View>
          </View>
        </View>

        {/* ── 3. Role-Tailored Section: Action Queue or Active Loans ────────── */}
        {(isAttendant || isAdmin) ? (
          /* Attendant & Admin: Actionable Dispatch Queue */
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                {isAttendant ? 'Dispatch Queue & Returns' : 'Depot Operational Queue'}
              </Text>
              <Text style={[styles.sectionCount, { color: theme.colors.textMuted }]}>
                {approvedReadyForPickup.length + activeLoans.length + pendingRequests.length} Tasks
              </Text>
            </View>

            {isLoading ? (
              <ActivityIndicator color="#008080" />
            ) : reservations.length === 0 ? (
              <GlassCard style={styles.emptyCard} padding={16}>
                <Ionicons name="checkmark-done-circle-outline" size={28} color="#22c55e" />
                <Text style={[styles.emptyCardTitle, { color: theme.colors.textPrimary }]}>
                  All queues clear
                </Text>
                <Text style={[styles.emptyCardText, { color: theme.colors.textMuted }]}>
                  No bookings currently require physical handover or approval review.
                </Text>
              </GlassCard>
            ) : (
              reservations.slice(0, 4).map((res) => {
                const status = res.status?.status_name;
                const isApproved = status === 'approved';
                const isActive = status === 'active';
                const isPending = status === 'pending';

                return (
                  <GlassCard key={res.reservation_id} style={styles.taskCard} padding={14}>
                    <View style={styles.taskTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.taskTitle, { color: theme.colors.textPrimary }]}>
                          {res.items?.[0]?.equipment?.model?.model_name || `Booking #${res.reservation_id}`}
                        </Text>
                        <Text style={[styles.taskSub, { color: theme.colors.textMuted }]}>
                          Tag: {res.items?.[0]?.equipment?.asset_tag || 'Desk Allocation'} • ID #{res.reservation_id}
                        </Text>
                      </View>
                      <Badge
                        label={status || 'pending'}
                        variant={isActive ? 'available' : isPending ? 'pending' : 'brand'}
                        size="sm"
                      />
                    </View>

                    <Text style={[styles.taskDetails, { color: theme.colors.textSecondary }]}>
                      {res.purpose_details || 'Academic Practical loan request'}
                    </Text>

                    <View style={styles.taskActions}>
                      {isApproved && (
                        <Button
                          title="Hand Over Gear"
                          variant="primary"
                          size="sm"
                          icon={<Ionicons name="arrow-forward-circle-outline" size={14} color="#FFF" />}
                          onPress={() => handleHandover(res.reservation_id)}
                          style={{ flex: 1 }}
                        />
                      )}
                      {isActive && (
                        <Button
                          title="Inspect Return"
                          variant="secondary"
                          size="sm"
                          icon={<Ionicons name="checkbox-outline" size={14} color={theme.colors.textPrimary} />}
                          onPress={() => handleReturn(res.reservation_id)}
                          style={{ flex: 1 }}
                        />
                      )}
                      {isPending && isAdmin && (
                        <>
                          <Button
                            title="Approve"
                            variant="primary"
                            size="sm"
                            onPress={() => handleApprove(res.reservation_id)}
                            style={{ flex: 1 }}
                          />
                          <Button
                            title="Review"
                            variant="secondary"
                            size="sm"
                            onPress={() => navigation.navigate('MyReservations')}
                            style={{ flex: 1 }}
                          />
                        </>
                      )}
                    </View>
                  </GlassCard>
                );
              })
            )}
          </View>
        ) : (
          /* Student & Lecturer: Personal Loans & Handover Protocol */
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                {isLecturer ? 'My Course Practical Bookings' : 'My Active Borrowed Gear'}
              </Text>
              <Text style={[styles.sectionCount, { color: theme.colors.textMuted }]}>
                {activeLoans.length} In Custody
              </Text>
            </View>

            {isLoading ? (
              <ActivityIndicator color="#008080" />
            ) : activeLoans.length > 0 ? (
              activeLoans.map((loan) => (
                <GlassCard key={loan.reservation_id} style={styles.taskCard} padding={14}>
                  <View style={styles.taskTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.taskTitle, { color: theme.colors.textPrimary }]}>
                        {loan.items?.[0]?.equipment?.model?.model_name || `Loan #${loan.reservation_id}`}
                      </Text>
                      <Text style={[styles.taskSub, { color: theme.colors.textMuted }]}>
                        Asset Tag: {loan.items?.[0]?.equipment?.asset_tag || 'Standard Asset'}
                      </Text>
                    </View>
                    <Badge label="In Custody" variant="available" size="sm" />
                  </View>

                  <View style={[styles.dueRow, { borderTopColor: theme.colors.borderSubtle }]}>
                    <Ionicons name="time-outline" size={14} color="#F26419" />
                    <Text style={[styles.dueText, { color: theme.colors.textSecondary }]}>
                      Return By: {new Date(loan.requested_end_datetime).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </GlassCard>
              ))
            ) : (
              <GlassCard style={styles.emptyCard} padding={16}>
                <Ionicons name="sparkles-outline" size={26} color="#008080" />
                <Text style={[styles.emptyCardTitle, { color: theme.colors.textPrimary }]}>
                  No active equipment loans
                </Text>
                <Text style={[styles.emptyCardText, { color: theme.colors.textMuted }]}>
                  {isLecturer
                    ? 'Reserve projection kits, audio gear, and laptops for upcoming course lectures.'
                    : 'Need equipment for practical class sessions? Browse our hardware catalog.'}
                </Text>
                <Button
                  title="Reserve Equipment"
                  variant="primary"
                  size="sm"
                  onPress={() => navigation.navigate('CatalogTab')}
                  style={{ marginTop: 10 }}
                />
              </GlassCard>
            )}

            {/* Handover Guidelines Card */}
            <GlassCard style={styles.protocolCard} padding={14}>
              <View style={styles.protocolHeader}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#008080" />
                <Text style={[styles.protocolTitle, { color: theme.colors.textPrimary }]}>
                  University Depot Handover Protocol
                </Text>
              </View>
              <Text style={[styles.protocolText, { color: theme.colors.textMuted }]}>
                • Present your valid student ID card or faculty credentials at Science Depot STC-101.{'\n'}
                • Physical inspection is conducted before dispatch and immediately upon return.{'\n'}
                • Report damaged or faulty gear to the attendant immediately upon collection.
              </Text>
            </GlassCard>
          </View>
        )}
      </ScrollView>
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
    paddingTop: 8,
    gap: 16,
  },
  feedbackBanner: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  feedbackText: {
    fontSize: 12,
    fontWeight: '600',
  },
  welcomeBanner: {
    borderRadius: 20,
    gap: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  greetingSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  statsGrid: {
    gap: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sectionContainer: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  taskCard: {
    borderRadius: 14,
    gap: 8,
  },
  taskTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  taskSub: {
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  taskDetails: {
    fontSize: 12,
    lineHeight: 16,
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  dueText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyCard: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 24,
  },
  emptyCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  emptyCardText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 280,
  },
  protocolCard: {
    borderRadius: 14,
    gap: 6,
  },
  protocolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  protocolTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  protocolText: {
    fontSize: 11,
    lineHeight: 16,
  },
});
