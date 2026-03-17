import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Platform, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../src/store/themeStore';
import { CustomDrawer } from '../../src/components/CustomDrawer';

export default function CustomerLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { colors } = useThemeStore();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.tabBarBg,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingTop: Platform.OS === 'ios' ? 8 : 4,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
            height: Platform.OS === 'ios' ? 85 : 65,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
            marginTop: 2,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
          listeners={{
            tabPress: () => setDrawerOpen(false),
          }}
        />
        <Tabs.Screen
          name="jobs"
          options={{
            title: 'Jobs',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="document-text" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="help"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="request"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="chat"
          options={{ href: null }}
        />
      </Tabs>

      <CustomDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Floating hamburger button */}
      {!drawerOpen && (
        <TouchableOpacity
          style={[styles.hamburger, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setDrawerOpen(true)}
          data-testid="hamburger-menu-btn"
        >
          <Ionicons name="menu" size={22} color={colors.text} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hamburger: {
    position: 'absolute',
    top: 52,
    left: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    borderWidth: 1,
    zIndex: 10,
  },
});
