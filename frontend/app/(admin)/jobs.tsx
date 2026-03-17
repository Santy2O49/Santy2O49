import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Job, JobStatus } from '../../src/types';
import { Card } from '../../src/components/Card';
import { StatusBadge } from '../../src/components/StatusBadge';
import api from '../../src/api/client';

export default function AdminJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs');
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    return job.status === filter;
  });

  const filters = [
    { key: 'all', label: 'Todos' },
    { key: JobStatus.PENDING, label: 'Pendientes' },
    { key: JobStatus.IN_PROGRESS, label: 'En Progreso' },
    { key: JobStatus.COMPLETED, label: 'Completados' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Monitoreo de Trabajos</Text>
        <Text style={styles.subtitle}>{jobs.length} trabajos totales</Text>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {filters.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterButton,
              filter === f.key && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f.key && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No hay trabajos</Text>
          </View>
        ) : (
          filteredJobs.map(job => (
            <Card key={job.id} style={styles.jobCard}>
              <View style={styles.jobHeader}>
                <View style={styles.jobInfo}>
                  <Text style={styles.jobTitle}>{job.service_name}</Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={12} color="#64748b" />
                    <Text style={styles.jobLocation}>{job.location}</Text>
                  </View>
                </View>
                <StatusBadge status={job.status} />
              </View>

              <Text style={styles.jobDescription} numberOfLines={2}>
                {job.description}
              </Text>

              <View style={styles.jobMeta}>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Presupuesto:</Text>
                  <Text style={styles.metaValue}>${job.budget}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Comisión:</Text>
                  <Text style={[styles.metaValue, { color: '#16a34a' }]}>
                    ${job.commission_amount?.toFixed(2) || (job.budget * 0.1).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Fecha:</Text>
                  <Text style={styles.metaValue}>
                    {new Date(job.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View style={styles.paymentRow}>
                <Ionicons
                  name={job.payment_status === 'released' ? 'checkmark-circle' : 'time'}
                  size={16}
                  color={job.payment_status === 'released' ? '#16a34a' : '#f59e0b'}
                />
                <Text style={styles.paymentText}>
                  Pago: {job.payment_status?.replace(/_/g, ' ').toUpperCase()}
                </Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  filterText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  jobCard: {
    marginBottom: 12,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  jobLocation: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  jobDescription: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 12,
  },
  jobMeta: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paymentText: {
    fontSize: 12,
    color: '#64748b',
  },
});
