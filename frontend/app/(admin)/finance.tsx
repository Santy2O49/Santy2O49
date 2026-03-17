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
import { FinanceSummary } from '../../src/types';
import { Card } from '../../src/components/Card';
import api from '../../src/api/client';

export default function AdminFinance() {
  const [finance, setFinance] = useState<FinanceSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFinance = async () => {
    try {
      const response = await api.get('/finance/summary');
      setFinance(response.data);
    } catch (error) {
      console.error('Error fetching finance:', error);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFinance();
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
          <Text style={styles.title}>Finanzas</Text>
          <Text style={styles.subtitle}>Control financiero de HAMMR</Text>
        </View>

        {/* Main Revenue Card */}
        <Card style={styles.mainCard}>
          <View style={styles.mainHeader}>
            <Ionicons name="trending-up" size={32} color="#16a34a" />
            <Text style={styles.mainLabel}>Ingresos por Comisiones</Text>
          </View>
          <Text style={styles.mainAmount}>
            ${finance?.total_commissions?.toFixed(2) || '0.00'}
          </Text>
          <Text style={styles.mainSubtext}>10% de cada transacción completada</Text>
        </Card>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="cash" size={24} color="#16a34a" />
            </View>
            <Text style={styles.statLabel}>Volumen Total</Text>
            <Text style={styles.statValue}>
              ${finance?.total_revenue?.toFixed(2) || '0.00'}
            </Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="time" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.statLabel}>En Escrow</Text>
            <Text style={styles.statValue}>
              ${finance?.pending_payouts?.toFixed(2) || '0.00'}
            </Text>
          </Card>
        </View>

        {/* Jobs Stats */}
        <Card style={styles.jobsCard}>
          <Text style={styles.sectionTitle}>Estadísticas de Trabajos</Text>
          <View style={styles.jobsGrid}>
            <View style={styles.jobItem}>
              <Text style={styles.jobValue}>{finance?.total_jobs || 0}</Text>
              <Text style={styles.jobLabel}>Total</Text>
            </View>
            <View style={styles.jobDivider} />
            <View style={styles.jobItem}>
              <Text style={styles.jobValue}>{finance?.completed_jobs || 0}</Text>
              <Text style={styles.jobLabel}>Completados</Text>
            </View>
            <View style={styles.jobDivider} />
            <View style={styles.jobItem}>
              <Text style={styles.jobValue}>
                {finance?.total_jobs ? ((finance.completed_jobs / finance.total_jobs) * 100).toFixed(0) : 0}%
              </Text>
              <Text style={styles.jobLabel}>Tasa Éxito</Text>
            </View>
          </View>
        </Card>

        {/* Revenue Sources */}
        <Text style={styles.sectionTitleOutside}>Fuentes de Ingresos</Text>
        <Card style={styles.sourcesCard}>
          <View style={styles.sourceItem}>
            <View style={styles.sourceLeft}>
              <View style={[styles.sourceIcon, { backgroundColor: '#dcfce7' }]}>
                <Ionicons name="cash" size={20} color="#16a34a" />
              </View>
              <View>
                <Text style={styles.sourceName}>Comisiones</Text>
                <Text style={styles.sourceDesc}>10% por trabajo</Text>
              </View>
            </View>
            <View style={styles.sourceRight}>
              <Text style={styles.sourceAmount}>
                ${finance?.total_commissions?.toFixed(2) || '0.00'}
              </Text>
              <Text style={styles.sourcePercent}>100%</Text>
            </View>
          </View>

          <View style={styles.sourceDivider} />

          <View style={styles.sourceItem}>
            <View style={styles.sourceLeft}>
              <View style={[styles.sourceIcon, { backgroundColor: '#eff6ff' }]}>
                <Ionicons name="star" size={20} color="#2563eb" />
              </View>
              <View>
                <Text style={styles.sourceName}>Suscripciones</Text>
                <Text style={styles.sourceDesc}>Proveedores Premium</Text>
              </View>
            </View>
            <View style={styles.sourceRight}>
              <Text style={styles.sourceAmount}>$0.00</Text>
              <Text style={styles.sourcePercent}>0%</Text>
            </View>
          </View>

          <View style={styles.sourceDivider} />

          <View style={styles.sourceItem}>
            <View style={styles.sourceLeft}>
              <View style={[styles.sourceIcon, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="megaphone" size={20} color="#f59e0b" />
              </View>
              <View>
                <Text style={styles.sourceName}>Publicidad</Text>
                <Text style={styles.sourceDesc}>Servicios destacados</Text>
              </View>
            </View>
            <View style={styles.sourceRight}>
              <Text style={styles.sourceAmount}>$0.00</Text>
              <Text style={styles.sourcePercent}>0%</Text>
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
    marginTop: 4,
  },
  mainCard: {
    backgroundColor: '#0f172a',
    marginBottom: 20,
    alignItems: 'center',
  },
  mainHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  mainLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },
  mainAmount: {
    fontSize: 48,
    fontWeight: '800',
    color: '#ffffff',
  },
  mainSubtext: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  statsGrid: {
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
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
  jobsCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  sectionTitleOutside: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  jobsGrid: {
    flexDirection: 'row',
  },
  jobItem: {
    flex: 1,
    alignItems: 'center',
  },
  jobValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2563eb',
  },
  jobLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  jobDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  sourcesCard: {},
  sourceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sourceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  sourceDesc: {
    fontSize: 12,
    color: '#64748b',
  },
  sourceRight: {
    alignItems: 'flex-end',
  },
  sourceAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  sourcePercent: {
    fontSize: 11,
    color: '#64748b',
  },
  sourceDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
});
