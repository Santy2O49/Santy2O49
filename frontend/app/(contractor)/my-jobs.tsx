import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { Job, JobStatus } from '../../src/types';
import { Card } from '../../src/components/Card';
import { StatusBadge } from '../../src/components/StatusBadge';
import { Button } from '../../src/components/Button';
import api from '../../src/api/client';

export default function ContractorMyJobs() {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('active');

  const fetchJobs = async () => {
    try {
      const response = await api.get(`/jobs?contractor_id=${user?.id}`);
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

  const handleStart = async (jobId: string) => {
    try {
      await api.put(`/jobs/${jobId}/start`);
      fetchJobs();
      Alert.alert('Éxito', 'Trabajo iniciado');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'No se pudo iniciar');
    }
  };

  const handleComplete = async (jobId: string) => {
    Alert.alert(
      'Completar Trabajo',
      '¿Confirmas que has terminado este trabajo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Completar',
          onPress: async () => {
            try {
              await api.put(`/jobs/${jobId}/complete`);
              fetchJobs();
              Alert.alert('Éxito', '¡Trabajo completado! Tu pago será procesado.');
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.detail || 'No se pudo completar');
            }
          },
        },
      ]
    );
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'active') return [JobStatus.ACCEPTED, JobStatus.IN_PROGRESS].includes(job.status as JobStatus);
    if (filter === 'completed') return job.status === JobStatus.COMPLETED;
    return true;
  });

  const filters = [
    { key: 'active', label: 'Activos' },
    { key: 'completed', label: 'Completados' },
    { key: 'all', label: 'Todos' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Trabajos</Text>
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
            <Ionicons name="clipboard-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No hay trabajos</Text>
            <Text style={styles.emptyText}>Acepta trabajos para verlos aquí</Text>
          </View>
        ) : (
          filteredJobs.map(job => (
            <Card key={job.id} style={styles.jobCard}>
              <View style={styles.jobHeader}>
                <View style={styles.jobInfo}>
                  <Text style={styles.jobTitle}>{job.service_name}</Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={14} color="#64748b" />
                    <Text style={styles.jobLocation}>{job.location}</Text>
                  </View>
                </View>
                <StatusBadge status={job.status} />
              </View>

              <Text style={styles.jobDescription} numberOfLines={2}>
                {job.description}
              </Text>

              <View style={styles.jobFooter}>
                <View>
                  <Text style={styles.priceLabel}>Ganarás</Text>
                  <Text style={styles.price}>
                    ${((job.final_price || job.budget) * (1 - job.commission_rate)).toFixed(2)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.commissionLabel}>Comisión HAMMR</Text>
                  <Text style={styles.commission}>
                    -${((job.final_price || job.budget) * job.commission_rate).toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Action buttons based on status */}
              {job.status === JobStatus.ACCEPTED && (
                <Button
                  title="Iniciar Trabajo"
                  onPress={() => handleStart(job.id)}
                  style={styles.actionButton}
                />
              )}

              {job.status === JobStatus.IN_PROGRESS && (
                <Button
                  title="Marcar como Completado"
                  onPress={() => handleComplete(job.id)}
                  variant="success"
                  style={styles.actionButton}
                />
              )}

              {job.status === JobStatus.COMPLETED && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                  <Text style={styles.completedText}>Completado</Text>
                </View>
              )}
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
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
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
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  jobCard: {
    marginBottom: 16,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  priceLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#16a34a',
  },
  commissionLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'right',
  },
  commission: {
    fontSize: 14,
    fontWeight: '500',
    color: '#dc2626',
    textAlign: 'right',
  },
  actionButton: {
    marginTop: 16,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#dcfce7',
    borderRadius: 8,
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
    marginLeft: 6,
  },
});
