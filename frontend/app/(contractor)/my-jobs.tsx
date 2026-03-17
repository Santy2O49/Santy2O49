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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { Job, JobStatus } from '../../src/types';
import { Card } from '../../src/components/Card';
import { StatusBadge } from '../../src/components/StatusBadge';
import api from '../../src/api/client';

export default function ContractorMyJobs() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  const fetchData = async () => {
    try {
      const [jobsRes, walletRes] = await Promise.all([
        api.get('/jobs', { params: { contractor_id: user?.id } }),
        api.get('/wallet/balance'),
      ]);
      setJobs(jobsRes.data);
      setWalletBalance(walletRes.data.balance);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleStart = async (jobId: string) => {
    try {
      await api.put(`/jobs/${jobId}/start`);
      Alert.alert('Job Started', 'Good luck!');
      fetchData();
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Cannot start job';
      if (msg.includes('Insufficient balance')) {
        Alert.alert('Insufficient Balance', msg);
      } else {
        Alert.alert('Error', msg);
      }
    }
  };

  const handleComplete = async (jobId: string) => {
    Alert.alert('Complete Job', 'Mark this job as done? Commission will be deducted from your wallet.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete',
        onPress: async () => {
          try {
            const res = await api.put(`/jobs/${jobId}/complete`);
            Alert.alert('Job Completed!', `Commission deducted: $${res.data.commission.toFixed(2)}`);
            fetchData();
          } catch (error: any) {
            Alert.alert('Error', error.response?.data?.detail || 'Failed');
          }
        },
      },
    ]);
  };

  const openChat = (job: Job) => {
    router.push({ pathname: '/(contractor)/chat', params: { jobId: job.id, otherName: 'Customer' } });
  };

  const accepted = jobs.filter(j => j.status === JobStatus.ACCEPTED);
  const inProgress = jobs.filter(j => j.status === JobStatus.IN_PROGRESS);
  const completed = jobs.filter(j => j.status === JobStatus.COMPLETED);

  return (
    <SafeAreaView style={styles.container}>
      {/* Wallet Banner */}
      <View style={styles.walletBanner}>
        <View>
          <Text style={styles.walletLabel}>Wallet Balance</Text>
          <Text style={styles.walletAmount}>${walletBalance.toFixed(2)}</Text>
        </View>
        <View style={styles.walletInfo}>
          <Ionicons name="wallet" size={28} color="#fff" />
          <Text style={styles.walletHint}>Commission prepaid</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Accepted - Ready to Start */}
        {accepted.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Ready to Start ({accepted.length})</Text>
            {accepted.map(job => (
              <Card key={job.id} style={styles.jobCard}>
                <View style={styles.jobHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.jobTitle}>{job.service_name}</Text>
                    <View style={styles.locationRow}>
                      <Ionicons name="location" size={12} color="#64748b" />
                      <Text style={styles.jobLocation}>{job.location}</Text>
                    </View>
                  </View>
                  <StatusBadge status={job.status} />
                </View>
                <Text style={styles.jobDesc}>{job.description}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Agreed Price</Text>
                  <Text style={styles.price}>${job.budget}</Text>
                </View>
                <Text style={styles.commissionNote}>
                  Commission: ${(job.budget * 0.10).toFixed(2)} · You earn: ${(job.budget * 0.90).toFixed(2)}
                </Text>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.startBtn} onPress={() => handleStart(job.id)}>
                    <Ionicons name="play" size={16} color="#fff" />
                    <Text style={styles.startBtnText}>Start Job</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.chatBtn} onPress={() => openChat(job)}>
                    <Ionicons name="chatbubble" size={16} color="#2563eb" />
                    <Text style={styles.chatBtnText}>Message</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </>
        )}

        {/* In Progress */}
        {inProgress.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>In Progress ({inProgress.length})</Text>
            {inProgress.map(job => (
              <Card key={job.id} style={styles.jobCard}>
                <View style={styles.jobHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.jobTitle}>{job.service_name}</Text>
                    <View style={styles.locationRow}>
                      <Ionicons name="location" size={12} color="#64748b" />
                      <Text style={styles.jobLocation}>{job.location}</Text>
                    </View>
                  </View>
                  <StatusBadge status={job.status} />
                </View>
                <Text style={styles.jobDesc}>{job.description}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Price</Text>
                  <Text style={styles.price}>${job.budget}</Text>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.completeBtn} onPress={() => handleComplete(job.id)}>
                    <Ionicons name="checkmark-circle" size={16} color="#fff" />
                    <Text style={styles.completeBtnText}>Mark Complete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.chatBtn} onPress={() => openChat(job)}>
                    <Ionicons name="chatbubble" size={16} color="#2563eb" />
                    <Text style={styles.chatBtnText}>Message</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Completed ({completed.length})</Text>
            {completed.map(job => (
              <Card key={job.id} style={styles.jobCard}>
                <View style={styles.jobHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.jobTitle}>{job.service_name}</Text>
                    <Text style={styles.jobDate}>{new Date(job.completed_at || job.created_at).toLocaleDateString()}</Text>
                  </View>
                  <StatusBadge status={job.status} />
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Earned</Text>
                  <Text style={[styles.price, { color: '#16a34a' }]}>
                    ${((job.final_price || job.budget) * 0.90).toFixed(2)}
                  </Text>
                </View>
              </Card>
            ))}
          </>
        )}

        {jobs.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No jobs yet</Text>
            <Text style={styles.emptyText}>Accepted jobs will appear here</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  walletBanner: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#16a34a', marginHorizontal: 16, marginTop: 12, marginBottom: 4,
    padding: 16, borderRadius: 14,
  },
  walletLabel: { color: '#ffffff99', fontSize: 12, fontWeight: '500' },
  walletAmount: { color: '#fff', fontSize: 28, fontWeight: '700', marginTop: 2 },
  walletInfo: { alignItems: 'center' },
  walletHint: { color: '#ffffff99', fontSize: 10, marginTop: 4 },
  content: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  jobCard: { marginBottom: 12 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  jobTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  jobLocation: { fontSize: 12, color: '#64748b', marginLeft: 4 },
  jobDesc: { fontSize: 13, color: '#64748b', marginBottom: 10 },
  jobDate: { fontSize: 12, color: '#64748b', marginTop: 2 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  priceLabel: { fontSize: 12, color: '#64748b' },
  price: { fontSize: 20, fontWeight: '700', color: '#111827' },
  commissionNote: { fontSize: 11, color: '#16a34a', marginTop: 4 },
  actionRow: { flexDirection: 'row', marginTop: 12, gap: 8 },
  startBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563eb', paddingVertical: 10, borderRadius: 10, gap: 6 },
  startBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  completeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#16a34a', paddingVertical: 10, borderRadius: 10, gap: 6 },
  completeBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  chatBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff6ff', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, gap: 6 },
  chatBtnText: { color: '#2563eb', fontWeight: '600', fontSize: 13 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#374151', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#64748b', marginTop: 4 },
});
