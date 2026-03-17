import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import api from '../../src/api/client';

export default function AdminAITools() {
  // Pricing State
  const [jobType, setJobType] = useState('Plumbing Repair');
  const [complexity, setComplexity] = useState('Medium');
  const [location, setLocation] = useState('San Salvador');
  const [demand, setDemand] = useState('Normal');
  const [pricingResult, setPricingResult] = useState<any>(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  // Marketing State
  const [segment, setSegment] = useState('Homeowners');
  const [category, setCategory] = useState('House Cleaning');
  const [platform, setPlatform] = useState('Facebook');
  const [marketingResult, setMarketingResult] = useState<string>('');
  const [marketingLoading, setMarketingLoading] = useState(false);

  const handlePricing = async () => {
    setPricingLoading(true);
    setPricingResult(null);
    try {
      const response = await api.post('/ai/pricing', {
        job_type: jobType,
        complexity,
        location,
        demand,
      });
      setPricingResult(response.data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to get pricing');
    } finally {
      setPricingLoading(false);
    }
  };

  const handleMarketing = async () => {
    setMarketingLoading(true);
    setMarketingResult('');
    try {
      const response = await api.post('/ai/marketing', {
        segment,
        category,
        platform,
      });
      setMarketingResult(response.data.ad_copy);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to generate copy');
    } finally {
      setMarketingLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Tools</Text>
          <Text style={styles.subtitle}>Powered by Gemini AI</Text>
        </View>

        {/* AI Pricing Engine */}
        <Card style={styles.toolCard}>
          <View style={styles.toolHeader}>
            <View style={[styles.toolIcon, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="calculator" size={24} color="#16a34a" />
            </View>
            <View>
              <Text style={styles.toolTitle}>AI Pricing Engine</Text>
              <Text style={styles.toolDesc}>Calculate fair market prices</Text>
            </View>
          </View>

          <Input
            label="Job Type"
            value={jobType}
            onChangeText={setJobType}
            placeholder="Plumbing Repair"
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Complexity</Text>
              <View style={styles.pickerContainer}>
                <TextInput
                  style={styles.picker}
                  value={complexity}
                  onChangeText={setComplexity}
                  placeholder="Low/Medium/High"
                />
              </View>
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Demand</Text>
              <View style={styles.pickerContainer}>
                <TextInput
                  style={styles.picker}
                  value={demand}
                  onChangeText={setDemand}
                  placeholder="Low/Normal/High"
                />
              </View>
            </View>
          </View>

          <Input
            label="Location"
            value={location}
            onChangeText={setLocation}
            placeholder="San Salvador"
          />

          <Button
            title="Calculate Price"
            onPress={handlePricing}
            loading={pricingLoading}
            variant="success"
          />

          {pricingResult && (
            <View style={styles.resultBox}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Base Price:</Text>
                <Text style={styles.resultValue}>${pricingResult.base_price?.toFixed(2)}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Final Price:</Text>
                <Text style={styles.resultFinal}>${pricingResult.final_price?.toFixed(2)}</Text>
              </View>
              <Text style={styles.resultExplanation}>{pricingResult.explanation}</Text>
            </View>
          )}
        </Card>

        {/* AI Marketing Assistant */}
        <Card style={styles.toolCard}>
          <View style={styles.toolHeader}>
            <View style={[styles.toolIcon, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="megaphone" size={24} color="#2563eb" />
            </View>
            <View>
              <Text style={styles.toolTitle}>AI Marketing Assistant</Text>
              <Text style={styles.toolDesc}>Generate ad copy with AI</Text>
            </View>
          </View>

          <Input
            label="Target Segment"
            value={segment}
            onChangeText={setSegment}
            placeholder="Homeowners in San Salvador"
          />

          <Input
            label="Service Category"
            value={category}
            onChangeText={setCategory}
            placeholder="House Cleaning"
          />

          <Input
            label="Platform"
            value={platform}
            onChangeText={setPlatform}
            placeholder="Facebook/Instagram/TikTok"
          />

          <Button
            title="Generate Ad Copy"
            onPress={handleMarketing}
            loading={marketingLoading}
          />

          {marketingLoading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#2563eb" />
              <Text style={styles.loadingText}>Generating with Gemini AI...</Text>
            </View>
          )}

          {marketingResult && (
            <View style={styles.adCopyBox}>
              <Text style={styles.adCopyLabel}>Generated Ad Copy:</Text>
              <Text style={styles.adCopyText}>{marketingResult}</Text>
            </View>
          )}
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
  toolCard: {
    marginBottom: 20,
  },
  toolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  toolTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  toolDesc: {
    fontSize: 13,
    color: '#64748b',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  pickerContainer: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
  },
  picker: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  resultBox: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 14,
    color: '#374151',
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  resultFinal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#16a34a',
  },
  resultExplanation: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    fontStyle: 'italic',
  },
  loadingBox: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
  },
  adCopyBox: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  adCopyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 8,
  },
  adCopyText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 22,
  },
});
