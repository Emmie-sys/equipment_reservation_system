import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mobileEquipmentApi, Equipment } from '../api/equipment';
import { useTheme } from '../context/ThemeContext';
import { GlassCard } from '../components/GlassCard';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { AppHeader } from '../components/AppHeader';

const CATEGORIES = ['All', 'Computing', 'Audiovisual', 'Photography', 'Laboratory'];

export const EquipmentCatalogScreen = ({ navigation }: any) => {
  const { theme, isDark } = useTheme();
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCatalog = async () => {
    try {
      const params: Record<string, string> = {};
      if (search.trim()) params.search = search.trim();
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

  const filteredEquipment = equipmentList.filter((item) => {
    if (selectedCategory === 'All') return true;
    const catName = item.model?.category?.category_name || '';
    return catName.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const renderItem = ({ item }: { item: Equipment }) => {
    const isAvailable = item.status?.status_name === 'available';
    const location = item.room
      ? `${item.room.building?.building_name || 'Complex'} • ${item.room.room_code}`
      : 'STC-101 Central Depot';

    return (
      <GlassCard style={styles.card} padding={16}>
        <View style={styles.cardTop}>
          <View
            style={[
              styles.tagWrapper,
              {
                backgroundColor: isDark ? 'rgba(230, 212, 230, 0.08)' : 'rgba(9, 56, 31, 0.06)',
                borderColor: theme.colors.borderSubtle,
              },
            ]}
          >
            <Text
              style={[
                styles.assetTag,
                { color: isDark ? theme.colors.brandLilacBase : theme.colors.brandForestMid },
              ]}
            >
              {item.asset_tag}
            </Text>
          </View>
          <Badge
            label={item.status?.status_name || (isAvailable ? 'Available' : 'In Use')}
            variant={isAvailable ? 'available' : 'active'}
            size="sm"
          />
        </View>

        <Text style={[styles.modelName, { color: theme.colors.textPrimary }]}>
          {item.model?.model_name || 'Equipment Instrument'}
        </Text>
        <Text style={[styles.manufacturer, { color: theme.colors.textMuted }]}>
          {item.model?.manufacturer || 'Institutional Asset'}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={theme.colors.textMuted} />
          <Text style={[styles.locationText, { color: theme.colors.textSecondary }]}>{location}</Text>
        </View>

        {item.condition_notes ? (
          <View
            style={[
              styles.conditionBox,
              {
                backgroundColor: isDark ? 'rgba(9, 56, 31, 0.4)' : 'rgba(9, 56, 31, 0.06)',
                borderColor: theme.colors.borderSubtle,
              },
            ]}
          >
            <Text style={[styles.conditionText, { color: theme.colors.textMuted }]}>
              Note: {item.condition_notes}
            </Text>
          </View>
        ) : null}

        <View style={styles.cardActions}>
          <Button
            title={item.is_bookable ? 'Reserve Equipment' : 'Non-Circulating'}
            variant={item.is_bookable ? 'primary' : 'secondary'}
            size="sm"
            disabled={!item.is_bookable}
            icon={item.is_bookable ? <Ionicons name="calendar" size={14} color={isDark ? theme.colors.brandForestDark : '#FAF8FB'} /> : undefined}
            onPress={() => navigation.navigate('NewReservation', { equipment: item })}
          />
        </View>
      </GlassCard>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.canvasBg }]}>
      <AppHeader title="Equipment Catalog" />

      {/* Search Header */}
      <View
        style={[
          styles.searchSection,
          {
            backgroundColor: theme.colors.canvasBg,
            borderBottomColor: theme.colors.borderSubtle,
          },
        ]}
      >
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: theme.colors.surfaceInput,
              borderColor: theme.colors.borderInput,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={theme.colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search model, serial, manufacturer..."
            placeholderTextColor={theme.colors.textMuted}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
          />
          {search ? (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        {/* Category Filter Chips */}
        <View style={styles.categoriesRow}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            keyExtractor={(cat) => cat}
            contentContainerStyle={styles.categoriesContent}
            renderItem={({ item: cat }) => {
              const isActive = selectedCategory === cat;
              return (
                <Pressable
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: theme.colors.surfaceSecondary,
                      borderColor: theme.colors.borderSubtle,
                    },
                    isActive && {
                      backgroundColor: isDark ? 'rgba(27, 106, 65, 0.35)' : 'rgba(27, 106, 65, 0.14)',
                      borderColor: isDark ? '#34D399' : theme.colors.brandForestMid,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      { color: theme.colors.textSecondary },
                      isActive && {
                        color: isDark ? '#34D399' : '#155E38',
                        fontFamily: 'Chirp-Bold',
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.brandForestVivid} />
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>
            Fetching inventory catalog...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredEquipment}
          keyExtractor={(item) => item.equipment_id.toString()}
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
              <Ionicons name="search-outline" size={40} color={theme.colors.textMuted} style={{ marginBottom: 8 }} />
              <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>No Equipment Found</Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.textMuted }]}>
                No hardware matches your active filters. Try searching for a different term or clear filters.
              </Text>
              {search || selectedCategory !== 'All' ? (
                <Button
                  title="Reset Search"
                  variant="outline"
                  size="sm"
                  style={{ marginTop: 12 }}
                  onPress={() => {
                    setSearch('');
                    setSelectedCategory('All');
                  }}
                />
              ) : null}
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
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    gap: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Chirp-Medium',
    paddingVertical: 10,
  },
  categoriesRow: {
    paddingBottom: 4,
  },
  categoriesContent: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
  },
  categoryChipText: {
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
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagWrapper: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  assetTag: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  modelName: {
    fontSize: 15,
    fontFamily: 'Chirp-Bold',
    fontWeight: '700',
  },
  manufacturer: {
    fontSize: 11,
    fontFamily: 'Chirp-Regular',
    marginTop: 2,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 11,
    fontFamily: 'Chirp-Medium',
  },
  conditionBox: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 12,
  },
  conditionText: {
    fontSize: 11,
    fontFamily: 'Chirp-Regular',
    fontStyle: 'italic',
  },
  cardActions: {
    marginTop: 4,
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
