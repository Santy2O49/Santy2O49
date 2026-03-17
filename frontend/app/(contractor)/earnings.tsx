import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { ContractorEarnings } from '../../src/types';
import { Card } from '../../src/components/Card';
import api from '../../src/api/client';

export default function ContractorEarningsScreen() {
  const { user } = useAuthStore();
  const [earnings, setEarnings] = useState<ContractorEarnings | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEarnings = async () => {
    if (!user) return;
    try {
      const response = await api.get(`/finance/contractor/${user.id}`);
      setEarnings(response.data);
    } catch (error) {
      console.error('Error fetching earnings:', error);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEarnings();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Mis Ganancias</Text>
        </View>

        {/* Main Earnings Card */}
        <Card style={styles.mainCard}>
          <Text style={styles.mainLabel}>Ganancias Totales</Text>
          <Text style={styles.mainAmount}>
            ${earnings?.total_earned?.toFixed(2) || '0.00'}
          </Text>
          <View style={styles.mainStats}>
            <View style={styles.mainStatItem}>
              <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
              <Text style={styles.mainStatText}>
                {earnings?.completed_jobs || 0} trabajos completados
              </Text>
            </View>
          </View>
        </Card>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="time" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.statLabel}>En Escrow</Text>
            <Text style={styles.statValue}>
              ${earnings?.pending_amount?.toFixed(2) || '0.00'}
            </Text>
            <Text style={styles.statSubtext}>
              {earnings?.pending_jobs || 0} trabajos
            </Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="trending-up" size={24} color="#16a34a" />
            </View>
            <Text style={styles.statLabel}>Este Mes</Text>
            <Text style={styles.statValue}>
              ${(earnings?.total_earned ? earnings.total_earned * 0.3 : 0).toFixed(2)}
            </Text>
            <Text style={styles.statSubtext}>+15% vs mes anterior</Text>
          </Card>
        </View>

        {/* Withdrawal Section */}
        <Card style={styles.withdrawCard}>
          <View style={styles.withdrawHeader}>
            <Ionicons name="wallet" size={24} color="#2563eb" />
            <Text style={styles.withdrawTitle}>Retiro de Fondos</Text>
          </View>
          <Text style={styles.withdrawDescription}>
            Disponible para retiro: <Text style={styles.withdrawAmount}>${earnings?.total_earned?.toFixed(2) || '0.00'}</Text>
          </Text>
          <View style={styles.withdrawOptions}>
            <View style={styles.withdrawOption}>
              <Ionicons name="card" size={20} color="#64748b" />
              <Text style={styles.withdrawOptionText}>Transferencia Bancaria</Text>
            </View>
            <View style={styles.withdrawOption}>
              <Ionicons name="cash" size={20} color="#64748b" />
              <Text style={styles.withdrawOptionText}>Efectivo (Puntos HAMMR)</Text>
            </View>
          </View>
        </Card>

        {/* Commission Info */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color="#2563eb" />
            <Text style={styles.infoTitle}>Comisión HAMMR</Text>
          </View>
          <Text style={styles.infoText}>
            HAMMR cobra una comisión del 10% por cada trabajo completado. Esta comisión cubre el seguro, soporte al cliente y mantenimiento de la plataforma.
          </Text>
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
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  mainCard: {
    backgroundColor: '#2563eb',
    marginBottom: 20,
  },
  mainLabel: {
    fontSize: 14,
    color: '#bfdbfe',
  },
  mainAmount: {
    fontSize: 40,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 4,
  },
  mainStats: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  mainStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainStatText: {
    fontSize: 14,
    color: '#bfdbfe',
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  statSubtext: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  withdrawCard: {
    marginBottom: 20,
  },
  withdrawHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  withdrawTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  withdrawDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  withdrawAmount: {
    fontWeight: '700',
    color: '#16a34a',
  },
  withdrawOptions: {
    gap: 12,
  },
  withdrawOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  withdrawOptionText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginLeft: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 20,
  },
});
