import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { UserRole } from '../../src/types';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const success = await login(email, password);
    if (success) {
      const user = useAuthStore.getState().user;
      if (user) {
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
        }
      }
    }
  };

  const quickLogin = async (role: string) => {
    let email = '';
    switch (role) {
      case 'customer':
        email = 'customer1@hammr.com';
        break;
      case 'contractor':
        email = 'contractor1@hammr.com';
        break;
      case 'admin':
        email = 'admin@hammr.com';
        break;
    }
    setEmail(email);
    setPassword(role === 'admin' ? 'admin123' : 'password123');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.logo}>HAMMR</Text>
            <Text style={styles.subtitle}>Iniciar Sesión</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />

            {error && (
              <Text style={styles.error}>{error}</Text>
            )}

            <Button
              title="Iniciar Sesión"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginButton}
            />

            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              style={styles.registerLink}
            >
              <Text style={styles.registerText}>
                ¿No tienes cuenta? <Text style={styles.registerBold}>Regístrate</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Login Buttons for Demo */}
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>Demo - Acceso Rápido:</Text>
            <View style={styles.demoButtons}>
              <TouchableOpacity
                style={[styles.demoButton, { backgroundColor: '#16a34a' }]}
                onPress={() => quickLogin('customer')}
              >
                <Text style={styles.demoButtonText}>Cliente</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.demoButton, { backgroundColor: '#2563eb' }]}
                onPress={() => quickLogin('contractor')}
              >
                <Text style={styles.demoButtonText}>Proveedor</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.demoButton, { backgroundColor: '#dc2626' }]}
                onPress={() => quickLogin('admin')}
              >
                <Text style={styles.demoButtonText}>Admin</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    fontSize: 48,
    fontWeight: '800',
    color: '#2563eb',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 20,
    color: '#64748b',
    marginTop: 8,
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    color: '#64748b',
    fontSize: 14,
  },
  registerBold: {
    color: '#2563eb',
    fontWeight: '600',
  },
  demoSection: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  demoTitle: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  demoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  demoButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  demoButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
});
