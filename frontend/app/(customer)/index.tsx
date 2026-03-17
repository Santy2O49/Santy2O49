import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { Service } from '../../src/types';
import api from '../../src/api/client';
import { t } from '../../src/i18n/translations';

const { width, height } = Dimensions.get('window');

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
  const { user } = useAuthStore();
  const { colors, mode } = useThemeStore();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

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
      params: { serviceId: service.id, serviceName: service.name, basePrice: service.base_price.toString() }
    });
  };

  function getServiceIcon(icon: string): any {
    const iconMap: Record<string, string> = {
      plumbing: 'water',
      electrical: 'flash',
      paint: 'color-palette',
      garden: 'leaf',
      carpentry: 'hammer',
      ac: 'snow',
      cleaning: 'sparkles',
      roof: 'home',
      appliance: 'hardware-chip',
      moving: 'car',
    };
    return iconMap[icon] || 'construct';
  }

  const mapTileStyle = mode === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${EL_SALVADOR_LNG - 0.05},${EL_SALVADOR_LAT - 0.03},${EL_SALVADOR_LNG + 0.05},${EL_SALVADOR_LAT + 0.03}&layer=mapnik&marker=${EL_SALVADOR_LAT},${EL_SALVADOR_LNG}`;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} data-testid="customer-home">
      {/* Map Area */}
      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
          <iframe
            src={osmUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              filter: mode === 'dark' ? 'invert(1) hue-rotate(180deg) brightness(0.9) contrast(1.1)' : 'none',
            }}
            title="Map"
          />
        ) : (
          <View style={[styles.mapPlaceholder, { backgroundColor: colors.surfaceAlt }]}>
            <Ionicons name="location" size={48} color={colors.accent} />
            <Text style={[styles.mapText, { color: colors.text }]}>San Salvador, El Salvador</Text>
            <Text style={[styles.mapSubtext, { color: colors.textSecondary }]}>Tu ubicación actual</Text>
          </View>
        )}

        {/* Location Badge */}
        <View style={[styles.locationBadge, { backgroundColor: colors.surface + 'F0' }]}>
          <Ionicons name="location" size={14} color={colors.accent} />
          <View style={{ marginLeft: 8 }}>
            <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>Service point</Text>
            <Text style={[styles.locationAddress, { color: colors.text }]}>San Salvador, SV</Text>
          </View>
        </View>
      </View>

      {/* Bottom Sheet */}
      <View style={[styles.bottomSheet, { backgroundColor: colors.background }]}>
        <View style={styles.sheetHandle}>
          <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
        >
          {/* Service Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          >
            {serviceCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  { backgroundColor: colors.surface },
                  selectedCategory === category.id && { backgroundColor: category.color },
                ]}
                onPress={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                data-testid={`category-${category.id}`}
              >
                <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                  <Ionicons name={category.icon as any} size={22} color={category.color} />
                </View>
                <Text style={[
                  styles.categoryText,
                  { color: selectedCategory === category.id ? '#fff' : colors.text },
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Search Bar */}
          <TouchableOpacity
            style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => Alert.alert('Buscar', '¿Qué servicio necesitas?')}
            data-testid="search-bar"
          >
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <Text style={[styles.searchText, { color: colors.textMuted }]}>
              {t('searchServices')}
            </Text>
          </TouchableOpacity>

          {/* Services List */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('featuredServices')}
          </Text>
          {services.slice(0, 6).map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[styles.serviceItem, { backgroundColor: colors.surface }]}
              onPress={() => handleServiceSelect(service)}
              data-testid={`service-${service.id}`}
            >
              <View style={[styles.serviceIconContainer, { backgroundColor: colors.surfaceAlt }]}>
                <Ionicons name={getServiceIcon(service.icon)} size={22} color={colors.accent} />
              </View>
              <View style={styles.serviceInfo}>
                <Text style={[styles.serviceName, { color: colors.text }]}>{service.name}</Text>
                <Text style={[styles.serviceDescription, { color: colors.textSecondary }]}>
                  {service.description}
                </Text>
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
  container: {
    flex: 1,
  },
  mapContainer: {
    height: height * 0.32,
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  mapSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  locationBadge: {
    position: 'absolute',
    top: 56,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  locationLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationAddress: {
    fontSize: 13,
    fontWeight: '600',
  },
  bottomSheet: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  sheetHandle: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 10,
  },
  categoryButton: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 4,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchText: {
    fontSize: 15,
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  serviceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
  },
  serviceDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  servicePriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: '700',
    marginRight: 6,
  },
});
