import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/api/client';
import { t } from '../../src/i18n/translations';

const { width } = Dimensions.get('window');

export default function ServiceRequest() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const serviceName = params.serviceName as string || 'Servicio';
  const basePrice = parseFloat(params.basePrice as string) || 50;
  const serviceId = params.serviceId as string;

  // Price can be adjusted 15% below base price
  const minPrice = Math.round(basePrice * 0.85);
  const maxPrice = Math.round(basePrice * 1.2);
  
  const [price, setPrice] = useState(basePrice);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('San Salvador, El Salvador');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePriceChange = (direction: 'up' | 'down') => {
    const step = 1;
    if (direction === 'up' && price < maxPrice) {
      setPrice(price + step);
    } else if (direction === 'down' && price > minPrice) {
      setPrice(price - step);
    }
  };

  const handleSubmit = async () => {
    if (!description) {
      Alert.alert('Error', 'Por favor describe el trabajo que necesitas');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/jobs', {
        service_id: serviceId,
        description,
        location,
        budget: price,
      });
      Alert.alert(
        '¡Solicitud enviada!',
        'Proveedores en tu área recibirán tu solicitud. Te contactarán pronto.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'No se pudo enviar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pricePercentage = Math.round(((price - basePrice) / basePrice) * 100);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Route Info */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <View style={styles.routeInfo}>
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: '#c8ff00' }]} />
            <TextInput
              style={styles.routeInput}
              value={location}
              onChangeText={setLocation}
              placeholder="Tu ubicación"
              placeholderTextColor="#6b7280"
            />
            <Text style={styles.portalText}>Portal</Text>
          </View>
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.routeText}>{serviceName}</Text>
            <TouchableOpacity>
              <Ionicons name="add" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="location" size={48} color="#3b82f6" />
          <Text style={styles.mapText}>Área de servicio</Text>
        </View>
        
        <TouchableOpacity style={styles.backMapButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Promo Banner */}
      <TouchableOpacity style={styles.promoBanner}>
        <Ionicons name="pricetag" size={20} color="#ffffff" />
        <Text style={styles.promoText}>¿Tienes un código promocional? Úsalo aquí</Text>
        <Ionicons name="chevron-forward" size={20} color="#6b7280" />
      </TouchableOpacity>

      {/* Price Selection */}
      <View style={styles.priceSection}>
        {/* Service Type Card */}
        <View style={styles.serviceCard}>
          <View style={styles.serviceCardHeader}>
            <View style={styles.serviceCardLeft}>
              <View style={styles.serviceIconLarge}>
                <Ionicons name="construct" size={32} color="#c8ff00" />
              </View>
              <View style={styles.serviceCardInfo}>
                <View style={styles.serviceNameRow}>
                  <Text style={styles.serviceCardName}>{serviceName}</Text>
                  <TouchableOpacity>
                    <Ionicons name="information-circle-outline" size={18} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.serviceCardDesc}>Servicio profesional</Text>
              </View>
            </View>
            <TouchableOpacity>
              <Ionicons name="pencil" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Price Adjuster */}
          <View style={styles.priceAdjuster}>
            <TouchableOpacity 
              style={styles.priceButton}
              onPress={() => handlePriceChange('down')}
              disabled={price <= minPrice}
            >
              <Ionicons 
                name="remove" 
                size={24} 
                color={price <= minPrice ? '#4b5563' : '#ffffff'} 
              />
            </TouchableOpacity>
            
            <View style={styles.priceDisplay}>
              <Text style={styles.priceAmount}>${price.toFixed(2)}</Text>
              <Text style={styles.priceRecommended}>
                Tarifa recomendada: ${basePrice.toFixed(2)}
              </Text>
              {pricePercentage !== 0 && (
                <Text style={[
                  styles.pricePercent,
                  { color: pricePercentage < 0 ? '#ef4444' : '#22c55e' }
                ]}>
                  {pricePercentage > 0 ? '+' : ''}{pricePercentage}%
                </Text>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.priceButton}
              onPress={() => handlePriceChange('up')}
              disabled={price >= maxPrice}
            >
              <Ionicons 
                name="add" 
                size={24} 
                color={price >= maxPrice ? '#4b5563' : '#ffffff'} 
              />
            </TouchableOpacity>
          </View>

          {/* Price Range Indicator */}
          <View style={styles.priceRange}>
            <Text style={styles.priceRangeText}>Min: ${minPrice}</Text>
            <View style={styles.priceRangeBar}>
              <View 
                style={[
                  styles.priceRangeFill,
                  { width: `${((price - minPrice) / (maxPrice - minPrice)) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.priceRangeText}>Max: ${maxPrice}</Text>
          </View>
        </View>

        {/* Description Input */}
        <TextInput
          style={styles.descriptionInput}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe el trabajo que necesitas..."
          placeholderTextColor="#6b7280"
          multiline
          numberOfLines={3}
        />

        {/* Auto Accept Toggle */}
        <View style={styles.autoAcceptRow}>
          <Ionicons name="flash" size={24} color="#6b7280" />
          <Text style={styles.autoAcceptText}>
            Aceptar automáticamente ofertas de ${price.toFixed(2)}
          </Text>
          <View style={styles.toggleOff}>
            <View style={styles.toggleCircle} />
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitRow}>
          <View style={styles.batteryIndicator}>
            <Ionicons name="battery-half" size={24} color="#22c55e" />
          </View>
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitText}>
              {isSubmitting ? 'Enviando...' : 'Encontrar proveedores'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#262626',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeInfo: {
    flex: 1,
    marginLeft: 8,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  routeInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
  routeText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
  portalText: {
    color: '#6b7280',
    fontSize: 14,
  },
  mapContainer: {
    height: 200,
    backgroundColor: '#1e293b',
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapText: {
    color: '#9ca3af',
    marginTop: 8,
  },
  backMapButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#262626',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  promoText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    marginLeft: 12,
  },
  priceSection: {
    flex: 1,
    padding: 16,
  },
  serviceCard: {
    backgroundColor: '#262626',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  serviceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  serviceCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIconLarge: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceCardInfo: {
    marginLeft: 12,
  },
  serviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceCardName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  serviceCardDesc: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 2,
  },
  priceAdjuster: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  priceButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceDisplay: {
    alignItems: 'center',
    marginHorizontal: 24,
  },
  priceAmount: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
  },
  priceRecommended: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  pricePercent: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  priceRange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  priceRangeText: {
    color: '#6b7280',
    fontSize: 11,
  },
  priceRangeBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  priceRangeFill: {
    height: '100%',
    backgroundColor: '#c8ff00',
    borderRadius: 2,
  },
  descriptionInput: {
    backgroundColor: '#262626',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  autoAcceptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#262626',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  autoAcceptText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    marginLeft: 12,
  },
  toggleOff: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#333',
    padding: 2,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6b7280',
  },
  submitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  batteryIndicator: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#c8ff00',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '700',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
