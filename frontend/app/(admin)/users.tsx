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
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { User, UserRole } from '../../src/types';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import api from '../../src/api/client';
import { t } from '../../src/i18n/translations';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [blockingUserId, setBlockingUserId] = useState<string | null>(null);
  const [verifyingUserId, setVerifyingUserId] = useState<string | null>(null);

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
    setVerifyingUserId(userId);
    try {
      await api.put(`/users/${userId}/verify`);
      await fetchUsers();
      Alert.alert('Success', 'User verified successfully');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Could not verify user');
    } finally {
      setVerifyingUserId(null);
    }
  };

  const handleBlock = async (userId: string) => {
    Alert.alert(
      t('block'),
      'Are you sure you want to block this user?',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('block'),
          style: 'destructive',
          onPress: async () => {
            setBlockingUserId(userId);
            try {
              await api.put(`/users/${userId}/block`);
              await fetchUsers();
              Alert.alert('Success', 'User blocked successfully');
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.detail || 'Could not block user');
            } finally {
              setBlockingUserId(null);
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
    { key: 'all', label: t('all') },
    { key: 'customer', label: t('clients') },
    { key: 'contractor', label: t('providers') },
    { key: 'admin', label: t('admin') },
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
        <Text style={styles.title}>{t('userManagement')}</Text>
        <Text style={styles.subtitle}>{users.length} {t('totalUsersCount')}</Text>
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
                    title={t('verify')}
                    variant="success"
                    onPress={() => handleVerify(user.id)}
                    loading={verifyingUserId === user.id}
                    style={styles.actionBtn}
                  />
                )}
                {!user.is_blocked ? (
                  <Button
                    title={t('block')}
                    variant="danger"
                    onPress={() => handleBlock(user.id)}
                    loading={blockingUserId === user.id}
                    style={styles.actionBtn}
                  />
                ) : (
                  <View style={styles.blockedBadge}>
                    <Ionicons name="ban" size={16} color="#dc2626" />
                    <Text style={styles.blockedText}>{t('blocked')}</Text>
                  </View>
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
  blockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    gap: 6,
  },
  blockedText: {
    color: '#dc2626',
    fontWeight: '600',
  },
});
