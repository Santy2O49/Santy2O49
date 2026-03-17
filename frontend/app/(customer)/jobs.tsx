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
import { Job, JobStatus } from '../../src/types';
import { StatusBadge } from '../../src/components/StatusBadge';
import api from '../../src/api/client';

export default function CustomerJobs() {
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

  const handleCancel = async (jobId: string) => {
    Alert.alert(
      'Cancelar Trabajo',
      '¿Estás seguro de que quieres cancelar este trabajo?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.put(`/jobs/${jobId}/cancel`);
              fetchJobs();
              Alert.alert('Éxito', 'Trabajo cancelado');
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.detail || 'No se pudo cancelar');
            }
          },
        },
      ]
    );
  };

  const handleRate = async (jobId: string, rating: number) => {
    try {
      await api.put(`/jobs/${jobId}/rate?rating=${rating}`);
      fetchJobs();
      Alert.alert('Éxito', '¡Gracias por tu calificación!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'No se pudo calificar');
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    if (filter === 'active') return [JobStatus.PENDING, JobStatus.ACCEPTED, JobStatus.IN_PROGRESS].includes(job.status as JobStatus);
    if (filter === 'completed') return job.status === JobStatus.COMPLETED;
    return true;
  });

  const filters = [
    { key: 'all', label: 'Todos' },
    { key: 'active', label: 'Activos' },
    { key: 'completed', label: 'Completados' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mis Solicitudes</Text>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#c8ff00" />
        }
      >
        {filteredJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={64} color="#4b5563" />
            <Text style={styles.emptyTitle}>No hay solicitudes</Text>
            <Text style={styles.emptyText}>Tus solicitudes aparecerán aquí</Text>
          </View>
        ) : (
          filteredJobs.map(job => (
            <View key={job.id} style={styles.jobCard}>
              <View style={styles.jobHeader}>
                <View style={styles.jobInfo}>
                  <Text style={styles.jobTitle}>{job.service_name}</Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={12} color="#6b7280" />
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
                  <Text style={styles.jobPriceLabel}>Presupuesto</Text>
                  <Text style={styles.jobPrice}>${job.budget}</Text>
                </View>
                <View>
                  <Text style={styles.jobDateLabel}>Fecha</Text>
                  <Text style={styles.jobDate}>
                    {new Date(job.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {job.status === JobStatus.PENDING && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleCancel(job.id)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              )}

              {job.status === JobStatus.COMPLETED && !job.contractor_rating && (
                <View style={styles.ratingSection}>
                  <Text style={styles.ratingLabel}>Califica al proveedor:</Text>
                  <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => handleRate(job.id, star)}
                      >
                        <Ionicons name="star" size={28} color="#fbbf24" />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {job.contractor_rating && (
                <View style={styles.ratedSection}>
                  <Text style={styles.ratedLabel}>Tu calificación:</Text>
                  <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Ionicons
                        key={star}
                        name={star <= job.contractor_rating! ? 'star' : 'star-outline'}
                        size={20}
                        color="#fbbf24"
                      />
                    ))}
                  </View>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#262626',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  filterContainer: {
    maxHeight: 60,
    backgroundColor: '#1a1a1a',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#262626',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#c8ff00',
  },
  filterText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#1a1a1a',
  },
  content: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  jobCard: {
    backgroundColor: '#262626',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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
    color: '#ffffff',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  jobLocation: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  jobDescription: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  jobPriceLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  jobPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#c8ff00',
  },
  jobDateLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  jobDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#333',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  ratingSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  ratingLabel: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 4,
  },
  ratedSection: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratedLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
});
