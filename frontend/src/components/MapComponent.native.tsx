import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

interface MapComponentProps {
  latitude: number;
  longitude: number;
  darkMode: boolean;
  height: number;
  colors: any;
  showMarker?: boolean;
}

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#212121' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#383838' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
];

export function MapComponent({ latitude, longitude, darkMode, height, showMarker = true }: MapComponentProps) {
  return (
    <View style={{ height, width: '100%' }}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.06,
          longitudeDelta: 0.06,
        }}
        customMapStyle={darkMode ? darkMapStyle : []}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {showMarker && (
          <Marker coordinate={{ latitude, longitude }} title="San Salvador" />
        )}
      </MapView>
    </View>
  );
}
