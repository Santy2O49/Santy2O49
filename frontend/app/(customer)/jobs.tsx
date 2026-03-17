import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../src/store/themeStore';
import { Job, JobStatus, Bid } from '../../src/types';
import { StatusBadge } from '../../src/components/StatusBadge';
import api from '../../src/api/client';
import { t } from '../../src/i18n/translations';

export default function CustomerJobs() {
  const { colors } = useThemeStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidsModalVisible, setBidsModalVisible] = useState(false);

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

  const viewBids = async (job: Job) => {
    setSelectedJob(job);
    try {
      const response = await api.get(`/jobs/${job.id}/bids`);
      setBids(response.data);
    } catch (error) {
      setBids([]);
    }
    setBidsModalVisible(true);
  };

  const acceptBid = async (bidId: string) => {
    Alert.alert('Accept Bid', 'Are you sure you want to accept this bid?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept',
        onPress: async () => {
          try {
            await api.put(`/bids/${bidId}/accept`);
            Alert.alert('Success', 'Bid accepted! The contractor will start your job.');
            setBidsModalVisible(false);
            fetchJobs();
          } catch (error: any) {
            Alert.alert('Error', error.response?.data?.detail || 'Failed to accept bid');
          }
        },
      },
    ]);
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
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} data-testid="customer-jobs">
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>My Jobs</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterButton, { backgroundColor: filter === f.key ? colors.accent : colors.surface }]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, { color: filter === f.key ? colors.accentText : colors.textSecondary }]}>{f.label}</Text>
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
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No jobs yet</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Your requests will appear here</Text>
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

              <Text style={[styles.jobDescription, { color: colors.textSecondary }]} numberOfLines={2}>{job.description}</Text>

              <View style={[styles.jobFooter, { borderTopColor: colors.border }]}>
                <View>
                  <Text style={[styles.priceLabel, { color: colors.textMuted }]}>Budget</Text>
                  <Text style={[styles.jobPrice, { color: colors.accent }]}>${job.budget}</Text>
                </View>
                <View>
                  <Text style={[styles.priceLabel, { color: colors.textMuted }]}>Date</Text>
                  <Text style={[styles.jobDate, { color: colors.text }]}>{new Date(job.created_at).toLocaleDateString()}</Text>
                </View>
              </View>

              {/* PENDING: show bid count + view bids button */}
              {job.status === JobStatus.PENDING && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.viewBidsBtn, { backgroundColor: colors.accent }]}
                    onPress={() => viewBids(job)}
                  >
                    <Ionicons name="people" size={16} color={colors.accentText} />
                    <Text style={[styles.viewBidsText, { color: colors.accentText }]}>
                      View Bids {job.bid_count ? `(${job.bid_count})` : ''}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.cancelBtn, { backgroundColor: colors.surfaceAlt }]}
                    onPress={() => handleCancel(job.id)}
                  >
                    <Text style={{ color: colors.danger, fontWeight: '600', fontSize: 13 }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* ACCEPTED/IN_PROGRESS: show contractor info */}
              {(job.status === JobStatus.ACCEPTED || job.status === JobStatus.IN_PROGRESS) && (
                <View style={[styles.statusInfo, { backgroundColor: colors.surfaceAlt }]}>
                  <Ionicons name="person-circle" size={20} color={colors.accent} />
                  <Text style={[styles.statusInfoText, { color: colors.text }]}>
                    {job.status === JobStatus.ACCEPTED ? 'Contractor assigned — awaiting start' : 'Work in progress'}
                  </Text>
                </View>
              )}

              {/* COMPLETED: show rating if not yet rated */}
              {job.status === JobStatus.COMPLETED && !job.contractor_rating && (
                <View style={[styles.ratingSection, { borderTopColor: colors.border }]}>
                  <Text style={[styles.rateLabel, { color: colors.text }]}>Rate the contractor</Text>
                  <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity key={star} onPress={() => handleRate(job.id, star)}>
                        <Ionicons name="star" size={28} color={colors.warning} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {job.status === JobStatus.COMPLETED && job.contractor_rating && (
                <View style={[styles.statusInfo, { backgroundColor: colors.surfaceAlt }]}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={[styles.statusInfoText, { color: colors.success }]}>Completed & Rated</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Bids Modal */}
      <Modal visible={bidsModalVisible} animationType="slide" transparent onRequestClose={() => setBidsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Bids for {selectedJob?.service_name}
              </Text>
              <TouchableOpacity onPress={() => setBidsModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {bids.length === 0 ? (
              <View style={styles.noBids}>
                <Ionicons name="hourglass-outline" size={40} color={colors.textMuted} />
                <Text style={[styles.noBidsText, { color: colors.textMuted }]}>No bids yet. Check back soon!</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {bids.map((bid) => (
                  <View key={bid.id} style={[styles.bidCard, { backgroundColor: colors.background, borderColor: bid.status === 'accepted' ? colors.success : colors.border }]}>
                    <View style={styles.bidHeader}>
                      <Image
                        source={{ uri: bid.contractor_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(bid.contractor_name)}&size=40` }}
                        style={styles.bidAvatar}
                      />
                      <View style={styles.bidInfo}>
                        <Text style={[styles.bidName, { color: colors.text }]}>{bid.contractor_name}</Text>
                        <View style={styles.bidRating}>
                          <Ionicons name="star" size={12} color={colors.warning} />
                          <Text style={[styles.bidRatingText, { color: colors.textSecondary }]}>{bid.contractor_rating.toFixed(1)}</Text>
                        </View>
                      </View>
                      <View style={styles.bidAmountBox}>
                        <Text style={[styles.bidAmount, { color: colors.accent }]}>${bid.amount}</Text>
                        {bid.estimated_hours && (
                          <Text style={[styles.bidHours, { color: colors.textMuted }]}>{bid.estimated_hours}h</Text>
                        )}
                      </View>
                    </View>

                    {bid.message ? (
                      <Text style={[styles.bidMessage, { color: colors.textSecondary }]}>"{bid.message}"</Text>
                    ) : null}

                    {bid.status === 'pending' && (
                      <TouchableOpacity
                        style={[styles.acceptBidBtn, { backgroundColor: colors.accent }]}
                        onPress={() => acceptBid(bid.id)}
                      >
                        <Text style={[styles.acceptBidText, { color: colors.accentText }]}>Accept Bid</Text>
                      </TouchableOpacity>
                    )}
                    {bid.status === 'accepted' && (
                      <View style={[styles.bidStatusBadge, { backgroundColor: colors.success + '20' }]}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                        <Text style={[styles.bidStatusText, { color: colors.success }]}>Accepted</Text>
                      </View>
                    )}
                    {bid.status === 'rejected' && (
                      <View style={[styles.bidStatusBadge, { backgroundColor: colors.danger + '20' }]}>
                        <Text style={[styles.bidStatusText, { color: colors.danger }]}>Not selected</Text>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  priceLabel: { fontSize: 11 },
  jobPrice: { fontSize: 17, fontWeight: '700' },
  jobDate: { fontSize: 13, fontWeight: '500' },
  actionRow: { flexDirection: 'row', marginTop: 12, gap: 10 },
  viewBidsBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 6 },
  viewBidsText: { fontWeight: '700', fontSize: 14 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statusInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 10, padding: 10, borderRadius: 8, gap: 8 },
  statusInfoText: { fontSize: 13, fontWeight: '500' },
  ratingSection: { marginTop: 12, paddingTop: 10, borderTopWidth: 1 },
  rateLabel: { fontSize: 13, marginBottom: 6 },
  stars: { flexDirection: 'row', gap: 4 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  noBids: { alignItems: 'center', paddingVertical: 40 },
  noBidsText: { marginTop: 10, fontSize: 14 },
  bidCard: { borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1 },
  bidHeader: { flexDirection: 'row', alignItems: 'center' },
  bidAvatar: { width: 40, height: 40, borderRadius: 20 },
  bidInfo: { flex: 1, marginLeft: 10 },
  bidName: { fontSize: 14, fontWeight: '600' },
  bidRating: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  bidRatingText: { fontSize: 12 },
  bidAmountBox: { alignItems: 'flex-end' },
  bidAmount: { fontSize: 20, fontWeight: '700' },
  bidHours: { fontSize: 11, marginTop: 2 },
  bidMessage: { fontSize: 13, fontStyle: 'italic', marginTop: 8, paddingLeft: 4 },
  acceptBidBtn: { marginTop: 10, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  acceptBidText: { fontWeight: '700', fontSize: 14 },
  bidStatusBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, gap: 4, alignSelf: 'flex-start' },
  bidStatusText: { fontSize: 12, fontWeight: '600' },
});
