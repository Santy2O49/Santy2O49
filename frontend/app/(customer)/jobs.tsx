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
import { useThemeStore } from '../../src/store/themeStore';
import { Job, JobStatus } from '../../src/types';
import { StatusBadge } from '../../src/components/StatusBadge';
import api from '../../src/api/client';
import { t } from '../../src/i18n/translations';

export default function CustomerJobs() {
  const { colors } = useThemeStore();
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

  useEffect(() => { fetchJobs(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  };

  const handleCancel = async (jobId: string) => {
    Alert.alert('Cancel Job', 'Are you sure?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.put(`/jobs/${jobId}/cancel`);
            fetchJobs();
          } catch (error: any) {
            Alert.alert('Error', error.response?.data?.detail || 'Failed');
          }
        },
      },
    ]);
  };

  const handleRate = async (jobId: string, rating: number) => {
    try {
      await api.put(`/jobs/${jobId}/rate?rating=${rating}`);
      fetchJobs();
      Alert.alert('Thanks!', 'Rating submitted');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed');
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (filter === 'all') return true;
    if (filter === 'active') return [JobStatus.PENDING, JobStatus.ACCEPTED, JobStatus.IN_PROGRESS].includes(job.status as JobStatus);
    if (filter === 'completed') return job.status === JobStatus.COMPLETED;
    return true;
  });

  const filters = [
    { key: 'all', label: t('all') },
    { key: 'active', label: t('active') },
    { key: 'completed', label: t('completed') },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} data-testid="customer-jobs">
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>{t('myJobs')}</Text>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterButton,
              { backgroundColor: filter === f.key ? colors.accent : colors.surface },
            ]}
            onPress={() => setFilter(f.key)}
            data-testid={`filter-${f.key}`}
          >
            <Text style={[styles.filterText, { color: filter === f.key ? colors.accentText : colors.textSecondary }]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        {filteredJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={56} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('noJobs')}</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('yourRequestsAppearHere')}</Text>
          </View>
        ) : (
          filteredJobs.map((job) => (
            <View key={job.id} style={[styles.jobCard, { backgroundColor: colors.surface }]}>
              <View style={styles.jobHeader}>
                <View style={styles.jobInfo}>
                  <Text style={[styles.jobTitle, { color: colors.text }]}>{job.service_name}</Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={12} color={colors.textMuted} />
                    <Text style={[styles.jobLocation, { color: colors.textMuted }]}>{job.location}</Text>
                  </View>
                </View>
                <StatusBadge status={job.status} />
              </View>
              <Text style={[styles.jobDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                {job.description}
              </Text>
              <View style={[styles.jobFooter, { borderTopColor: colors.border }]}>
                <View>
                  <Text style={[styles.jobPriceLabel, { color: colors.textMuted }]}>{t('budget')}</Text>
                  <Text style={[styles.jobPrice, { color: colors.accent }]}>${job.budget}</Text>
                </View>
                <View>
                  <Text style={[styles.jobDateLabel, { color: colors.textMuted }]}>{t('date')}</Text>
                  <Text style={[styles.jobDate, { color: colors.text }]}>
                    {new Date(job.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {job.status === JobStatus.PENDING && (
                <TouchableOpacity style={[styles.cancelButton, { backgroundColor: colors.surfaceAlt }]} onPress={() => handleCancel(job.id)}>
                  <Text style={{ color: colors.danger, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
              )}

              {job.status === JobStatus.COMPLETED && !job.contractor_rating && (
                <View style={[styles.ratingSection, { borderTopColor: colors.border }]}>
                  <Text style={[{ color: colors.text, fontSize: 13, marginBottom: 6 }]}>{t('rateContractor')}</Text>
                  <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity key={star} onPress={() => handleRate(job.id, star)}>
                        <Ionicons name="star" size={26} color={colors.warning} />
                      </TouchableOpacity>
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
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  title: { fontSize: 20, fontWeight: '700' },
  filterContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 4 },
  filterText: { fontSize: 13, fontWeight: '600' },
  content: { padding: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 17, fontWeight: '600', marginTop: 14 },
  emptyText: { fontSize: 13, marginTop: 4 },
  jobCard: { borderRadius: 14, padding: 16, marginBottom: 10 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  jobInfo: { flex: 1 },
  jobTitle: { fontSize: 15, fontWeight: '600' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  jobLocation: { fontSize: 12, marginLeft: 4 },
  jobDescription: { fontSize: 13, marginBottom: 10 },
  jobFooter: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1 },
  jobPriceLabel: { fontSize: 11 },
  jobPrice: { fontSize: 17, fontWeight: '700' },
  jobDateLabel: { fontSize: 11 },
  jobDate: { fontSize: 13, fontWeight: '500' },
  cancelButton: { marginTop: 10, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  ratingSection: { marginTop: 12, paddingTop: 10, borderTopWidth: 1 },
  stars: { flexDirection: 'row', gap: 4 },
});
