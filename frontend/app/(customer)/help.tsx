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
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../src/store/themeStore';
import { t } from '../../src/i18n/translations';

export default function HelpScreen() {
  const { colors } = useThemeStore();

  const helpTopics = [
    { id: 'services', name: 'Home Services', icon: 'construct', color: '#3b82f6' },
    { id: 'payments', name: 'Payments', icon: 'card', color: '#10b981' },
    { id: 'providers', name: 'Providers', icon: 'people', color: '#f59e0b' },
    { id: 'account', name: 'My Account', icon: 'person', color: '#8b5cf6' },
  ];

  const moreOptions = [
    { id: 'app-issues', name: 'App Issues', icon: 'bug' },
    { id: 'about', name: 'About HAMMR', icon: 'information-circle' },
    { id: 'faq', name: 'FAQ', icon: 'help-circle' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} data-testid="help-screen">
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('helpSupport')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Topics Grid */}
        <View style={styles.topicsGrid}>
          {helpTopics.map((topic) => (
            <TouchableOpacity
              key={topic.id}
              style={[styles.topicCard, { backgroundColor: colors.surface }]}
              onPress={() => Alert.alert(topic.name, 'Coming soon')}
              data-testid={`help-topic-${topic.id}`}
            >
              <View style={[styles.topicIcon, { backgroundColor: topic.color + '20' }]}>
                <Ionicons name={topic.icon as any} size={26} color={topic.color} />
              </View>
              <Text style={[styles.topicName, { color: colors.text }]}>{topic.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* More */}
        <View style={[styles.moreList, { backgroundColor: colors.surface }]}>
          {moreOptions.map((option, idx) => (
            <React.Fragment key={option.id}>
              {idx > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              <TouchableOpacity
                style={styles.moreItem}
                onPress={() => Alert.alert(option.name, 'Coming soon')}
              >
                <Ionicons name={option.icon as any} size={22} color={colors.textMuted} />
                <Text style={[styles.moreItemText, { color: colors.text }]}>{option.name}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        {/* Contact */}
        <View style={styles.contactSection}>
          <Text style={[styles.contactTitle, { color: colors.text }]}>Contact Support</Text>
          <View style={styles.contactRow}>
            <TouchableOpacity
              style={[styles.contactCard, { backgroundColor: colors.surface }]}
              onPress={() => Linking.openURL('mailto:support@hammr.com')}
            >
              <Ionicons name="mail" size={26} color="#3b82f6" />
              <Text style={[styles.contactLabel, { color: colors.text }]}>Email</Text>
              <Text style={[styles.contactInfo, { color: colors.textMuted }]}>support@hammr.com</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactCard, { backgroundColor: colors.surface }]}
              onPress={() => Linking.openURL('https://wa.me/50370000000')}
            >
              <Ionicons name="logo-whatsapp" size={26} color="#22c55e" />
              <Text style={[styles.contactLabel, { color: colors.text }]}>WhatsApp</Text>
              <Text style={[styles.contactInfo, { color: colors.textMuted }]}>+503 7000-0000</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Report */}
        <View style={[styles.reportSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.reportTitle, { color: colors.text }]}>Report a Problem</Text>
          <TextInput
            style={[styles.reportInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
            placeholder="Describe your issue..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: colors.accent }]}
            onPress={() => Alert.alert('Sent', 'Your report has been submitted.')}
            data-testid="send-report-btn"
          >
            <Text style={[styles.sendButtonText, { color: colors.accentText }]}>Send Report</Text>
          </TouchableOpacity>
        </View>

        {/* Social */}
        <View style={styles.socialSection}>
          <Text style={[styles.socialTitle, { color: colors.textMuted }]}>Follow Us</Text>
          <View style={styles.socialLinks}>
            {[
              { icon: 'logo-facebook', color: '#1877f2', url: 'https://facebook.com/hammrapp' },
              { icon: 'logo-instagram', color: '#e4405f', url: 'https://instagram.com/hammrapp' },
              { icon: 'logo-twitter', color: '#1da1f2', url: 'https://twitter.com/hammrapp' },
            ].map((social) => (
              <TouchableOpacity
                key={social.icon}
                style={[styles.socialButton, { backgroundColor: colors.surface }]}
                onPress={() => Linking.openURL(social.url)}
              >
                <Ionicons name={social.icon as any} size={24} color={social.color} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 10,
  },
  topicCard: {
    width: '47%',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  topicIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  topicName: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  moreList: {
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
  },
  moreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  moreItemText: { flex: 1, fontSize: 15, marginLeft: 14 },
  divider: { height: 0.5, marginLeft: 52 },
  contactSection: { padding: 16 },
  contactTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  contactRow: { flexDirection: 'row', gap: 10 },
  contactCard: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  contactLabel: { fontSize: 13, fontWeight: '600', marginTop: 8 },
  contactInfo: { fontSize: 11, marginTop: 4 },
  reportSection: {
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
  },
  reportTitle: { fontSize: 15, fontWeight: '600', marginBottom: 10 },
  reportInput: {
    borderRadius: 10,
    padding: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  sendButton: {
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  sendButtonText: { fontSize: 15, fontWeight: '600' },
  socialSection: { alignItems: 'center', paddingVertical: 20 },
  socialTitle: { fontSize: 13, marginBottom: 12 },
  socialLinks: { flexDirection: 'row', gap: 12 },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
