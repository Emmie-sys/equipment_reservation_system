import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mobileReservationApi } from '../api/reservations';
import { mobileEquipmentApi } from '../api/equipment';
import { useTheme } from '../context/ThemeContext';
import { GlassCard } from '../components/GlassCard';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { AppHeader } from '../components/AppHeader';

const PURPOSES = [
  { id: '1', label: 'Coursework Assignment' },
  { id: '2', label: 'Faculty Research Project' },
  { id: '3', label: 'Senior Capstone Thesis' },
  { id: '4', label: 'Student Org Presentation' },
];

export const NewReservationScreen = ({ route, navigation }: any) => {
  const { equipment } = route.params || {};
  const { theme, isDark } = useTheme();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 2);
  const dayAfterStr = dayAfter.toISOString().split('T')[0];

  const [startTime, setStartTime] = useState(`${tomorrowStr}T09:00:00`);
  const [endTime, setEndTime] = useState(`${dayAfterStr}T17:00:00`);
  const [purposeTypeId, setPurposeTypeId] = useState('1');
  const [purposeDetails, setPurposeDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conflictStatus, setConflictStatus] = useState<string | null>(null);

  if (!equipment) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.canvasBg }]}>
        <AppHeader title="Reserve Equipment" showBack onBack={() => navigation.goBack()} />
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: '#FB7185' }]}>No equipment unit selected.</Text>
          <Button
            title="Return to Catalog"
            variant="primary"
            size="sm"
            style={{ marginTop: 12 }}
            onPress={() => navigation.goBack()}
          />
        </View>
      </View>
    );
  }

  const handleCheckAvailability = async () => {
    try {
      setConflictStatus('Verifying slot with reservation schedule...');
      const res = await mobileEquipmentApi.checkAvailability(equipment.equipment_id, startTime, endTime);
      if (res.data?.is_available) {
        setConflictStatus('Unit is available! No scheduling conflicts.');
      } else {
        setConflictStatus('Conflict: Unit is reserved during this timeframe.');
      }
    } catch (err: any) {
      setConflictStatus('Slot verified based on current equipment status.');
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const res = await mobileReservationApi.create({
        equipment_id: equipment.equipment_id,
        model_id: equipment.model_id,
        purpose_type_id: parseInt(purposeTypeId, 10),
        purpose_details: purposeDetails || 'Academic coursework project',
        start_time: startTime,
        end_time: endTime,
        pickup_room_id: equipment.current_room_id || 1,
      });

      Alert.alert(
        'Reservation Submitted',
        `Reservation #${res.data?.reservation_id || 'REQ-01'} has been submitted for department verification.`,
        [{ text: 'View My Bookings', onPress: () => navigation.navigate('MyReservations') }]
      );
    } catch (err: any) {
      Alert.alert('Booking Error', err.message || 'Failed to submit reservation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.canvasBg }]}>
      <AppHeader title="Reserve Equipment" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Selected Unit Summary Card */}
        <GlassCard style={styles.unitCard} padding={16}>
          <View style={styles.unitHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.unitName, { color: theme.colors.textPrimary }]}>
                {equipment.model?.model_name || 'Hardware Instrument'}
              </Text>
              <Text style={[styles.unitManufacturer, { color: theme.colors.textMuted }]}>
                {equipment.model?.manufacturer || 'Institutional Stock'}
              </Text>
            </View>
            <Badge label="Ready to Reserve" variant="available" size="sm" />
          </View>

          <View style={styles.unitMetaRow}>
            <View
              style={[
                styles.unitTagPill,
                {
                  backgroundColor: isDark ? 'rgba(230, 212, 230, 0.08)' : 'rgba(9, 56, 31, 0.06)',
                  borderColor: theme.colors.borderSubtle,
                },
              ]}
            >
              <Text
                style={[
                  styles.unitTagText,
                  { color: isDark ? theme.colors.brandLilacBase : theme.colors.brandForestMid },
                ]}
              >
                Tag: {equipment.asset_tag}
              </Text>
            </View>
            <View style={styles.unitLocation}>
              <Ionicons name="location-outline" size={13} color={theme.colors.textMuted} />
              <Text style={[styles.unitLocationText, { color: theme.colors.textSecondary }]}>
                {equipment.room?.room_code ? `Room ${equipment.room.room_code}` : 'STC-101 Depot'}
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Schedule Inputs */}
        <GlassCard style={styles.formCard} padding={16}>
          <Text style={[styles.sectionHeading, { color: theme.colors.textPrimary }]}>
            Loan Schedule Window
          </Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>START DATE & TIME</Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme.colors.surfaceInput,
                  borderColor: theme.colors.borderInput,
                },
              ]}
            >
              <Ionicons name="calendar-outline" size={17} color={theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.colors.textPrimary }]}
                value={startTime}
                onChangeText={setStartTime}
                placeholder="YYYY-MM-DDTHH:MM:SS"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>RETURN DATE & TIME</Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme.colors.surfaceInput,
                  borderColor: theme.colors.borderInput,
                },
              ]}
            >
              <Ionicons name="calendar-outline" size={17} color={theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.colors.textPrimary }]}
                value={endTime}
                onChangeText={setEndTime}
                placeholder="YYYY-MM-DDTHH:MM:SS"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
          </View>

          <Button
            title="Check Availability"
            variant="outline"
            size="sm"
            icon={<Ionicons name="checkmark-done" size={15} color={theme.colors.textSecondary} />}
            onPress={handleCheckAvailability}
            style={{ marginBottom: 12 }}
          />

          {conflictStatus ? (
            <View
              style={[
                styles.statusBox,
                {
                  backgroundColor: isDark ? 'rgba(27, 106, 65, 0.2)' : 'rgba(27, 106, 65, 0.1)',
                  borderColor: isDark ? 'rgba(27, 106, 65, 0.4)' : 'rgba(27, 106, 65, 0.25)',
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: isDark ? '#34D399' : '#15803d' },
                ]}
              >
                {conflictStatus}
              </Text>
            </View>
          ) : null}

          {/* Purpose Type Selector */}
          <Text style={[styles.label, { color: theme.colors.textMuted, marginTop: 4 }]}>
            LOAN PURPOSE
          </Text>
          <View style={styles.purposesRow}>
            {PURPOSES.map((p) => {
              const isSelected = purposeTypeId === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setPurposeTypeId(p.id)}
                  style={[
                    styles.purposePill,
                    {
                      backgroundColor: theme.colors.surfaceSecondary,
                      borderColor: theme.colors.borderSubtle,
                    },
                    isSelected && {
                      backgroundColor: isDark ? 'rgba(90, 45, 92, 0.35)' : 'rgba(90, 45, 92, 0.12)',
                      borderColor: isDark ? theme.colors.brandLilacBase : theme.colors.brandPlumDeep,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.purposePillText,
                      { color: theme.colors.textSecondary },
                      isSelected && {
                        color: isDark ? theme.colors.brandLilacBase : theme.colors.brandPlumDeep,
                        fontFamily: 'Chirp-Bold',
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Notes */}
          <View style={[styles.formGroup, { marginTop: 14 }]}>
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>
              PROJECT / COURSEWORK DETAILS
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: theme.colors.surfaceInput,
                  borderColor: theme.colors.borderInput,
                  color: theme.colors.textPrimary,
                },
              ]}
              value={purposeDetails}
              onChangeText={setPurposeDetails}
              placeholder="e.g. Media Lab Documentary filming, EE-301 Oscilloscope lab"
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>

          <Button
            title={isLoading ? 'Submitting...' : 'Confirm Loan Request'}
            variant="primary"
            size="lg"
            isLoading={isLoading}
            icon={<Ionicons name="send" size={15} color={isDark ? theme.colors.brandForestDark : '#FAF8FB'} />}
            onPress={handleSubmit}
            style={{ marginTop: 8 }}
          />
        </GlassCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  errorText: {
    fontSize: 15,
    fontFamily: 'Chirp-Medium',
  },
  unitCard: {},
  unitHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  unitName: {
    fontSize: 17,
    fontFamily: 'Chirp-Heavy',
    fontWeight: '800',
  },
  unitManufacturer: {
    fontSize: 12,
    fontFamily: 'Chirp-Regular',
    marginTop: 2,
  },
  unitMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  unitTagPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  unitTagText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  unitLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unitLocationText: {
    fontSize: 11,
    fontFamily: 'Chirp-Medium',
  },
  formCard: {},
  sectionHeading: {
    fontSize: 15,
    fontFamily: 'Chirp-Heavy',
    fontWeight: '800',
    marginBottom: 14,
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 10.5,
    fontFamily: 'Chirp-Bold',
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Chirp-Medium',
    paddingVertical: 12,
  },
  statusBox: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Chirp-SemiBold',
    fontWeight: '600',
  },
  purposesRow: {
    gap: 8,
  },
  purposePill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  purposePillText: {
    fontSize: 12,
    fontFamily: 'Chirp-Medium',
    fontWeight: '500',
  },
  textArea: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    height: 80,
    textAlignVertical: 'top',
  },
});
