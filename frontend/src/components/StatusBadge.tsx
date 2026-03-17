import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { JobStatus, PaymentStatus } from '../types';

const statusColors: Record<string, { bg: string; text: string }> = {
  [JobStatus.PENDING]: { bg: '#fef3c7', text: '#92400e' },
  [JobStatus.ACCEPTED]: { bg: '#dbeafe', text: '#1e40af' },
  [JobStatus.IN_PROGRESS]: { bg: '#e0e7ff', text: '#3730a3' },
  [JobStatus.COMPLETED]: { bg: '#d1fae5', text: '#065f46' },
  [JobStatus.CANCELLED]: { bg: '#fee2e2', text: '#991b1b' },
  [PaymentStatus.PENDING]: { bg: '#fef3c7', text: '#92400e' },
  [PaymentStatus.IN_ESCROW]: { bg: '#dbeafe', text: '#1e40af' },
  [PaymentStatus.RELEASED]: { bg: '#d1fae5', text: '#065f46' },
  [PaymentStatus.REFUNDED]: { bg: '#fce7f3', text: '#9d174d' },
};

interface StatusBadgeProps {
  status: string;
  type?: 'job' | 'payment';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colors = statusColors[status] || { bg: '#f3f4f6', text: '#374151' };
  const displayText = status.replace(/_/g, ' ').toUpperCase();

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{displayText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
