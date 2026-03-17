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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { Service } from '../../src/types';
import api from '../../src/api/client';
import { t } from '../../src/i18n/translations';

const { width, height } = Dimensions.get('window');

// Service category icons
const serviceCategories = [
  { id: 'repair', name: 'Reparación', icon: 'construct', color: '#3b82f6' },
  { id: 'cleaning', name: 'Limpieza', icon: 'sparkles', color: '#10b981' },
  { id: 'installation', name: 'Instalación', icon: 'hardware-chip', color: '#f59e0b' },
  { id: 'outdoor', name: 'Jardín', icon: 'leaf', color: '#22c55e' },
];

export default function CustomerHome() {
  const router = useRouter();
  const { user } = useAuthStore();
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

  const quickActions = [
    {
      id: 'emergency',
      title: 'Servicio urgente',
      description: 'Atención inmediata',
      icon: 'flash',
      color: '#ef4444',
    },
    {
      id: 'schedule',
      title: 'Programar',
      description: 'Elige fecha y hora',
      icon: 'calendar',
      color: '#3b82f6',
    },
  ];

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Map Background Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="location" size={48} color="#3b82f6" />
          <Text style={styles.mapText}>San Salvador, El Salvador</Text>
          <Text style={styles.mapSubtext}>Tu ubicación actual</Text>
        </View>

        {/* Location Pin */}
        <View style={styles.locationBadge}>
          <Ionicons name="location" size={16} color="#3b82f6" />
          <Text style={styles.locationText}>Punto de servicio</Text>
          <Text style={styles.locationAddress}>San Salvador, El Salvador</Text>
        </View>

        {/* My Location Button */}
        <TouchableOpacity style={styles.myLocationButton}>
          <Ionicons name="navigate" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#c8ff00" />
          }
        >
          {/* Service Categories */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {serviceCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(
                  selectedCategory === category.id ? null : category.id
                )}
              >
                <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                  <Ionicons name={category.icon as any} size={24} color={category.color} />
                </View>
                <Text style={styles.categoryText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Search Bar */}
          <TouchableOpacity 
            style={styles.searchBar}
            onPress={() => Alert.alert('Buscar', '¿Qué servicio necesitas?')}
          >
            <Ionicons name="search" size={20} color="#9ca3af" />
            <Text style={styles.searchText}>¿Qué servicio necesitas?</Text>
          </TouchableOpacity>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={() => router.push('/(customer)/request')}
              >
                <Text style={styles.quickActionTitle}>{action.title}</Text>
                <View style={styles.quickActionImagePlaceholder}>
                  <Ionicons name={action.icon as any} size={32} color={action.color} />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Services List */}
          <Text style={styles.sectionTitle}>Servicios populares</Text>
          {services.slice(0, 6).map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceItem}
              onPress={() => handleServiceSelect(service)}
            >
              <View style={styles.serviceIconContainer}>
                <Ionicons 
                  name={getServiceIcon(service.icon)} 
                  size={24} 
                  color="#c8ff00" 
                />
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
              </View>
              <View style={styles.servicePriceContainer}>
                <Text style={styles.servicePrice}>${service.base_price}</Text>
                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.spacer} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  mapContainer: {
    height: height * 0.35,
    backgroundColor: '#2d3748',
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
  },
  mapText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  mapSubtext: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 4,
  },
  locationBadge: {
    position: 'absolute',
    top: 60,
    left: '50%',
    transform: [{ translateX: -100 }],
    backgroundColor: 'rgba(30,30,30,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    width: 200,
  },
  locationText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  locationAddress: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 32,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 16,
  },
  categoriesContainer: {
    maxHeight: 100,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#262626',
    marginRight: 12,
  },
  categoryButtonActive: {
    backgroundColor: '#3b82f6',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#262626',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchText: {
    color: '#9ca3af',
    fontSize: 16,
    marginLeft: 12,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#262626',
    borderRadius: 16,
    padding: 16,
    height: 100,
    justifyContent: 'space-between',
  },
  quickActionTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionImagePlaceholder: {
    alignSelf: 'flex-end',
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#262626',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  serviceName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  serviceDescription: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 2,
  },
  servicePriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servicePrice: {
    color: '#c8ff00',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  spacer: {
    height: 20,
  },
});
