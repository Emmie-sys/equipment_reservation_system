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
import { GlassCard } from '../components/GlassCard';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { AppHeader } from '../components/AppHeader';
import { SmoothReveal } from '../components/SmoothReveal';

const STATUS_FILTERS = ['All', 'Active', 'Pending', 'Completed'];

export const MyReservationsScreen = ({ navigation }: any) => {
  const { theme, isDark } = useTheme();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReservations = async () => {
    try {
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
  }, []);

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
              fetchReservations();
            } catch (err: any) {
              Alert.alert('Cancellation Error', err.message || 'Failed to cancel reservation');
            }
          },
        },
      ]
    );
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

          {isPending ? (
            <View style={styles.actionRow}>
              <Button
                title="Cancel Request"
                variant="danger"
                size="sm"
                icon={<Ionicons name="close-circle-outline" size={14} color={isDark ? '#FB7185' : '#be123c'} />}
                onPress={() => handleCancel(item.reservation_id)}
              />
            </View>
          ) : null}
        </GlassCard>
      </SmoothReveal>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.canvasBg }]}>
      <AppHeader title="My Bookings" />

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
          contentContainerStyle={styles.filterContent}
          renderItem={({ item }) => {
            const isActive = selectedFilter === item;
            return (
              <Pressable
                onPress={() => setSelectedFilter(item)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: theme.colors.surfaceSecondary,
                    borderColor: theme.colors.borderSubtle,
                  },
                  isActive && {
                    backgroundColor: isDark ? 'rgba(90, 45, 92, 0.35)' : 'rgba(90, 45, 92, 0.12)',
                    borderColor: isDark ? theme.colors.brandLilacBase : theme.colors.brandPlumDeep,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: theme.colors.textSecondary },
                    isActive && {
                      color: isDark ? theme.colors.brandLilacBase : theme.colors.brandPlumDeep,
                      fontFamily: 'Chirp-Bold',
                      fontWeight: '700',
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

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.brandForestVivid} />
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>
            Fetching your reservation records...
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
              tintColor={isDark ? theme.colors.brandLilacBase : theme.colors.brandForestDark}
            />
          }
          ListEmptyComponent={
            <GlassCard style={styles.emptyContainer} padding={20}>
              <Ionicons name="calendar-outline" size={38} color={theme.colors.textMuted} style={{ marginBottom: 8 }} />
              <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>No Reservations</Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.textMuted }]}>
                {selectedFilter === 'All'
                  ? "You haven't requested any equipment yet. Explore the campus catalog to book gear."
                  : `No ${selectedFilter.toLowerCase()} reservations on record.`}
              </Text>
              <Button
                title="Browse Equipment Catalog"
                variant="primary"
                size="sm"
                style={{ marginTop: 14 }}
                onPress={() => navigation.navigate('CatalogTab')}
              />
            </GlassCard>
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
  filterSection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  filterContent: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 11,
    fontFamily: 'Chirp-SemiBold',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    fontSize: 13,
    fontFamily: 'Chirp-Regular',
    marginTop: 12,
  },
  card: {
    marginBottom: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    fontFamily: 'Chirp-Bold',
    fontWeight: '700',
  },
  assetTag: {
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 2,
    marginBottom: 10,
  },
  dateBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  dateValue: {
    fontSize: 11,
    fontFamily: 'Chirp-SemiBold',
    fontWeight: '600',
  },
  purposeBox: {
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
  },
  purposeText: {
    fontSize: 11,
    fontFamily: 'Chirp-Regular',
    fontStyle: 'italic',
  },
  actionRow: {
    marginTop: 12,
    alignItems: 'flex-start',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: 'Chirp-Bold',
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 12,
    fontFamily: 'Chirp-Regular',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});
