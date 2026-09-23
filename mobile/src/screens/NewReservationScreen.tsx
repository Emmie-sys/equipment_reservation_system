import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { mobileReservationApi } from '../api/reservations';
import { mobileEquipmentApi } from '../api/equipment';

export const NewReservationScreen = ({ route, navigation }: any) => {
  const { equipment } = route.params || {};

  // Form states
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [startTime, setStartTime] = useState(`${tomorrowStr}T09:00:00`);
  const [endTime, setEndTime] = useState(`${tomorrowStr}T17:00:00`);
  const [purposeTypeId, setPurposeTypeId] = useState('1'); // Academic
  const [purposeDetails, setPurposeDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conflictStatus, setConflictStatus] = useState<string | null>(null);

  if (!equipment) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No equipment unit selected.</Text>
      </View>
    );
  }

  const handleCheckAvailability = async () => {
    try {
      setConflictStatus('Checking schedule conflict engine...');
      const res = await mobileEquipmentApi.checkAvailability(equipment.equipment_id, startTime, endTime);
      if (res.data.is_available) {
        setConflictStatus('✅ Unit is available for this window!');
      } else {
        setConflictStatus('❌ CONFLICT: Unit is already booked during these hours.');
      }
    } catch (err: any) {
      setConflictStatus('⚠️ Failed to check availability.');
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const res = await mobileReservationApi.create({
        equipment_id: equipment.equipment_id,
        model_id: equipment.model_id,
        purpose_type_id: parseInt(purposeTypeId, 10),
        purpose_details: purposeDetails,
        start_time: startTime,
        end_time: endTime,
        pickup_room_id: equipment.current_room_id,
      });

      Alert.alert(
        'Reservation Submitted',
        `Your reservation (#${res.data.reservation_id}) is now pending approval by department staff.`,
        [{ text: 'OK', onPress: () => navigation.navigate('MyReservations') }]
      );
    } catch (err: any) {
      Alert.alert('Booking Error', err.message || 'Failed to submit reservation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Book Equipment</Text>
        <Text style={styles.subtitle}>Institutional checkout request</Text>
      </View>

      <View style={styles.unitSummary}>
        <Text style={styles.unitName}>{equipment.model?.model_name || equipment.asset_tag}</Text>
        <Text style={styles.unitTag}>Tag: {equipment.asset_tag}</Text>
        <Text style={styles.unitLocation}>
          Depot: {equipment.room?.room_code || 'Main Institutional Depot'}
        </Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>START DATE & TIME (ISO FORMAT)</Text>
        <TextInput
          style={styles.input}
          value={startTime}
          onChangeText={setStartTime}
          placeholder="YYYY-MM-DDTHH:MM:SS"
          placeholderTextColor="#64748b"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>END DATE & TIME (ISO FORMAT)</Text>
        <TextInput
          style={styles.input}
          value={endTime}
          onChangeText={setEndTime}
          placeholder="YYYY-MM-DDTHH:MM:SS"
          placeholderTextColor="#64748b"
        />
      </View>

      <TouchableOpacity style={styles.checkBtn} onPress={handleCheckAvailability}>
        <Text style={styles.checkBtnText}>Verify Slot Availability</Text>
      </TouchableOpacity>

      {conflictStatus ? (
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>{conflictStatus}</Text>
        </View>
      ) : null}

      <View style={styles.formGroup}>
        <Text style={styles.label}>PURPOSE DETAILS</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={purposeDetails}
          onChangeText={setPurposeDetails}
          placeholder="Describe intended academic/research purpose..."
          placeholderTextColor="#64748b"
          multiline
          numberOfLines={3}
        />
      </View>

      <TouchableOpacity 
        style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]} 
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitBtnText}>Confirm Booking Request</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  unitSummary: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  unitName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  unitTag: {
    fontSize: 12,
    color: '#818cf8',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  unitLocation: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  checkBtn: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  checkBtnText: {
    color: '#818cf8',
    fontSize: 13,
    fontWeight: '600',
  },
  statusBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statusText: {
    fontSize: 13,
    color: '#cbd5e1',
  },
  submitBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
