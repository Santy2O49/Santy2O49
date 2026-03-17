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
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { UserRole } from '../../src/types';
import { t } from '../../src/i18n/translations';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminTapCount, setAdminTapCount] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

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
    let loginEmail = '';
    switch (role) {
      case 'customer':
        loginEmail = 'customer1@hammr.com';
        break;
      case 'contractor':
        loginEmail = 'contractor1@hammr.com';
        break;
      case 'admin':
        loginEmail = 'admin@hammr.com';
        break;
    }
    setEmail(loginEmail);
    setPassword(role === 'admin' ? 'admin123' : 'password123');
  };

  // Secret admin access - tap 5 times on copyright
  const handleCopyrightTap = () => {
    const newCount = adminTapCount + 1;
    setAdminTapCount(newCount);
    if (newCount >= 5) {
      setShowAdminLogin(true);
      setAdminTapCount(0);
    }
    // Reset after 3 seconds if not completed
    setTimeout(() => setAdminTapCount(0), 3000);
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
            <Text style={styles.subtitle}>{t('login')}</Text>
          </View>

          <View style={styles.form}>
            <Input
              label={t('email')}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label={t('password')}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />

            {error && (
              <Text style={styles.error}>{error}</Text>
            )}

            <Button
              title={t('login')}
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginButton}
            />

            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              style={styles.registerLink}
            >
              <Text style={styles.registerText}>
                {t('noAccount')} <Text style={styles.registerBold}>{t('signUp')}</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Demo Quick Login Buttons - Only Customer and Contractor */}
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>Demo - {t('home')}:</Text>
            <View style={styles.demoButtons}>
              <TouchableOpacity
                style={[styles.demoButton, { backgroundColor: '#16a34a' }]}
                onPress={() => quickLogin('customer')}
              >
                <Text style={styles.demoButtonText}>{t('customer')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.demoButton, { backgroundColor: '#2563eb' }]}
                onPress={() => quickLogin('contractor')}
              >
                <Text style={styles.demoButtonText}>{t('contractor')}</Text>
              </TouchableOpacity>
              {showAdminLogin && (
                <TouchableOpacity
                  style={[styles.demoButton, { backgroundColor: '#dc2626' }]}
                  onPress={() => quickLogin('admin')}
                >
                  <Text style={styles.demoButtonText}>{t('admin')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Footer with secret admin access */}
          <View style={styles.footer}>
            <Pressable onPress={handleCopyrightTap}>
              <Text style={styles.copyright}>{t('allRightsReserved')}</Text>
            </Pressable>
            {showAdminLogin && (
              <TouchableOpacity onPress={() => quickLogin('admin')}>
                <Text style={styles.adminLink}>Admin Access</Text>
              </TouchableOpacity>
            )}
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
    justifyContent: 'center',
    gap: 12,
  },
  demoButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  demoButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
    alignItems: 'center',
  },
  copyright: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
  },
  adminLink: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 8,
    textDecorationLine: 'underline',
  },
});
