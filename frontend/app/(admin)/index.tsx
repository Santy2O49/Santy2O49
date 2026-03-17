import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { FinanceSummary, User, Job } from '../../src/types';
import { Card } from '../../src/components/Card';
import api from '../../src/api/client';
import { t } from '../../src/i18n/translations';

const { width } = Dimensions.get('window');

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [finance, setFinance] = useState<FinanceSummary | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [financeRes, usersRes, jobsRes] = await Promise.all([
        api.get('/finance/summary'),
        api.get('/users'),
        api.get('/jobs'),
      ]);
      setFinance(financeRes.data);
      setUsers(usersRes.data);
      setJobs(jobsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(t('logout'), t('logoutConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('yes'),
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const stats = [
    {
      title: t('totalUsers'),
      value: users.length,
      icon: 'people',
      color: '#2563eb',
      bgColor: '#eff6ff',
    },
    {
      title: t('providers'),
      value: users.filter(u => u.role === 'contractor').length,
      icon: 'construct',
      color: '#16a34a',
      bgColor: '#dcfce7',
    },
    {
      title: t('clients'),
      value: users.filter(u => u.role === 'customer').length,
      icon: 'person',
      color: '#f59e0b',
      bgColor: '#fef3c7',
    },
    {
      title: t('totalJobs'),
      value: finance?.total_jobs || 0,
      icon: 'briefcase',
      color: '#8b5cf6',
      bgColor: '#f3e8ff',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{t('adminPanel')}</Text>
            <Text style={styles.subtitle}>{t('controlCenter')}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#dc2626" />
          </TouchableOpacity>
        </View>

        {/* Revenue Card */}
        <Card style={styles.revenueCard}>
          <View style={styles.revenueHeader}>
            <Text style={styles.revenueLabel}>{t('totalCommissions')}</Text>
            <Ionicons name="trending-up" size={24} color="#16a34a" />
          </View>
          <Text style={styles.revenueAmount}>
            ${finance?.total_commissions?.toFixed(2) || '0.00'}
          </Text>
          <View style={styles.revenueStats}>
            <View style={styles.revenueStat}>
              <Text style={styles.revenueStatLabel}>{t('totalRevenue')}</Text>
              <Text style={styles.revenueStatValue}>
                ${finance?.total_revenue?.toFixed(2) || '0.00'}
              </Text>
            </View>
            <View style={styles.revenueStat}>
              <Text style={styles.revenueStatLabel}>{t('inEscrow')}</Text>
              <Text style={styles.revenueStatValue}>
                ${finance?.pending_payouts?.toFixed(2) || '0.00'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <Card key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.bgColor }]}>
                <Ionicons name={stat.icon as any} size={22} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.title}</Text>
            </Card>
          ))}
        </View>

        {/* Monetization Summary */}
        <Text style={styles.sectionTitle}>{t('monetizationModel')}</Text>
        <Card style={styles.monetizationCard}>
          <View style={styles.monetizationItem}>
            <View style={styles.monetizationIcon}>
              <Ionicons name="cash" size={20} color="#16a34a" />
            </View>
            <View style={styles.monetizationInfo}>
              <Text style={styles.monetizationTitle}>{t('commissions')}</Text>
              <Text style={styles.monetizationDesc}>{t('perJobCompleted')}</Text>
            </View>
            <Text style={styles.monetizationValue}>
              ${finance?.total_commissions?.toFixed(2) || '0.00'}
            </Text>
          </View>

          <View style={styles.monetizationDivider} />

          <View style={styles.monetizationItem}>
            <View style={[styles.monetizationIcon, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="card" size={20} color="#2563eb" />
            </View>
            <View style={styles.monetizationInfo}>
              <Text style={styles.monetizationTitle}>{t('subscriptions')}</Text>
              <Text style={styles.monetizationDesc}>{t('premiumProviders')}</Text>
            </View>
            <Text style={styles.monetizationValue}>$0.00</Text>
          </View>

          <View style={styles.monetizationDivider} />

          <View style={styles.monetizationItem}>
            <View style={[styles.monetizationIcon, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="megaphone" size={20} color="#f59e0b" />
            </View>
            <View style={styles.monetizationInfo}>
              <Text style={styles.monetizationTitle}>{t('advertising')}</Text>
              <Text style={styles.monetizationDesc}>{t('featuredServicesAd')}</Text>
            </View>
            <Text style={styles.monetizationValue}>$0.00</Text>
          </View>
        </Card>

        {/* Quick Stats */}
        <Text style={styles.sectionTitle}>{t('jobsSummary')}</Text>
        <Card>
          <View style={styles.jobStats}>
            <View style={styles.jobStatItem}>
              <Text style={styles.jobStatValue}>{finance?.completed_jobs || 0}</Text>
              <Text style={styles.jobStatLabel}>{t('completed')}</Text>
            </View>
            <View style={styles.jobStatDivider} />
            <View style={styles.jobStatItem}>
              <Text style={styles.jobStatValue}>
                {jobs.filter(j => j.status === 'pending').length}
              </Text>
              <Text style={styles.jobStatLabel}>{t('pending')}</Text>
            </View>
            <View style={styles.jobStatDivider} />
            <View style={styles.jobStatItem}>
              <Text style={styles.jobStatValue}>
                {jobs.filter(j => j.status === 'in_progress').length}
              </Text>
              <Text style={styles.jobStatLabel}>{t('inProgress')}</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  revenueCard: {
    backgroundColor: '#0f172a',
    marginBottom: 20,
  },
  revenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revenueLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  revenueAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 8,
  },
  revenueStats: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  revenueStat: {
    flex: 1,
  },
  revenueStatLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  revenueStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    alignItems: 'center',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  monetizationCard: {
    marginBottom: 24,
  },
  monetizationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monetizationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monetizationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  monetizationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  monetizationDesc: {
    fontSize: 12,
    color: '#64748b',
  },
  monetizationValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#16a34a',
  },
  monetizationDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  jobStats: {
    flexDirection: 'row',
  },
  jobStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  jobStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  jobStatLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  jobStatDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
});
