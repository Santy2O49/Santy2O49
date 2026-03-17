import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { Service, Job } from '../../src/types';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { ServiceIcon } from '../../src/components/ServiceIcon';
import api from '../../src/api/client';

export default function CustomerHome() {
  const { user } = useAuthStore();
  const [services, setServices] = useState<Service[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('San Salvador');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchServices();
    setRefreshing(false);
  };

  const handleServicePress = (service: Service) => {
    setSelectedService(service);
    setDescription('');
    setModalVisible(true);
  };

  const handleBookService = async () => {
    if (!selectedService || !description) {
      Alert.alert('Error', 'Por favor describe el trabajo que necesitas');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/jobs', {
        service_id: selectedService.id,
        description,
        location,
        budget: selectedService.base_price,
      });
      Alert.alert('Éxito', '¡Solicitud enviada! Un proveedor te contactará pronto.');
      setModalVisible(false);
      setSelectedService(null);
      setDescription('');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'No se pudo crear el trabajo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const featuredServices = services.filter(s => s.is_featured);
  const categories = [...new Set(services.map(s => s.category))];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {user?.full_name?.split(' ')[0]} 👋</Text>
            <Text style={styles.subtitle}>¿Qué servicio necesitas hoy?</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar servicios..."
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Featured Services */}
        {featuredServices.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Servicios Destacados</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {featuredServices.map(service => (
                <TouchableOpacity
                  key={service.id}
                  style={styles.featuredCard}
                  onPress={() => handleServicePress(service)}
                >
                  <View style={styles.featuredIcon}>
                    <ServiceIcon icon={service.icon} size={28} color="#ffffff" />
                  </View>
                  <Text style={styles.featuredName}>{service.name}</Text>
                  <Text style={styles.featuredPrice}>Desde ${service.base_price}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* All Services by Category */}
        {categories.map(category => (
          <View key={category} style={styles.section}>
            <Text style={styles.sectionTitle}>{category}</Text>
            <View style={styles.servicesGrid}>
              {services
                .filter(s => s.category === category)
                .map(service => (
                  <TouchableOpacity
                    key={service.id}
                    style={styles.serviceCard}
                    onPress={() => handleServicePress(service)}
                  >
                    <View style={styles.serviceIcon}>
                      <ServiceIcon icon={service.icon} size={24} color="#2563eb" />
                    </View>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.servicePrice}>${service.base_price}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Book Service Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Solicitar Servicio</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            {selectedService && (
              <>
                <Card style={styles.servicePreview}>
                  <View style={styles.previewRow}>
                    <ServiceIcon icon={selectedService.icon} size={32} />
                    <View style={styles.previewInfo}>
                      <Text style={styles.previewName}>{selectedService.name}</Text>
                      <Text style={styles.previewPrice}>Precio base: ${selectedService.base_price}</Text>
                    </View>
                  </View>
                </Card>

                <Input
                  label="Describe el trabajo"
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Ej: Necesito reparar una tubería que gotea en el baño"
                  multiline
                  numberOfLines={4}
                  style={styles.textArea}
                />

                <Input
                  label="Ubicación"
                  value={location}
                  onChangeText={setLocation}
                  placeholder="San Salvador"
                />

                <Button
                  title="Enviar Solicitud"
                  onPress={handleBookService}
                  loading={isSubmitting}
                  variant="success"
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  featuredCard: {
    width: 140,
    backgroundColor: '#2563eb',
    borderRadius: 16,
    padding: 16,
    marginLeft: 20,
  },
  featuredIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featuredName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  featuredPrice: {
    fontSize: 12,
    color: '#bfdbfe',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  serviceCard: {
    width: '46%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    margin: '2%',
    alignItems: 'center',
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  servicePreview: {
    marginBottom: 20,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewInfo: {
    marginLeft: 16,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  previewPrice: {
    fontSize: 14,
    color: '#16a34a',
    marginTop: 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});
