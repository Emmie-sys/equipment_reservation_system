import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Card } from '../components/Card';

const mockIncidents = [
  {
    id: '1',
    incident_number: 'INC-2026-0001',
    student: 'Alex Rivera',
    title: 'Disruption during Chemistry lab',
    severity: 'MODERATE',
    status: 'RESOLVED',
    date: 'Sep 15, 2026',
  },
  {
    id: '2',
    incident_number: 'INC-2026-0002',
    student: 'Alex Rivera',
    title: 'Phone usage during quiz',
    severity: 'MODERATE',
    status: 'RESOLVED',
    date: 'Sep 18, 2026',
  },
];

export const MyIncidentsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Reported Infractions</Text>
      <FlatList
        data={mockIncidents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <Text style={styles.number}>{item.incident_number}</Text>
              <Text style={styles.status}>{item.status}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <View style={styles.footer}>
              <Text style={styles.meta}>Student: {item.student}</Text>
              <Text style={styles.meta}>{item.date}</Text>
            </View>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  number: {
    color: '#818cf8',
    fontWeight: 'bold',
    fontSize: 12,
  },
  status: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: {
    color: '#94a3b8',
    fontSize: 12,
  },
});
