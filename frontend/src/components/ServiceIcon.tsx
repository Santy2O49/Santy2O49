import React from 'react';
import { Ionicons } from '@expo/vector-icons';

const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  plumbing: 'water',
  electrical: 'flash',
  paint: 'color-palette',
  garden: 'leaf',
  carpentry: 'hammer',
  ac: 'snow',
  cleaning: 'sparkles',
  roof: 'home',
  appliance: 'hardware-chip',
  moving: 'car',
  default: 'construct',
};

interface ServiceIconProps {
  icon: string;
  size?: number;
  color?: string;
}

export const ServiceIcon: React.FC<ServiceIconProps> = ({ icon, size = 24, color = '#2563eb' }) => {
  const iconName = iconMap[icon] || iconMap.default;
  return <Ionicons name={iconName} size={size} color={color} />;
};
