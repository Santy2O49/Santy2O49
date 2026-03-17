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

export default function ContractorAvailableJobs() {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs/available');
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

  const handleAccept = async (jobId: string) => {
    Alert.alert(
      'Aceptar Trabajo',
      '¿Quieres aceptar este trabajo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceptar',
          onPress: async () => {
            try {
              await api.put(`/jobs/${jobId}/accept`);
              fetchJobs();
              Alert.alert('Éxito', '¡Trabajo aceptado! Ve a "Mis Trabajos" para ver los detalles.');
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.detail || 'No se pudo aceptar el trabajo');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.full_name?.split(' ')[0]} 👋</Text>
          <Text style={styles.subtitle}>Encuentra trabajos disponibles</Text>
        </View>
        {user?.is_verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
            <Text style={styles.verifiedText}>Verificado</Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {jobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No hay trabajos disponibles</Text>
            <Text style={styles.emptyText}>Nuevos trabajos aparecerán aquí</Text>
          </View>
        ) : (
          jobs.map(job => (
            <Card key={job.id} style={styles.jobCard}>
              <View style={styles.jobHeader}>
                <View style={styles.jobInfo}>
                  <Text style={styles.jobTitle}>{job.service_name}</Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={14} color="#64748b" />
                    <Text style={styles.jobLocation}>{job.location}</Text>
                  </View>
                </View>
                <View style={styles.budgetContainer}>
                  <Text style={styles.budgetLabel}>Presupuesto</Text>
                  <Text style={styles.budget}>${job.budget}</Text>
                </View>
              </View>

              <Text style={styles.jobDescription} numberOfLines={3}>
                {job.description}
              </Text>

              <View style={styles.jobMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color="#64748b" />
                  <Text style={styles.metaText}>
                    {new Date(job.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="cash-outline" size={14} color="#64748b" />
                  <Text style={styles.metaText}>10% comisión</Text>
                </View>
              </View>

              <View style={styles.actions}>
                <Button
                  title="Aceptar Trabajo"
                  onPress={() => handleAccept(job.id)}
                  style={styles.acceptButton}
                />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
    marginLeft: 4,
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
    marginBottom: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  jobLocation: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 4,
  },
  budgetContainer: {
    alignItems: 'flex-end',
  },
  budgetLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  budget: {
    fontSize: 22,
    fontWeight: '700',
    color: '#16a34a',
  },
  jobDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  jobMeta: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
  },
  actions: {
    marginTop: 16,
  },
  acceptButton: {
    backgroundColor: '#16a34a',
  },
});
