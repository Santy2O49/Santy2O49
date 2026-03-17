import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../src/store/themeStore';
import api from '../../src/api/client';

const { width } = Dimensions.get('window');
const EL_SALVADOR_LAT = 13.6929;
const EL_SALVADOR_LNG = -89.2182;

export default function ServiceRequest() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors, mode } = useThemeStore();

  const serviceName = (params.serviceName as string) || 'Service';
  const basePrice = parseFloat(params.basePrice as string) || 50;
  const serviceId = params.serviceId as string;

  const minPrice = Math.round(basePrice * 0.85);
  const maxPrice = Math.round(basePrice * 1.2);

  const [price, setPrice] = useState(basePrice);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('San Salvador, El Salvador');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePriceChange = (direction: 'up' | 'down') => {
    if (direction === 'up' && price < maxPrice) setPrice(price + 1);
    else if (direction === 'down' && price > minPrice) setPrice(price - 1);
  };

  const handleSubmit = async () => {
    if (!description) {
      Alert.alert('Error', 'Please describe the job you need');
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
      Alert.alert('Request Sent!', 'Providers in your area will receive your request.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Could not submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pricePercentage = Math.round(((price - basePrice) / basePrice) * 100);

  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${EL_SALVADOR_LNG - 0.03},${EL_SALVADOR_LAT - 0.02},${EL_SALVADOR_LNG + 0.03},${EL_SALVADOR_LAT + 0.02}&layer=mapnik&marker=${EL_SALVADOR_LAT},${EL_SALVADOR_LNG}`;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} data-testid="service-request">
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <TouchableOpacity onPress={() => router.back()} data-testid="back-btn">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.routeInfo}>
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: colors.accent }]} />
            <TextInput
              style={[styles.routeInput, { color: colors.text }]}
              value={location}
              onChangeText={setLocation}
              placeholder="Your location"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: colors.danger }]} />
            <Text style={[styles.routeText, { color: colors.text }]}>{serviceName}</Text>
          </View>
        </View>
      </View>

      {/* Mini Map */}
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
            title="Service Area"
          />
        ) : (
          <View style={[styles.mapPlaceholder, { backgroundColor: colors.surfaceAlt }]}>
            <Ionicons name="location" size={36} color={colors.accent} />
            <Text style={[{ color: colors.textSecondary, marginTop: 6 }]}>Service Area</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* Service Card with Price */}
        <View style={[styles.serviceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.serviceCardHeader}>
            <View style={[styles.serviceIconLarge, { backgroundColor: colors.surfaceAlt }]}>
              <Ionicons name="construct" size={28} color={colors.accent} />
            </View>
            <View style={styles.serviceCardInfo}>
              <Text style={[styles.serviceCardName, { color: colors.text }]}>{serviceName}</Text>
              <Text style={[styles.serviceCardDesc, { color: colors.textMuted }]}>Professional service</Text>
            </View>
          </View>

          {/* Price Adjuster */}
          <View style={[styles.priceAdjuster, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.priceButton, { backgroundColor: colors.surfaceAlt }]}
              onPress={() => handlePriceChange('down')}
              disabled={price <= minPrice}
            >
              <Ionicons name="remove" size={22} color={price <= minPrice ? colors.textMuted : colors.text} />
            </TouchableOpacity>
            <View style={styles.priceDisplay}>
              <Text style={[styles.priceAmount, { color: colors.text }]}>${price.toFixed(2)}</Text>
              <Text style={[styles.priceRecommended, { color: colors.textMuted }]}>
                Recommended: ${basePrice.toFixed(2)}
              </Text>
              {pricePercentage !== 0 && (
                <Text style={[styles.pricePercent, { color: pricePercentage < 0 ? colors.danger : colors.success }]}>
                  {pricePercentage > 0 ? '+' : ''}{pricePercentage}%
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={[styles.priceButton, { backgroundColor: colors.surfaceAlt }]}
              onPress={() => handlePriceChange('up')}
              disabled={price >= maxPrice}
            >
              <Ionicons name="add" size={22} color={price >= maxPrice ? colors.textMuted : colors.text} />
            </TouchableOpacity>
          </View>

          {/* Price Range Bar */}
          <View style={styles.priceRange}>
            <Text style={[styles.priceRangeText, { color: colors.textMuted }]}>${minPrice}</Text>
            <View style={[styles.priceRangeBar, { backgroundColor: colors.border }]}>
              <View style={[styles.priceRangeFill, { width: `${((price - minPrice) / (maxPrice - minPrice)) * 100}%`, backgroundColor: colors.accent }]} />
            </View>
            <Text style={[styles.priceRangeText, { color: colors.textMuted }]}>${maxPrice}</Text>
          </View>
        </View>

        {/* Description */}
        <TextInput
          style={[styles.descriptionInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the job you need..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={3}
          data-testid="job-description-input"
        />

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.accent }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          data-testid="submit-request-btn"
        >
          <Text style={[styles.submitText, { color: colors.accentText }]}>
            {isSubmitting ? 'Submitting...' : 'Find Providers'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  routeInfo: { flex: 1, marginLeft: 10 },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  routeDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  routeInput: { flex: 1, fontSize: 15 },
  routeText: { flex: 1, fontSize: 15 },
  mapContainer: { height: 160 },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: { flex: 1, padding: 16 },
  serviceCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  serviceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  serviceIconLarge: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceCardInfo: { marginLeft: 12 },
  serviceCardName: { fontSize: 16, fontWeight: '600' },
  serviceCardDesc: { fontSize: 13, marginTop: 2 },
  priceAdjuster: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  priceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceDisplay: { alignItems: 'center', marginHorizontal: 20 },
  priceAmount: { fontSize: 28, fontWeight: '700' },
  priceRecommended: { fontSize: 11, marginTop: 4 },
  pricePercent: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  priceRange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  priceRangeText: { fontSize: 11 },
  priceRangeBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  priceRangeFill: { height: '100%', borderRadius: 2 },
  descriptionInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 14,
    borderWidth: 1,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitText: { fontSize: 16, fontWeight: '700' },
});
