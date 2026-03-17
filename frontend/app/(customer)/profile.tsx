import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../src/store/authStore';
import { Input } from '../../src/components/Input';
import { t } from '../../src/i18n/translations';

export default function CustomerProfile() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();
  
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.avatar_url || '');
  const [editName, setEditName] = useState(user?.full_name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');

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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tu galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
      Alert.alert('Éxito', 'Foto de perfil actualizada');
    }
  };

  const takeVerificationPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tu cámara');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setVerifyModalVisible(false);
      Alert.alert(
        'Verificación enviada',
        'Tu foto de verificación ha sido enviada. Te notificaremos cuando sea aprobada.'
      );
    }
  };

  const handleSaveProfile = () => {
    Alert.alert('Éxito', 'Perfil actualizado');
    setEditModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
          <Ionicons name="menu" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <TouchableOpacity onPress={() => setEditModalVisible(true)}>
          <Ionicons name="pencil" size={22} color="#c8ff00" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
            <Image
              source={{ uri: profileImage || 'https://ui-avatars.com/api/?name=User&background=c8ff00&color=1a1a1a&size=120' }}
              style={styles.avatar}
            />
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={16} color="#ffffff" />
            </View>
          </TouchableOpacity>
          
          <Text style={styles.profileName}>{user?.full_name}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name="star"
                size={18}
                color={star <= Math.floor(user?.rating || 5) ? '#fbbf24' : '#4b5563'}
              />
            ))}
            <Text style={styles.ratingText}>
              {user?.rating?.toFixed(2) || '5.00'} ({user?.review_count || 0} reseñas)
            </Text>
          </View>

          {/* Verification Badge */}
          {user?.is_verified ? (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
              <Text style={styles.verifiedText}>Cuenta Verificada</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.verifyButton}
              onPress={() => setVerifyModalVisible(true)}
            >
              <Ionicons name="shield-checkmark" size={18} color="#c8ff00" />
              <Text style={styles.verifyButtonText}>Verificar mi cuenta</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Solicitudes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Completadas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>$450</Text>
            <Text style={styles.statLabel}>Gastado</Text>
          </View>
        </View>

        {/* Account Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de cuenta</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="person" size={20} color="#6b7280" />
            <Text style={styles.infoLabel}>Nombre</Text>
            <Text style={styles.infoValue}>{user?.full_name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="mail" size={20} color="#6b7280" />
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="call" size={20} color="#6b7280" />
            <Text style={styles.infoLabel}>Teléfono</Text>
            <Text style={styles.infoValue}>{user?.phone}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color="#6b7280" />
            <Text style={styles.infoLabel}>Ubicación</Text>
            <Text style={styles.infoValue}>{user?.location || 'San Salvador'}</Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>

        <Text style={styles.version}>HAMMR v1.0.0</Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Perfil</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <Input
              label="Nombre completo"
              value={editName}
              onChangeText={setEditName}
              placeholder="Tu nombre"
            />
            <Input
              label="Teléfono"
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="7000-0000"
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
              <Text style={styles.saveButtonText}>Guardar cambios</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Verify Modal */}
      <Modal
        visible={verifyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setVerifyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Verificar cuenta</Text>
              <TouchableOpacity onPress={() => setVerifyModalVisible(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.verifyInstructions}>
              <Ionicons name="camera" size={48} color="#c8ff00" />
              <Text style={styles.verifyTitle}>Toma una foto de tu rostro</Text>
              <Text style={styles.verifyDescription}>
                Para verificar tu cuenta, necesitamos una foto clara de tu rostro. 
                Asegúrate de estar en un lugar bien iluminado.
              </Text>
            </View>
            
            <TouchableOpacity style={styles.cameraButton} onPress={takeVerificationPhoto}>
              <Ionicons name="camera" size={24} color="#1a1a1a" />
              <Text style={styles.cameraButtonText}>Tomar foto</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  profileCard: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#262626',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#c8ff00',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#c8ff00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
  },
  profileEmail: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  ratingText: {
    color: '#9ca3af',
    fontSize: 14,
    marginLeft: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
    gap: 6,
  },
  verifiedText: {
    color: '#22c55e',
    fontWeight: '600',
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  verifyButtonText: {
    color: '#c8ff00',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#262626',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#c8ff00',
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#333',
  },
  section: {
    backgroundColor: '#262626',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  infoLabel: {
    flex: 1,
    color: '#9ca3af',
    marginLeft: 12,
  },
  infoValue: {
    color: '#ffffff',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  version: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#262626',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  saveButton: {
    backgroundColor: '#c8ff00',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '700',
  },
  verifyInstructions: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  verifyTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  verifyDescription: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#c8ff00',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  cameraButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '700',
  },
});
