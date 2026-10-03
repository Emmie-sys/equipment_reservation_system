import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
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

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useMobileAuth();
  const { theme, isDark } = useTheme();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [equipmentCount, setEquipmentCount] = useState<number>(114);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [resData, eqData] = await Promise.all([
        mobileReservationApi.getAll().catch(() => ({ data: [] })),
        mobileEquipmentApi.getAll({ is_bookable: 'true' }).catch(() => ({ data: [] })),
      ]);

      setReservations(resData.data || []);
      setEquipmentCount(eqData.data?.length ?? 114);
    } catch (e) {
      console.log('Error fetching dashboard data:', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const activeLoans = reservations.filter((r) => r.status?.status_name === 'active');
  const pendingRequests = reservations.filter((r) => r.status?.status_name === 'pending');

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
            tintColor={isDark ? theme.colors.brandLilacBase : theme.colors.brandForestDark}
          />
        }
      >
        {/* Welcome Greeting Banner (Solid, Zero Gradient) */}
        <GlassCard style={styles.welcomeBanner} padding={16}>
          <View style={styles.badgeRow}>
            <Badge label="Campus Equipment Portal" variant="brand" size="sm" />
            <Badge label="Instant Mobile Loans" variant="lilac" size="sm" />
          </View>

          <Text style={[styles.greetingTitle, { color: theme.colors.textPrimary }]}>
            Hi, {user?.first_name || 'Alex'}!
          </Text>
          <Text style={[styles.greetingSubtitle, { color: theme.colors.textSecondary }]}>
            Reserve cameras, audio gear, lab sensors, and laptops with zero checkout friction.
          </Text>

          <View style={styles.actionButtons}>
            <Button
              title="Browse Catalog"
              variant="primary"
              size="sm"
              icon={<Ionicons name="search" size={14} color={isDark ? theme.colors.brandForestDark : '#FAF8FB'} />}
              onPress={() => navigation.navigate('CatalogTab')}
            />
            <Button
              title="My Bookings"
              variant="secondary"
              size="sm"
              icon={<Ionicons name="calendar-outline" size={14} color={theme.colors.textPrimary} />}
              onPress={() => navigation.navigate('MyReservations')}
            />
          </View>
        </GlassCard>

        {/* KPI StatCards Grid (Cohesive Icons, Zero Gradient) */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              label="Active Loans"
              value={activeLoans.length}
              icon={<Ionicons name="checkmark-circle-outline" size={18} color={isDark ? '#34D399' : '#15803d'} />}
              trend={activeLoans.length > 0 ? "In student custody" : "No current loans"}
              trendType={activeLoans.length > 0 ? "up" : "neutral"}
              variant="forest"
              onPress={() => navigation.navigate('MyReservations')}
            />
            <StatCard
              label="Pending"
              value={pendingRequests.length}
              icon={<Ionicons name="time-outline" size={18} color={isDark ? theme.colors.brandLilacBase : '#5A2D5C'} />}
              trend={pendingRequests.length > 0 ? "Awaiting review" : "Queue clear"}
              trendType={pendingRequests.length > 0 ? "warning" : "neutral"}
              variant="lilac"
              onPress={() => navigation.navigate('MyReservations')}
            />
          </View>

          <View style={styles.statsRow}>
            <StatCard
              label="Campus Units"
              value={equipmentCount}
              icon={<Ionicons name="cube-outline" size={18} color={isDark ? '#34D399' : '#15803d'} />}
              trend="Ready for reservation"
              trendType="up"
              variant="forest"
              onPress={() => navigation.navigate('CatalogTab')}
            />
            <StatCard
              label="Pickup Depot"
              value="STC-101"
              icon={<Ionicons name="location-outline" size={18} color={isDark ? '#CBD5E1' : '#475569'} />}
              trend="Science & Tech Desk"
              trendType="neutral"
              variant="neutral"
            />
          </View>
        </View>

        {/* Current Active Loans Card */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Active Borrowed Equipment
          </Text>
          <Text style={[styles.sectionCount, { color: theme.colors.textMuted }]}>
            {activeLoans.length} Active
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={theme.colors.brandForestVivid} />
          </View>
        ) : activeLoans.length > 0 ? (
          activeLoans.map((loan) => (
            <GlassCard key={loan.reservation_id} style={styles.loanCard} padding={12}>
              <View style={styles.loanHeader}>
                <View style={styles.loanInfo}>
                  <Text style={[styles.loanTitle, { color: theme.colors.textPrimary }]}>
                    {loan.items?.[0]?.equipment?.model?.model_name || `Reservation #${loan.reservation_id}`}
                  </Text>
                  <Text style={[styles.loanTag, { color: theme.colors.textMuted }]}>
                    Tag: {loan.items?.[0]?.equipment?.asset_tag || `RES-${loan.reservation_id}`}
                  </Text>
                </View>
                <Badge label="Active Loan" variant="available" size="sm" />
              </View>

              <View style={[styles.loanMeta, { borderTopColor: theme.colors.borderSubtle }]}>
                <Ionicons name="calendar-outline" size={13} color={theme.colors.textMuted} />
                <Text style={[styles.loanMetaText, { color: theme.colors.textSecondary }]}>
                  Due: {new Date(loan.requested_end_datetime).toLocaleDateString(undefined, {
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
          <GlassCard style={styles.emptyBox} padding={20}>
            <Ionicons name="checkmark-done-circle-outline" size={36} color="#34D399" style={styles.emptyIcon} />
            <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>All Clear</Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              You currently have no equipment out on loan. Head to the catalog to reserve needed gear!
            </Text>
            <Button
              title="Explore Hardware Catalog"
              variant="primary"
              size="sm"
              style={{ marginTop: 12 }}
              onPress={() => navigation.navigate('CatalogTab')}
            />
          </GlassCard>
        )}

        {/* Depot Information Card */}
        <GlassCard style={styles.depotCard} padding={14}>
          <View style={styles.depotHeader}>
            <View
              style={[
                styles.depotIcon,
                {
                  backgroundColor: isDark ? 'rgba(90, 45, 92, 0.25)' : 'rgba(90, 45, 92, 0.12)',
                  borderColor: isDark ? 'rgba(90, 45, 92, 0.40)' : 'rgba(90, 45, 92, 0.25)',
                },
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={isDark ? theme.colors.brandLilacBase : theme.colors.brandPlumDeep}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.depotTitle, { color: theme.colors.textPrimary }]}>
                Campus Pickup Hours & Policy
              </Text>
              <Text style={[styles.depotHours, { color: theme.colors.textMuted }]}>
                Mon – Fri: 08:30 AM – 05:00 PM
              </Text>
            </View>
          </View>
          <Text style={[styles.depotDescription, { color: theme.colors.textSecondary }]}>
            Bring student ID to Science & Tech Complex Room 101. Standard loan durations are 48 hours for general media equipment.
          </Text>
        </GlassCard>
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
    paddingBottom: 40,
    gap: 16,
  },
  welcomeBanner: {},
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  greetingTitle: {
    fontSize: 24,
    fontFamily: 'Chirp-Heavy',
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  greetingSubtitle: {
    fontSize: 13,
    fontFamily: 'Chirp-Regular',
    marginTop: 4,
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  statsGrid: {
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Chirp-Bold',
    fontWeight: '700',
  },
  sectionCount: {
    fontSize: 11,
    fontFamily: 'Chirp-SemiBold',
    fontWeight: '600',
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loanCard: {
    marginBottom: 8,
  },
  loanHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  loanInfo: {
    flex: 1,
    marginRight: 8,
  },
  loanTitle: {
    fontSize: 14,
    fontFamily: 'Chirp-Bold',
    fontWeight: '700',
  },
  loanTag: {
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  loanMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  loanMetaText: {
    fontSize: 11,
    fontFamily: 'Chirp-Medium',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyIcon: {
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Chirp-Bold',
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 12,
    fontFamily: 'Chirp-Regular',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
    lineHeight: 18,
  },
  depotCard: {},
  depotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  depotIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  depotTitle: {
    fontSize: 13,
    fontFamily: 'Chirp-Bold',
    fontWeight: '700',
  },
  depotHours: {
    fontSize: 11,
    fontFamily: 'Chirp-Medium',
  },
  depotDescription: {
    fontSize: 11,
    fontFamily: 'Chirp-Regular',
    lineHeight: 17,
  },
});
