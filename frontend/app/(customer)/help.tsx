import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { t } from '../../src/i18n/translations';

export default function HelpScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const helpTopics = [
    { id: 'services', name: 'Servicios del hogar', icon: 'construct', color: '#3b82f6' },
    { id: 'payments', name: 'Pagos', icon: 'card', color: '#10b981' },
    { id: 'providers', name: 'Proveedores', icon: 'people', color: '#f59e0b' },
    { id: 'account', name: 'Mi cuenta', icon: 'person', color: '#8b5cf6' },
  ];

  const moreOptions = [
    { id: 'app-issues', name: 'Problemas con la aplicación', icon: 'bug' },
    { id: 'about', name: 'Acerca de HAMMR', icon: 'information-circle' },
    { id: 'faq', name: 'Preguntas frecuentes', icon: 'help-circle' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
          <Ionicons name="menu" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayuda</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.sectionTitle}>Temas principales</Text>
          <View style={styles.topicsGrid}>
            {helpTopics.map((topic) => (
              <TouchableOpacity
                key={topic.id}
                style={styles.topicCard}
                onPress={() => Alert.alert(topic.name, 'Contenido de ayuda próximamente')}
              >
                <View style={[styles.topicIcon, { backgroundColor: topic.color + '20' }]}>
                  <Ionicons name={topic.icon as any} size={28} color={topic.color} />
                </View>
                <Text style={styles.topicName}>{topic.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* More Options */}
        <View style={styles.moreSection}>
          <Text style={styles.sectionTitle}>Más</Text>
          <View style={styles.moreList}>
            {moreOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.moreItem}
                onPress={() => Alert.alert(option.name, 'Contenido próximamente')}
              >
                <Ionicons name={option.icon as any} size={24} color="#6b7280" />
                <Text style={styles.moreItemText}>{option.name}</Text>
                <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Divider */}
        <View style={styles.sectionDivider} />

        {/* Support Section */}
        <View style={styles.supportSection}>
          <Text style={styles.supportTitle}>Soporte</Text>
          <Text style={styles.supportSubtitle}>
            ¿Necesitas ayuda? Contáctanos
          </Text>

          {/* Contact Options */}
          <View style={styles.contactOptions}>
            <TouchableOpacity
              style={styles.contactCard}
              onPress={() => Linking.openURL('mailto:support@hammr.com')}
            >
              <View style={[styles.contactIcon, { backgroundColor: '#3b82f620' }]}>
                <Ionicons name="mail" size={28} color="#3b82f6" />
              </View>
              <Text style={styles.contactTitle}>Email</Text>
              <Text style={styles.contactInfo}>support@hammr.com</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactCard}
              onPress={() => Linking.openURL('https://wa.me/50370000000')}
            >
              <View style={[styles.contactIcon, { backgroundColor: '#22c55e20' }]}>
                <Ionicons name="logo-whatsapp" size={28} color="#22c55e" />
              </View>
              <Text style={styles.contactTitle}>WhatsApp</Text>
              <Text style={styles.contactInfo}>+503 7000-0000</Text>
            </TouchableOpacity>
          </View>

          {/* Chat Support */}
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => Alert.alert('Chat', 'Chat en vivo próximamente')}
          >
            <Ionicons name="chatbubbles" size={24} color="#ffffff" />
            <Text style={styles.chatButtonText}>Iniciar chat en vivo</Text>
          </TouchableOpacity>

          {/* Report Issue */}
          <View style={styles.reportSection}>
            <Text style={styles.reportTitle}>Reportar un problema</Text>
            <TextInput
              style={styles.reportInput}
              placeholder="Describe tu problema..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={() => Alert.alert('Enviado', 'Tu reporte ha sido enviado. Te contactaremos pronto.')}
            >
              <Text style={styles.sendButtonText}>Enviar reporte</Text>
            </TouchableOpacity>
          </View>

          {/* Social Links */}
          <View style={styles.socialSection}>
            <Text style={styles.socialTitle}>Síguenos</Text>
            <View style={styles.socialLinks}>
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => Linking.openURL('https://facebook.com/hammrapp')}
              >
                <Ionicons name="logo-facebook" size={28} color="#1877f2" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => Linking.openURL('https://instagram.com/hammrapp')}
              >
                <Ionicons name="logo-instagram" size={28} color="#e4405f" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => Linking.openURL('https://twitter.com/hammrapp')}
              >
                <Ionicons name="logo-twitter" size={28} color="#1da1f2" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  helpSection: {
    padding: 16,
  },
  sectionTitle: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  topicCard: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topicIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  topicName: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  moreSection: {
    padding: 16,
    paddingTop: 0,
  },
  moreList: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  moreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  moreItemText: {
    flex: 1,
    color: '#374151',
    fontSize: 16,
    marginLeft: 16,
  },
  sectionDivider: {
    height: 8,
    backgroundColor: '#e5e7eb',
  },
  supportSection: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  supportTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  supportSubtitle: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 20,
  },
  contactOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  contactIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  contactTitle: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  contactInfo: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  chatButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  reportSection: {
    marginBottom: 24,
  },
  reportTitle: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  reportInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    color: '#111827',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  sendButton: {
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  socialSection: {
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  socialTitle: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 16,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
