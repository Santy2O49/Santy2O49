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
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);

  const handleRegister = async () => {
    if (!fullName || !email || !phone || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const success = await register({
      full_name: fullName,
      email,
      phone,
      password,
      role,
    });

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
        }
      }
    }
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Únete a HAMMR</Text>
          </View>

          <View style={styles.form}>
            {/* Role Selection */}
            <Text style={styles.label}>¿Cómo quieres usar HAMMR?</Text>
            <View style={styles.roleSelector}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === UserRole.CUSTOMER && styles.roleButtonActive,
                ]}
                onPress={() => setRole(UserRole.CUSTOMER)}
              >
                <Ionicons
                  name="person"
                  size={24}
                  color={role === UserRole.CUSTOMER ? '#ffffff' : '#64748b'}
                />
                <Text
                  style={[
                    styles.roleText,
                    role === UserRole.CUSTOMER && styles.roleTextActive,
                  ]}
                >
                  Cliente
                </Text>
                <Text
                  style={[
                    styles.roleDesc,
                    role === UserRole.CUSTOMER && styles.roleDescActive,
                  ]}
                >
                  Busco servicios
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === UserRole.CONTRACTOR && styles.roleButtonActive,
                ]}
                onPress={() => setRole(UserRole.CONTRACTOR)}
              >
                <Ionicons
                  name="construct"
                  size={24}
                  color={role === UserRole.CONTRACTOR ? '#ffffff' : '#64748b'}
                />
                <Text
                  style={[
                    styles.roleText,
                    role === UserRole.CONTRACTOR && styles.roleTextActive,
                  ]}
                >
                  Proveedor
                </Text>
                <Text
                  style={[
                    styles.roleDesc,
                    role === UserRole.CONTRACTOR && styles.roleDescActive,
                  ]}
                >
                  Ofrezco servicios
                </Text>
              </TouchableOpacity>
            </View>

            <Input
              label="Nombre Completo"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Juan Pérez"
            />
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Teléfono"
              value={phone}
              onChangeText={setPhone}
              placeholder="7000-0000"
              keyboardType="phone-pad"
            />
            <Input
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <Button
              title="Crear Cuenta"
              onPress={handleRegister}
              loading={isLoading}
              style={styles.registerButton}
            />

            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.loginLink}
            >
              <Text style={styles.loginText}>
                ¿Ya tienes cuenta? <Text style={styles.loginBold}>Inicia Sesión</Text>
              </Text>
            </TouchableOpacity>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    marginTop: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
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
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
  },
  roleTextActive: {
    color: '#ffffff',
  },
  roleDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  roleDescActive: {
    color: '#bfdbfe',
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  registerButton: {
    marginTop: 8,
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    color: '#64748b',
    fontSize: 14,
  },
  loginBold: {
    color: '#2563eb',
    fontWeight: '600',
  },
});
