import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mobileReservationApi, Reservation } from '../api/reservations';
import { useTheme } from '../context/ThemeContext';
import { useMobileAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { AppHeader } from '../components/AppHeader';
import { SmoothReveal } from '../components/SmoothReveal';

const STATUS_FILTERS = ['All', 'Active', 'Pending', 'Approved', 'Completed'];

export const MyReservationsScreen = ({ navigation }: any) => {
  const { user } = useMobileAuth();
  const { theme, isDark } = useTheme();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const isStaffOrAdmin = user?.roles?.some((r: string) =>
    ['ADMIN', 'ATTENDANT', 'TECHNICIAN'].includes(r?.toUpperCase())
  );

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      const res = await mobileReservationApi.getAll();
      setReservations(res.data || []);
    } catch (err) {
      console.error('Failed to load reservations:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReservations();
  };

  const handleCancel = (reservationId: number) => {
    Alert.alert(
      'Cancel Loan Request',
      `Are you sure you want to cancel reservation #${reservationId}?`,
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Reservation',
          style: 'destructive',
          onPress: async () => {
            try {
              await mobileReservationApi.cancel(reservationId);
              setFeedback(`Reservation #${reservationId} cancelled.`);
              setTimeout(() => setFeedback(null), 3000);
              fetchReservations();
            } catch (err: any) {
              Alert.alert('Cancellation Error', err.message || 'Failed to cancel reservation');
            }
          },
        },
      ]
    );
  };

  const handleApprove = async (id: number) => {
    try {
      await mobileReservationApi.approve(id, 'Approved by depot attendant.');
      setFeedback(`Reservation #${id} approved.`);
      setTimeout(() => setFeedback(null), 3000);
      fetchReservations();
    } catch (err: any) {
      Alert.alert('Approval Error', err.message || 'Failed to approve');
    }
  };

  const handleReject = async (id: number) => {
    Alert.prompt
      ? Alert.prompt(
          'Reject Reservation',
          'Enter reason for rejection:',
          async (reason) => {
            try {
              await mobileReservationApi.reject(id, reason || 'Equipment unavailable');
              setFeedback(`Reservation #${id} rejected.`);
              setTimeout(() => setFeedback(null), 3000);
              fetchReservations();
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          }
        )
      : (async () => {
          try {
            await mobileReservationApi.reject(id, 'Equipment unavailable');
            setFeedback(`Reservation #${id} rejected.`);
            setTimeout(() => setFeedback(null), 3000);
            fetchReservations();
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        })();
  };

  const handleHandover = async (id: number) => {
    try {
      await mobileReservationApi.checkin(id, 'Physical equipment handed over at desk.');
      setFeedback(`Reservation #${id} marked as checked out (Active Loan).`);
      setTimeout(() => setFeedback(null), 3000);
      fetchReservations();
    } catch (err: any) {
      Alert.alert('Handover Error', err.message || 'Failed to handover');
    }
  };

  const handleReturn = async (id: number) => {
    try {
      await mobileReservationApi.checkout(id, 'All accessories intact and operational.', 'Equipment returned.');
      setFeedback(`Reservation #${id} marked as returned (Completed).`);
      setTimeout(() => setFeedback(null), 3000);
      fetchReservations();
    } catch (err: any) {
      Alert.alert('Return Error', err.message || 'Failed to process return');
    }
  };

  const filteredList = reservations.filter((item) => {
    if (selectedFilter === 'All') return true;
    const statusName = item.status?.status_name?.toLowerCase() || '';
    return statusName === selectedFilter.toLowerCase();
  });

  const renderItem = ({ item, index }: { item: Reservation; index: number }) => {
    const equip = item.items?.[0]?.equipment;
    const modelName = equip?.model?.model_name || `Reservation #${item.reservation_id}`;
    const status = item.status?.status_name || 'pending';
    const isPending = status === 'pending';
    const isApproved = status === 'approved';
    const isActive = status === 'active';

    const getBadgeVariant = (st: string) => {
      switch (st) {
        case 'active':
        case 'approved':
          return 'available';
        case 'pending':
          return 'pending';
        case 'completed':
          return 'completed';
        case 'rejected':
        case 'cancelled':
          return 'rejected';
        default:
          return 'brand';
      }
    };

    return (
      <SmoothReveal delay={Math.min(index, 7) * 45} distance={10}>
        <GlassCard style={styles.card} padding={16}>
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.bookingIdPill,
                {
                  backgroundColor: isDark ? 'rgba(230, 212, 230, 0.08)' : 'rgba(9, 56, 31, 0.06)',
                  borderColor: theme.colors.borderSubtle,
                },
              ]}
            >
              <Text
                style={[
                  styles.bookingIdText,
                  { color: isDark ? theme.colors.brandLilacBase : theme.colors.brandForestMid },
                ]}
              >
                #{item.reservation_id}
              </Text>
            </View>
            <Badge label={status} variant={getBadgeVariant(status)} size="sm" />
          </View>

          <Text style={[styles.equipmentTitle, { color: theme.colors.textPrimary }]}>
            {modelName}
          </Text>
          <Text style={[styles.assetTag, { color: theme.colors.textMuted }]}>
            Tag: {equip?.asset_tag || `RES-${item.reservation_id}`}
          </Text>

          <View style={[styles.dateBlock, { borderTopColor: theme.colors.borderSubtle }]}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.textMuted} />
            <Text style={[styles.dateValue, { color: theme.colors.textSecondary }]}>
              {item.requested_start_datetime
                ? new Date(item.requested_start_datetime).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })
                : 'N/A'}{' '}
              –{' '}
              {item.requested_end_datetime
                ? new Date(item.requested_end_datetime).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })
                : 'N/A'}
            </Text>
          </View>

          {item.purpose_details ? (
            <View
              style={[
                styles.purposeBox,
                {
                  backgroundColor: isDark ? 'rgba(9, 56, 31, 0.4)' : 'rgba(9, 56, 31, 0.06)',
                  borderColor: theme.colors.borderSubtle,
                },
              ]}
            >
              <Text style={[styles.purposeText, { color: theme.colors.textMuted }]} numberOfLines={2}>
                Purpose: {item.purpose_details}
              </Text>
            </View>
          ) : null}

          {/* Action Row */}
          <View style={styles.actionRow}>
            {isStaffOrAdmin ? (
              <>
                {isPending && (
                  <>
                    <Button
                      title="Approve"
                      variant="primary"
                      size="sm"
                      onPress={() => handleApprove(item.reservation_id)}
                      style={{ flex: 1 }}
                    />
                    <Button
                      title="Reject"
                      variant="danger"
                      size="sm"
                      onPress={() => handleReject(item.reservation_id)}
                      style={{ flex: 1 }}
                    />
                  </>
                )}
                {isApproved && (
                  <Button
                    title="Hand Over Equipment"
                    variant="primary"
                    size="sm"
                    icon={<Ionicons name="arrow-forward-circle-outline" size={14} color="#FFF" />}
                    onPress={() => handleHandover(item.reservation_id)}
                    style={{ flex: 1 }}
                  />
                )}
                {isActive && (
                  <Button
                    title="Inspect & Check-in Return"
                    variant="secondary"
                    size="sm"
                    icon={<Ionicons name="checkbox-outline" size={14} color={theme.colors.textPrimary} />}
                    onPress={() => handleReturn(item.reservation_id)}
                    style={{ flex: 1 }}
                  />
                )}
              </>
            ) : (
              isPending && (
                <Button
                  title="Cancel Request"
                  variant="danger"
                  size="sm"
                  icon={<Ionicons name="close-circle-outline" size={14} color={isDark ? '#FB7185' : '#be123c'} />}
                  onPress={() => handleCancel(item.reservation_id)}
                  style={{ flex: 1 }}
                />
              )
            )}
          </View>
        </GlassCard>
      </SmoothReveal>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.canvasBg }]}>
      <AppHeader title={isStaffOrAdmin ? 'Depot Reservations Queue' : 'My Reservations'} />

      {feedback && (
        <View style={[styles.toast, { backgroundColor: 'rgba(0, 128, 128, 0.15)', borderColor: 'rgba(0, 128, 128, 0.35)' }]}>
          <Ionicons name="checkmark-circle" size={16} color="#2DD4BF" />
          <Text style={[styles.toastText, { color: '#2DD4BF' }]}>{feedback}</Text>
        </View>
      )}

      {/* Filter Tabs */}
      <View
        style={[
          styles.filterSection,
          {
            backgroundColor: theme.colors.canvasBg,
            borderBottomColor: theme.colors.borderSubtle,
          },
        ]}
      >
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_FILTERS}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const isSelected = selectedFilter === item;
            return (
              <Pressable
                onPress={() => setSelectedFilter(item)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected
                      ? isDark
                        ? theme.colors.brandTealBase
                        : theme.colors.brandForestMid
                      : theme.colors.surfaceSecondary,
                    borderColor: isSelected ? theme.colors.brandTealBase : theme.colors.borderSubtle,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: isSelected ? '#FFFFFF' : theme.colors.textMuted,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* List / Content */}
      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={isDark ? '#2DD4BF' : '#008080'} />
        </View>
      ) : filteredList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={48} color={theme.colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
            No reservations found
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.textMuted }]}>
            {isStaffOrAdmin
              ? 'No bookings in the depot match this filter.'
              : 'You have no scheduled bookings in this category.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.reservation_id.toString()}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toast: {
    marginHorizontal: 16,
    marginVertical: 6,
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
  filterSection: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    borderRadius: 16,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingIdPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  bookingIdText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  equipmentTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  assetTag: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  dateBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1,
  },
  dateValue: {
    fontSize: 12,
  },
  purposeBox: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 2,
  },
  purposeText: {
    fontSize: 11,
    lineHeight: 15,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
