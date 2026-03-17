import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MapComponentProps {
  latitude: number;
  longitude: number;
  darkMode: boolean;
  height: number;
  colors: any;
  showMarker?: boolean;
}

export function MapComponent({ latitude, longitude, darkMode, height, colors }: MapComponentProps) {
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.05},${latitude - 0.03},${longitude + 0.05},${latitude + 0.03}&layer=mapnik&marker=${latitude},${longitude}`;

  if (Platform.OS === 'web') {
    return (
      <View style={{ height, width: '100%' }}>
        <iframe
          src={osmUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            filter: darkMode ? 'invert(1) hue-rotate(180deg) brightness(0.9) contrast(1.1)' : 'none',
          }}
          title="Map"
        />
      </View>
    );
  }

  // Fallback for non-web without react-native-maps
  return (
    <View style={[styles.placeholder, { height, backgroundColor: colors.surfaceAlt }]}>
      <Ionicons name="location" size={48} color={colors.accent} />
      <Text style={[styles.text, { color: colors.text }]}>San Salvador, El Salvador</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 16, fontWeight: '600', marginTop: 8 },
});
