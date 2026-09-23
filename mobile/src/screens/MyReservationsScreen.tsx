import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  RefreshControl, 
  Alert 
} from 'react-native';
import { mobileReservationApi, Reservation } from '../api/reservations';
import { useMobileAuth } from '../context/AuthContext';

export const MyReservationsScreen = () => {
  const { user, logout } = useMobileAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
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
      'Cancel Reservation',
      'Are you sure you want to cancel this equipment booking?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              await mobileReservationApi.cancel(reservationId);
              fetchReservations();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to cancel reservation');
            }
          }
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Reservation }) => {
    const equip = item.items?.[0]?.equipment;
    const modelName = equip?.model?.model_name || 'Standard Unit';
    const status = item.status?.status_name || 'pending';
    const isPending = status === 'pending';

    const getStatusStyle = () => {
      switch (status) {
        case 'approved': return styles.statusApproved;
        case 'pending': return styles.statusPending;
        case 'rejected': return styles.statusRejected;
        case 'cancelled': return styles.statusCancelled;
        default: return styles.statusPending;
      }
    };

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.bookingId}>Booking #{item.reservation_id}</Text>
          <View style={[styles.statusBadge, getStatusStyle()]}>
            <Text style={styles.statusText}>{status.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.equipmentTitle}>{modelName}</Text>
        <Text style={styles.assetTag}>Tag: {equip?.asset_tag || 'Unassigned'}</Text>

        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>RESERVATION WINDOW:</Text>
          <Text style={styles.dateValue}>
            {item.requested_start_datetime ? new Date(item.requested_start_datetime).toLocaleDateString() : 'N/A'} — {item.requested_end_datetime ? new Date(item.requested_end_datetime).toLocaleDateString() : 'N/A'}
          </Text>
        </View>

        {isPending ? (
          <TouchableOpacity 
            style={styles.cancelBtn} 
            onPress={() => handleCancel(item.reservation_id)}
          >
            <Text style={styles.cancelBtnText}>Cancel Booking</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.userBanner}>
        <View>
          <Text style={styles.userName}>{user?.name || user?.email || 'Campus User'}</Text>
          <Text style={styles.userSub}>Institutional Member</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading your reservations...</Text>
        </View>
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => item.reservation_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Reservations</Text>
              <Text style={styles.emptySubtitle}>You haven't booked any equipment yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  userBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  userName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userSub: {
    fontSize: 12,
    color: '#94a3b8',
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 6,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 12,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bookingId: {
    fontSize: 13,
    fontWeight: '700',
    color: '#818cf8',
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  statusApproved: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  statusPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  statusRejected: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  statusCancelled: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  equipmentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
  },
  assetTag: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
    marginBottom: 10,
  },
  dateBlock: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 12,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  cancelBtnText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
  },
});
