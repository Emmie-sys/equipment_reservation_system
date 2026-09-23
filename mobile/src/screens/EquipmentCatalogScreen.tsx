import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { mobileEquipmentApi, Equipment } from '../api/equipment';

export const EquipmentCatalogScreen = ({ navigation }: any) => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCatalog = async () => {
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const res = await mobileEquipmentApi.getAll(params);
      setEquipmentList(res.data || []);
    } catch (err) {
      console.error('Failed to load mobile catalog:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [search]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCatalog();
  };

  const renderItem = ({ item }: { item: Equipment }) => {
    const isAvailable = item.status?.status_name === 'available';
    const location = item.room 
      ? `${item.room.building?.building_name || 'Building'} • Room ${item.room.room_code}`
      : 'Main Storage Depot';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.assetTag}>{item.asset_tag}</Text>
          <View style={[styles.badge, isAvailable ? styles.badgeSuccess : styles.badgeMuted]}>
            <Text style={[styles.badgeText, isAvailable ? styles.badgeTextSuccess : styles.badgeTextMuted]}>
              {item.status?.status_name?.toUpperCase() || 'UNKNOWN'}
            </Text>
          </View>
        </View>

        <Text style={styles.modelName}>{item.model?.model_name || 'Institutional Equipment'}</Text>
        <Text style={styles.manufacturer}>{item.model?.manufacturer || 'Department Asset'}</Text>

        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>📍 {location}</Text>
        </View>

        {item.condition_notes ? (
          <Text style={styles.conditionNotes}>"{item.condition_notes}"</Text>
        ) : null}

        <TouchableOpacity 
          style={[styles.reserveBtn, !item.is_bookable && styles.reserveBtnDisabled]}
          disabled={!item.is_bookable}
          onPress={() => navigation.navigate('NewReservation', { equipment: item })}
        >
          <Text style={styles.reserveBtnText}>
            {item.is_bookable ? 'Request Reservation' : 'Internal Use Only'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search model, asset tag, manufacturer..."
          placeholderTextColor="#64748b"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading equipment inventory...</Text>
        </View>
      ) : (
        <FlatList
          data={equipmentList}
          keyExtractor={(item) => item.equipment_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Equipment Found</Text>
              <Text style={styles.emptySubtitle}>Adjust your search query</Text>
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
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  searchInput: {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  listContent: {
    padding: 16,
    gap: 14,
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
    marginBottom: 8,
  },
  assetTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#818cf8',
    fontFamily: 'monospace',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  badgeMuted: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeTextSuccess: {
    color: '#22c55e',
  },
  badgeTextMuted: {
    color: '#94a3b8',
  },
  modelName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 2,
  },
  manufacturer: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 10,
  },
  locationContainer: {
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#cbd5e1',
  },
  conditionNotes: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#94a3b8',
    marginBottom: 12,
  },
  reserveBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  reserveBtnDisabled: {
    backgroundColor: '#334155',
  },
  reserveBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
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
