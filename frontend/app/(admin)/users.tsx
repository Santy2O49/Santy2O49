import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { User, UserRole } from '../../src/types';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import api from '../../src/api/client';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const handleVerify = async (userId: string) => {
    try {
      await api.put(`/users/${userId}/verify`);
      fetchUsers();
      Alert.alert('Éxito', 'Usuario verificado');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'No se pudo verificar');
    }
  };

  const handleBlock = async (userId: string) => {
    Alert.alert(
      'Bloquear Usuario',
      '¿Estás seguro de bloquear este usuario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Bloquear',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.put(`/users/${userId}/block`);
              fetchUsers();
              Alert.alert('Éxito', 'Usuario bloqueado');
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.detail || 'No se pudo bloquear');
            }
          },
        },
      ]
    );
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    return user.role === filter;
  });

  const filters = [
    { key: 'all', label: 'Todos' },
    { key: 'customer', label: 'Clientes' },
    { key: 'contractor', label: 'Proveedores' },
    { key: 'admin', label: 'Admins' },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#dc2626';
      case 'contractor': return '#2563eb';
      case 'customer': return '#16a34a';
      default: return '#64748b';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Usuarios</Text>
        <Text style={styles.subtitle}>{users.length} usuarios totales</Text>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {filters.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterButton,
              filter === f.key && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f.key && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredUsers.map(user => (
          <Card key={user.id} style={styles.userCard}>
            <View style={styles.userHeader}>
              <Image
                source={{ uri: user.avatar_url || 'https://ui-avatars.com/api/?name=User' }}
                style={styles.avatar}
              />
              <View style={styles.userInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>{user.full_name}</Text>
                  {user.is_verified && (
                    <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                  )}
                </View>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) + '20' }]}>
                  <Text style={[styles.roleText, { color: getRoleColor(user.role) }]}>
                    {user.role.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.userMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="star" size={14} color="#fbbf24" />
                <Text style={styles.metaText}>{user.rating?.toFixed(1) || '0.0'}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="call" size={14} color="#64748b" />
                <Text style={styles.metaText}>{user.phone}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="location" size={14} color="#64748b" />
                <Text style={styles.metaText}>{user.location}</Text>
              </View>
            </View>

            {user.role !== 'admin' && (
              <View style={styles.userActions}>
                {user.role === 'contractor' && !user.is_verified && (
                  <Button
                    title="Verificar"
                    variant="success"
                    onPress={() => handleVerify(user.id)}
                    style={styles.actionBtn}
                  />
                )}
                {!user.is_blocked && (
                  <Button
                    title="Bloquear"
                    variant="danger"
                    onPress={() => handleBlock(user.id)}
                    style={styles.actionBtn}
                  />
                )}
              </View>
            )}
          </Card>
        ))}
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
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  filterText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  userCard: {
    marginBottom: 12,
  },
  userHeader: {
    flexDirection: 'row',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  userEmail: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '600',
  },
  userMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
  },
});
