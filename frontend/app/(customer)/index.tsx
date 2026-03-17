import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { MapComponent } from '../../src/components/MapComponent';
import { Service } from '../../src/types';
import api from '../../src/api/client';
import { t } from '../../src/i18n/translations';

const { height } = Dimensions.get('window');

const EL_SALVADOR_LAT = 13.6929;
const EL_SALVADOR_LNG = -89.2182;

const serviceCategories = [
  { id: 'repair', name: 'Reparación', icon: 'construct', color: '#3b82f6' },
  { id: 'cleaning', name: 'Limpieza', icon: 'sparkles', color: '#10b981' },
  { id: 'installation', name: 'Instalación', icon: 'hardware-chip', color: '#f59e0b' },
  { id: 'outdoor', name: 'Jardín', icon: 'leaf', color: '#22c55e' },
];

export default function CustomerHome() {
  const router = useRouter();
  const { colors, mode } = useThemeStore();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchServices();
    setRefreshing(false);
  };

  const handleServiceSelect = (service: Service) => {
    router.push({
      pathname: '/(customer)/request',
      params: { serviceId: service.id, serviceName: service.name, basePrice: service.base_price.toString() },
    });
  };

  function getServiceIcon(icon: string): any {
    const map: Record<string, string> = {
      plumbing: 'water', electrical: 'flash', paint: 'color-palette',
      garden: 'leaf', carpentry: 'hammer', ac: 'snow',
      cleaning: 'sparkles', roof: 'home', appliance: 'hardware-chip', moving: 'car',
    };
    return map[icon] || 'construct';
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} data-testid="customer-home">
      <View style={styles.mapContainer}>
        <MapComponent
          latitude={EL_SALVADOR_LAT}
          longitude={EL_SALVADOR_LNG}
          darkMode={mode === 'dark'}
          height={height * 0.32}
          colors={colors}
        />
        <View style={[styles.locationBadge, { backgroundColor: colors.surface + 'F0' }]}>
          <Ionicons name="location" size={14} color={colors.accent} />
          <View style={{ marginLeft: 8 }}>
            <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>Service point</Text>
            <Text style={[styles.locationAddress, { color: colors.text }]}>San Salvador, SV</Text>
          </View>
        </View>
      </View>

      <View style={[styles.bottomSheet, { backgroundColor: colors.background }]}>
        <View style={styles.sheetHandle}>
          <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContent}>
            {serviceCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryButton, { backgroundColor: colors.surface }, selectedCategory === cat.id && { backgroundColor: cat.color }]}
                onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              >
                <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}>
                  <Ionicons name={cat.icon as any} size={22} color={cat.color} />
                </View>
                <Text style={[styles.categoryText, { color: selectedCategory === cat.id ? '#fff' : colors.text }]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <Text style={[styles.searchText, { color: colors.textMuted }]}>{t('searchServices')}</Text>
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('featuredServices')}</Text>
          {services.slice(0, 6).map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[styles.serviceItem, { backgroundColor: colors.surface }]}
              onPress={() => handleServiceSelect(service)}
            >
              <View style={[styles.serviceIconContainer, { backgroundColor: colors.surfaceAlt }]}>
                <Ionicons name={getServiceIcon(service.icon)} size={22} color={colors.accent} />
              </View>
              <View style={styles.serviceInfo}>
                <Text style={[styles.serviceName, { color: colors.text }]}>{service.name}</Text>
                <Text style={[styles.serviceDescription, { color: colors.textSecondary }]}>{service.description}</Text>
              </View>
              <View style={styles.servicePriceContainer}>
                <Text style={[styles.servicePrice, { color: colors.accent }]}>${service.base_price}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: { height: Dimensions.get('window').height * 0.32, position: 'relative' },
  locationBadge: {
    position: 'absolute', top: 56, right: 16,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10,
  },
  locationLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  locationAddress: { fontSize: 13, fontWeight: '600' },
  bottomSheet: { flex: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -20 },
  sheetHandle: { alignItems: 'center', paddingTop: 10, paddingBottom: 6 },
  handleBar: { width: 36, height: 4, borderRadius: 2 },
  categoriesContent: { paddingHorizontal: 16, paddingBottom: 8, gap: 10 },
  categoryButton: { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, marginRight: 4 },
  categoryIcon: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  categoryText: { fontSize: 11, fontWeight: '600' },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginVertical: 12, paddingHorizontal: 16, paddingVertical: 13, borderRadius: 12, borderWidth: 1 },
  searchText: { fontSize: 15, marginLeft: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, paddingHorizontal: 16 },
  serviceItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 14, marginHorizontal: 16, marginBottom: 8 },
  serviceIconContainer: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  serviceInfo: { flex: 1, marginLeft: 12 },
  serviceName: { fontSize: 14, fontWeight: '600' },
  serviceDescription: { fontSize: 12, marginTop: 2 },
  servicePriceContainer: { flexDirection: 'row', alignItems: 'center' },
  servicePrice: { fontSize: 15, fontWeight: '700', marginRight: 6 },
});
