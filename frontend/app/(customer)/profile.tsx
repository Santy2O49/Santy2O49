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
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { t } from '../../src/i18n/translations';

export default function CustomerProfile() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [editName, setEditName] = useState(user?.full_name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');

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

  const handleSaveProfile = () => {
    Alert.alert('Success', 'Profile updated!');
    setEditModalVisible(false);
  };

  const menuItems = [
    { icon: 'person-outline', label: t('editProfile'), onPress: () => setEditModalVisible(true) },
    { icon: 'card-outline', label: t('paymentMethods'), onPress: () => Alert.alert(t('paymentMethods'), 'Coming soon!') },
    { icon: 'location-outline', label: t('addresses'), onPress: () => Alert.alert(t('addresses'), 'Coming soon!') },
    { icon: 'notifications-outline', label: t('notifications'), onPress: () => Alert.alert(t('notifications'), 'Coming soon!') },
    { icon: 'help-circle-outline', label: t('helpSupport'), onPress: () => Alert.alert(t('helpSupport'), 'Email: support@hammr.com') },
    { icon: 'document-text-outline', label: t('termsConditions'), onPress: () => setTermsModalVisible(true) },
    { icon: 'shield-checkmark-outline', label: t('privacyPolicy'), onPress: () => setPrivacyModalVisible(true) },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('profile')}</Text>
        </View>

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Image
              source={{ uri: user?.avatar_url || 'https://ui-avatars.com/api/?name=User&background=16a34a&color=fff' }}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.full_name}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#fbbf24" />
                <Text style={styles.ratingText}>
                  {user?.rating?.toFixed(1) || '0.0'} ({user?.review_count || 0})
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>{t('jobs')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>{t('completed')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>$450</Text>
            <Text style={styles.statLabel}>{t('total')}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <Card style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && styles.menuItemBorder,
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon as any} size={22} color="#64748b" />
                <Text style={styles.menuItemLabel}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
            </TouchableOpacity>
          ))}
        </Card>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#dc2626" />
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
              <Text style={styles.modalTitle}>{t('editProfile')}</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <Input
              label={t('fullName')}
              value={editName}
              onChangeText={setEditName}
              placeholder="Your name"
            />
            <Input
              label={t('phone')}
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="7000-0000"
              keyboardType="phone-pad"
            />
            <Button title="Save" onPress={handleSaveProfile} variant="success" />
          </View>
        </View>
      </Modal>

      {/* Terms Modal */}
      <Modal
        visible={termsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setTermsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentFull}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('termsConditions')}</Text>
              <TouchableOpacity onPress={() => setTermsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.legalText}>
              <Text style={styles.legalTitle}>Terms and Conditions</Text>
              <Text style={styles.legalParagraph}>
                Welcome to HAMMR. By using our platform, you agree to the following terms:
              </Text>
              <Text style={styles.legalParagraph}>
                1. HAMMR is a marketplace connecting customers with service providers in El Salvador.
              </Text>
              <Text style={styles.legalParagraph}>
                2. Users must be 18 years or older to use this service.
              </Text>
              <Text style={styles.legalParagraph}>
                3. Service providers are independent contractors, not employees of HAMMR.
              </Text>
              <Text style={styles.legalParagraph}>
                4. HAMMR charges a 10% commission on completed services.
              </Text>
              <Text style={styles.legalParagraph}>
                5. Users are responsible for the accuracy of information provided.
              </Text>
              <Text style={styles.legalParagraph}>
                6. HAMMR reserves the right to suspend accounts for policy violations.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        visible={privacyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPrivacyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentFull}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('privacyPolicy')}</Text>
              <TouchableOpacity onPress={() => setPrivacyModalVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.legalText}>
              <Text style={styles.legalTitle}>Privacy Policy</Text>
              <Text style={styles.legalParagraph}>
                HAMMR is committed to protecting your privacy. This policy explains how we collect and use your data.
              </Text>
              <Text style={styles.legalParagraph}>
                Information We Collect: Name, email, phone number, location data, and service history.
              </Text>
              <Text style={styles.legalParagraph}>
                How We Use It: To connect you with service providers, process payments, and improve our service.
              </Text>
              <Text style={styles.legalParagraph}>
                Data Sharing: We share necessary information with service providers to complete your requests.
              </Text>
              <Text style={styles.legalParagraph}>
                Security: We use industry-standard encryption to protect your data.
              </Text>
              <Text style={styles.legalParagraph}>
                Contact: For privacy concerns, email privacy@hammr.com
              </Text>
            </ScrollView>
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
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#16a34a',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  menuCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemLabel: {
    fontSize: 15,
    color: '#374151',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginLeft: 8,
  },
  version: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 20,
    marginBottom: 40,
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
  },
  modalContentFull: {
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
  legalText: {
    flex: 1,
  },
  legalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  legalParagraph: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
});
