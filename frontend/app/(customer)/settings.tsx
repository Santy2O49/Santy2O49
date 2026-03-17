import React from 'react';
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { t, setLanguage, getLanguage } from '../../src/i18n/translations';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { colors, mode, toggleTheme } = useThemeStore();

  const handleLogout = () => {
    Alert.alert(t('logout'), t('logoutConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('yes'),
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleLanguageChange = () => {
    Alert.alert('Language / Idioma', '', [
      { text: 'Español', onPress: () => setLanguage('es') },
      { text: 'English', onPress: () => setLanguage('en') },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} data-testid="settings-screen">
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Appearance */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <TouchableOpacity style={styles.settingRow} data-testid="theme-setting-row">
            <View style={styles.settingInfo}>
              <View style={styles.iconWrap}>
                <Ionicons name={mode === 'dark' ? 'moon' : 'sunny'} size={20} color={colors.accent} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Appearance</Text>
                <Text style={[styles.settingValue, { color: colors.textMuted }]}>
                  {mode === 'dark' ? 'Dark' : 'Light'}
                </Text>
              </View>
            </View>
            <Switch
              value={mode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#ffffff"
            />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Language */}
          <TouchableOpacity style={styles.settingRow} onPress={handleLanguageChange} data-testid="language-setting">
            <View style={styles.settingInfo}>
              <View style={styles.iconWrap}>
                <Ionicons name="globe" size={20} color={colors.accent} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Language</Text>
                <Text style={[styles.settingValue, { color: colors.textMuted }]}>
                  {getLanguage() === 'es' ? 'Español' : 'English'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Distance Units */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => Alert.alert('Distance Units', '', [
              { text: 'Miles' },
              { text: 'Kilometers' },
            ])}
          >
            <View style={styles.settingInfo}>
              <View style={styles.iconWrap}>
                <Ionicons name="speedometer" size={20} color={colors.accent} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Distance Units</Text>
                <Text style={[styles.settingValue, { color: colors.textMuted }]}>Kilometers</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Legal */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Legal</Text>
          {[
            { label: 'Terms & Conditions', icon: 'document-text' },
            { label: 'Privacy Policy', icon: 'shield-checkmark' },
            { label: 'Licenses', icon: 'code-slash' },
          ].map((item, idx) => (
            <React.Fragment key={item.label}>
              {idx > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => Alert.alert(item.label, 'Coming soon')}
              >
                <View style={styles.settingInfo}>
                  <Ionicons name={item.icon as any} size={18} color={colors.textMuted} />
                  <Text style={[styles.settingLabel, { color: colors.text, marginLeft: 10 }]}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        {/* Version */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>App Version</Text>
            <Text style={[styles.settingValue, { color: colors.textMuted }]}>1.0.0</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.danger + '15' }]} onPress={handleLogout} data-testid="settings-logout-btn">
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            <Text style={[styles.logoutText, { color: colors.danger }]}>Log out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: colors.surface }]}
            onPress={() => Alert.alert('Delete Account', 'This action cannot be undone.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Info', 'Coming soon') },
            ])}
          >
            <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
            <Text style={[styles.deleteText, { color: colors.textMuted }]}>Delete Account</Text>
          </TouchableOpacity>
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
  section: { marginTop: 12, marginHorizontal: 16, borderRadius: 14, overflow: 'hidden' },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconWrap: { width: 32, alignItems: 'center', marginRight: 10 },
  settingLabel: { fontSize: 15, fontWeight: '500' },
  settingValue: { fontSize: 13, marginTop: 1 },
  divider: { height: 0.5, marginLeft: 56 },
  actions: { padding: 16, gap: 10 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: { fontSize: 15, fontWeight: '600' },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  deleteText: { fontSize: 15, fontWeight: '500' },
});
