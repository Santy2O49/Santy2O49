import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { UserRole } from '../src/types';
import api from '../src/api/client';

const { width } = Dimensions.get('window');

export default function Index() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Seed database on first load
    const seedAndCheck = async () => {
      try {
        await api.post('/seed');
      } catch (e) {
        // Ignore if already seeded
      }
      
      // Short delay for splash effect
      setTimeout(() => {
        setIsReady(true);
      }, 1500);
    };
    
    seedAndCheck();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    if (!token || !user) {
      router.replace('/(auth)/login');
    } else {
      // Navigate based on role
      switch (user.role) {
        case UserRole.CUSTOMER:
          router.replace('/(customer)');
          break;
        case UserRole.CONTRACTOR:
          router.replace('/(contractor)');
          break;
        case UserRole.ADMIN:
          router.replace('/(admin)');
          break;
        default:
          router.replace('/(auth)/login');
      }
    }
  }, [isReady, token, user]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>HAMMR</Text>
        <Text style={styles.tagline}>Tu plataforma de servicios</Text>
      </View>
      <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
      <Text style={styles.version}>El Salvador</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 56,
    fontWeight: '800',
    color: '#2563eb',
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 8,
  },
  loader: {
    marginTop: 24,
  },
  version: {
    position: 'absolute',
    bottom: 40,
    color: '#64748b',
    fontSize: 14,
  },
});
