import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { t } from '../../src/i18n/translations';

export default function SettingsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { logout } = useAuthStore();
  
  const [darkMode, setDarkMode] = useState(true);
  const [distanceUnits, setDistanceUnits] = useState('Millas');
  const [language, setLanguage] = useState('Español');

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      t('logoutConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('yes'),
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar cuenta',
      '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Info', 'Funcionalidad próximamente');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
          <Ionicons name="menu" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración de la aplicación</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Settings Section */}
        <View style={styles.section}>
          {/* Appearance */}
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Apariencia</Text>
              <Text style={styles.settingValue}>{darkMode ? 'Oscuro' : 'Claro'}</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#333', true: '#c8ff00' }}
              thumbColor="#ffffff"
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Distance Units */}
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => {
              Alert.alert(
                'Unidades de distancia',
                'Selecciona las unidades',
                [
                  { text: 'Millas', onPress: () => setDistanceUnits('Millas') },
                  { text: 'Kilómetros', onPress: () => setDistanceUnits('Kilómetros') },
                ]
              );
            }}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Unidades de distancia</Text>
              <Text style={styles.settingValue}>{distanceUnits}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Language */}
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => {
              Alert.alert(
                'Idioma',
                'Selecciona el idioma',
                [
                  { text: 'Español', onPress: () => setLanguage('Español') },
                  { text: 'English', onPress: () => setLanguage('English') },
                ]
              );
            }}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Idioma</Text>
              <Text style={styles.settingValue}>{language}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Legal Documents Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documentos legales</Text>
          
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => Alert.alert('Términos y Condiciones', 'Próximamente')}
          >
            <Text style={styles.settingLabel}>Términos y Condiciones</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => Alert.alert('Política de Privacidad', 'Próximamente')}
          >
            <Text style={styles.settingLabel}>Política de Privacidad</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => Alert.alert('Licencias', 'Próximamente')}
          >
            <Text style={styles.settingLabel}>Licencias de terceros</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Versión de la aplicación</Text>
            <Text style={styles.versionText}>1.0.0</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={20} color="#6b7280" />
            <Text style={styles.deleteText}>Eliminar cuenta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#262626',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#262626',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    color: '#ffffff',
    fontSize: 16,
  },
  settingValue: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginLeft: 16,
  },
  versionText: {
    color: '#6b7280',
    fontSize: 16,
  },
  actionsSection: {
    padding: 16,
    gap: 12,
    marginBottom: 32,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#262626',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  deleteText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
});
