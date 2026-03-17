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
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { Job, JobStatus } from '../../src/types';
import { Card } from '../../src/components/Card';
import { StatusBadge } from '../../src/components/StatusBadge';
import api from '../../src/api/client';

export default function ContractorAvailableJobs() {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [bidModalVisible, setBidModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs/available');
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

  const openBidModal = (job: Job) => {
    setSelectedJob(job);
    setBidAmount(job.budget.toString());
    setBidMessage('');
    setBidModalVisible(true);
  };

  const submitBid = async () => {
    if (!selectedJob) return;
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Enter a valid bid amount');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/jobs/${selectedJob.id}/bid`, {
        amount,
        message: bidMessage,
      });
      Alert.alert('Bid Sent!', 'The customer will review your bid.');
      setBidModalVisible(false);
      fetchJobs();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to place bid');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.full_name?.split(' ')[0]}</Text>
          <Text style={styles.subtitle}>Available jobs near you</Text>
        </View>
        {user?.is_verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {jobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No jobs available</Text>
            <Text style={styles.emptyText}>New jobs will appear here</Text>
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
                  <Text style={styles.budgetLabel}>Budget</Text>
                  <Text style={styles.budget}>${job.budget}</Text>
                </View>
              </View>

              <Text style={styles.jobDescription} numberOfLines={3}>{job.description}</Text>

              <View style={styles.jobMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color="#64748b" />
                  <Text style={styles.metaText}>{new Date(job.created_at).toLocaleDateString()}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="people-outline" size={14} color="#64748b" />
                  <Text style={styles.metaText}>{job.bid_count || 0} bids</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="cash-outline" size={14} color="#64748b" />
                  <Text style={styles.metaText}>10% commission</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.bidButton} onPress={() => openBidModal(job)}>
                <Ionicons name="pricetag" size={18} color="#fff" />
                <Text style={styles.bidButtonText}>Place Bid</Text>
              </TouchableOpacity>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Bid Modal */}
      <Modal visible={bidModalVisible} animationType="slide" transparent onRequestClose={() => setBidModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Place Your Bid</Text>
              <TouchableOpacity onPress={() => setBidModalVisible(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            {selectedJob && (
              <>
                <View style={styles.jobSummary}>
                  <Text style={styles.jobSummaryTitle}>{selectedJob.service_name}</Text>
                  <Text style={styles.jobSummaryDesc}>{selectedJob.description}</Text>
                  <Text style={styles.jobSummaryBudget}>Customer budget: ${selectedJob.budget}</Text>
                </View>

                <Text style={styles.inputLabel}>Your Bid Amount ($)</Text>
                <TextInput
                  style={styles.input}
                  value={bidAmount}
                  onChangeText={setBidAmount}
                  keyboardType="numeric"
                  placeholder="Enter your price"
                />
                <Text style={styles.earningsNote}>
                  You'll earn: ${(parseFloat(bidAmount || '0') * 0.9).toFixed(2)} (after 10% commission)
                </Text>

                <Text style={styles.inputLabel}>Message to Customer (optional)</Text>
                <TextInput
                  style={[styles.input, styles.messageInput]}
                  value={bidMessage}
                  onChangeText={setBidMessage}
                  placeholder="Why should they choose you?"
                  multiline
                  numberOfLines={3}
                />

                <TouchableOpacity
                  style={[styles.submitBidBtn, submitting && { opacity: 0.6 }]}
                  onPress={submitBid}
                  disabled={submitting}
                >
                  <Text style={styles.submitBidText}>{submitting ? 'Submitting...' : 'Submit Bid'}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  greeting: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#dcfce7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  verifiedText: { fontSize: 12, fontWeight: '600', color: '#16a34a', marginLeft: 4 },
  content: { padding: 20, paddingTop: 0 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#374151', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#64748b', marginTop: 4 },
  jobCard: { marginBottom: 16 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  jobInfo: { flex: 1 },
  jobTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  jobLocation: { fontSize: 13, color: '#64748b', marginLeft: 4 },
  budgetContainer: { alignItems: 'flex-end' },
  budgetLabel: { fontSize: 11, color: '#64748b' },
  budget: { fontSize: 22, fontWeight: '700', color: '#16a34a' },
  jobDescription: { fontSize: 14, color: '#64748b', lineHeight: 20, marginBottom: 12 },
  jobMeta: { flexDirection: 'row', gap: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#64748b' },
  bidButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#16a34a', paddingVertical: 12, borderRadius: 10, marginTop: 16, gap: 6,
  },
  bidButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  jobSummary: { backgroundColor: '#f1f5f9', borderRadius: 12, padding: 14, marginBottom: 16 },
  jobSummaryTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  jobSummaryDesc: { fontSize: 13, color: '#64748b', marginTop: 4 },
  jobSummaryBudget: { fontSize: 14, fontWeight: '600', color: '#16a34a', marginTop: 8 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, marginBottom: 8, color: '#111827' },
  messageInput: { minHeight: 80, textAlignVertical: 'top', fontSize: 14 },
  earningsNote: { fontSize: 12, color: '#16a34a', fontWeight: '500', marginBottom: 12 },
  submitBidBtn: { backgroundColor: '#16a34a', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  submitBidText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
