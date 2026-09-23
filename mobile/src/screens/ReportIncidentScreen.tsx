import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';

export const ReportIncidentScreen = () => {
  const [studentId, setStudentId] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!studentId || !title || !description) {
      Alert.alert('Validation Error', 'Please complete all required fields.');
      return;
    }
    Alert.alert('Success', 'Incident reported for administrative review.');
    setTitle('');
    setLocation('');
    setDescription('');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Report Student Incident</Text>
      
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Student Admission Number *</Text>
        <TextInput
          placeholder="e.g. STU-2026-001"
          placeholderTextColor="#64748b"
          value={studentId}
          onChangeText={setStudentId}
          style={styles.input}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Incident Title *</Text>
        <TextInput
          placeholder="e.g. Disruptive behavior in cafeteria"
          placeholderTextColor="#64748b"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Location</Text>
        <TextInput
          placeholder="e.g. Science Lab B, Main Quad"
          placeholderTextColor="#64748b"
          value={location}
          onChangeText={setLocation}
          style={styles.input}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Detailed Description *</Text>
        <TextInput
          placeholder="Provide factual sequence of events and any witnesses..."
          placeholderTextColor="#64748b"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={[styles.input, styles.textArea]}
        />
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitBtnText}>Submit Incident Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 20,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
