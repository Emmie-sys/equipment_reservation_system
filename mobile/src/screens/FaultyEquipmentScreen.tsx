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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mobileEquipmentApi, Equipment } from '../api/equipment';
import { useTheme } from '../context/ThemeContext';
import { GlassCard } from '../components/GlassCard';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { AppHeader } from '../components/AppHeader';
import { SmoothReveal } from '../components/SmoothReveal';

export const FaultyEquipmentScreen = ({ navigation }: any) => {
  const { theme, isDark } = useTheme();
  const [faultyList, setFaultyList] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Status update modal state
  const [selectedUnit, setSelectedUnit] = useState<Equipment | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('available');
  const [conditionNotes, setConditionNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchFaulty = async () => {
    try {
      setIsLoading(true);
      const res = await mobileEquipmentApi.getFaulty();
      setFaultyList(res.data || []);
    } catch (err) {
      console.error('Failed to load faulty equipment:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFaulty();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFaulty();
  };

  const handleOpenStatusModal = (unit: Equipment) => {
    setSelectedUnit(unit);
    setNewStatus('available');
    setConditionNotes(unit.condition_notes || 'Inspected, serviced, and restored to operational service.');
    setModalVisible(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedUnit) return;
    try {
      setIsUpdating(true);
      await mobileEquipmentApi.updateStatus(selectedUnit.equipment_id, {
        status: newStatus,
        condition_notes: conditionNotes,
        is_bookable: newStatus === 'available',
      });
      setModalVisible(false);
      setSelectedUnit(null);
      setActionMessage(`Unit #${selectedUnit.equipment_id} updated to ${newStatus}.`);
      setTimeout(() => setActionMessage(null), 3500);
      fetchFaulty();
    } catch (err: any) {
      alert(err.message || 'Failed to update equipment status');
    } finally {
      setIsUpdating(false);
    }
  };

  const renderItem = ({ item, index }: { item: Equipment; index: number }) => {
    const statusText = typeof item.status === 'string' ? (item.status as string) : item.status?.status_name || 'Unavailable';

    return (
      <SmoothReveal delay={Math.min(index, 7) * 45} distance={10}>
        <GlassCard style={styles.card} padding={16}>
          <View style={styles.cardTop}>
            <View
              style={[
                styles.tagWrapper,
                {
                  backgroundColor: 'rgba(242, 100, 25, 0.12)',
                  borderColor: 'rgba(242, 100, 25, 0.3)',
                },
              ]}
            >
              <Text style={[styles.assetTag, { color: '#F26419' }]}>
                {item.asset_tag}
              </Text>
            </View>
            <Badge
              label={statusText}
              variant="rejected"
              size="sm"
            />
          </View>

          <Text style={[styles.modelName, { color: theme.colors.textPrimary }]}>
            {item.model?.model_name || (item as any).model_name || 'Hardware Unit'}
          </Text>
          <Text style={[styles.manufacturer, { color: theme.colors.textMuted }]}>
            {item.model?.manufacturer || (item as any).manufacturer || 'Depot Inventory'} • {item.room?.room_code || (item as any).room_code || 'Depot'}
          </Text>

          {item.condition_notes ? (
            <View style={[styles.notesBox, { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.borderSubtle }]}>
              <Ionicons name="warning-outline" size={14} color="#F26419" style={{ marginTop: 2 }} />
              <Text style={[styles.notesText, { color: theme.colors.textSecondary }]}>
                {item.condition_notes}
              </Text>
            </View>
          ) : null}

          <View style={styles.actionRow}>
            <Button
              title="Resolve / Change Status"
              onPress={() => handleOpenStatusModal(item)}
              variant="outline"
              size="sm"
              icon={<Ionicons name="build-outline" size={14} color={isDark ? '#2DD4BF' : '#008080'} />}
              style={{ flex: 1 }}
            />
          </View>
        </GlassCard>
      </SmoothReveal>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.canvasBg }]}>
      <AppHeader />

      <View style={styles.headerBanner}>
        <View style={styles.headerTitleRow}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(242, 100, 25, 0.12)' }]}>
            <Ionicons name="warning" size={18} color="#F26419" />
          </View>
          <View>
            <Text style={[styles.bannerTitle, { color: theme.colors.textPrimary }]}>
              Faulty & Unavailable Fleet
            </Text>
            <Text style={[styles.bannerSubtitle, { color: theme.colors.textMuted }]}>
              Equipment requiring repair, technician servicing, or decommission
            </Text>
          </View>
        </View>
      </View>

      {actionMessage && (
        <View style={[styles.toast, { backgroundColor: 'rgba(0, 128, 128, 0.15)', borderColor: 'rgba(0, 128, 128, 0.35)' }]}>
          <Ionicons name="checkmark-circle" size={16} color="#2DD4BF" />
          <Text style={[styles.toastText, { color: '#2DD4BF' }]}>{actionMessage}</Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={isDark ? '#2DD4BF' : '#008080'} />
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>
            Scanning depot equipment status...
          </Text>
        </View>
      ) : faultyList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconCircle, { backgroundColor: 'rgba(34, 197, 94, 0.12)' }]}>
            <Ionicons name="shield-checkmark" size={32} color="#22c55e" />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
            All Systems Operational
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.textMuted }]}>
            No equipment units are currently tagged as faulty, damaged, or undergoing maintenance.
          </Text>
        </View>
      ) : (
        <FlatList
          data={faultyList}
          keyExtractor={(item) => item.equipment_id.toString()}
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

      {/* Status Update Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.borderMedium }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                Update Equipment Status
              </Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} color={theme.colors.textMuted} />
              </Pressable>
            </View>

            <Text style={[styles.modalUnitTag, { color: isDark ? '#2DD4BF' : '#008080' }]}>
              Unit: {selectedUnit?.asset_tag}
            </Text>

            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
              New Status:
            </Text>
            <View style={styles.statusButtonsRow}>
              {[
                { label: 'Available', value: 'available' },
                { label: 'Maintenance', value: 'maintenance' },
                { label: 'Faulty', value: 'faulty' },
                { label: 'Decommissioned', value: 'decommissioned' },
              ].map((st) => (
                <Pressable
                  key={st.value}
                  onPress={() => setNewStatus(st.value)}
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: newStatus === st.value
                        ? (isDark ? '#008080' : '#006666')
                        : theme.colors.surfaceSecondary,
                      borderColor: newStatus === st.value ? '#2DD4BF' : theme.colors.borderSubtle,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      { color: newStatus === st.value ? '#FFFFFF' : theme.colors.textMuted },
                    ]}
                  >
                    {st.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary, marginTop: 12 }]}>
              Technician Condition Notes:
            </Text>
            <TextInput
              style={[
                styles.notesInput,
                {
                  backgroundColor: theme.colors.surfaceInput,
                  borderColor: theme.colors.borderInput,
                  color: theme.colors.textPrimary,
                },
              ]}
              multiline
              numberOfLines={3}
              value={conditionNotes}
              onChangeText={setConditionNotes}
              placeholder="Detail inspection outcome, repairs made, or replacement parts..."
              placeholderTextColor={theme.colors.textMuted}
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title={isUpdating ? 'Saving...' : 'Apply Status'}
                variant="primary"
                onPress={handleUpdateStatus}
                disabled={isUpdating}
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
  headerBanner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  bannerSubtitle: {
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
  listContent: {
    padding: 16,
    paddingTop: 4,
    gap: 12,
  },
  card: {
    borderRadius: 16,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagWrapper: {
    paddingHorizontal: 8,
    paddingVertical: 3,
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
    fontWeight: '700',
    marginBottom: 2,
  },
  manufacturer: {
    fontSize: 12,
    marginBottom: 8,
  },
  notesBox: {
    flexDirection: 'row',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  notesText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
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
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalUnitTag: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 14,
    fontFamily: 'monospace',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
});
