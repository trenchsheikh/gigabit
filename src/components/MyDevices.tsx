import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';

// Define types locally or import if shared
import { fetchDevices, DeviceSummary } from '../services/api/devices';

export const MyDevices: React.FC = () => {
  const { routerNumber } = useAppStore();
  const [devices, setDevices] = useState<DeviceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDevices = async () => {
    if (!routerNumber) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchDevices(routerNumber);
      setDevices(data);
    } catch (err) {
      setError('Failed to load devices');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, [routerNumber]);

  const getQualityColor = (level?: string) => {
    switch (level) {
      case 'excellent':
        return '#4CAF50'; // Green
      case 'good':
        return '#8BC34A'; // Light Green
      case 'fair':
        return '#FFC107'; // Amber
      case 'poor':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Grey
    }
  };

  const renderItem = ({ item }: { item: DeviceSummary }) => {
    const qualityColor = getQualityColor(item.signalQuality?.level);

    return (
      <View style={styles.deviceCard}>
        <View style={styles.deviceIconContainer}>
          <Ionicons name={item.connectionType === 'Ethernet' ? 'hardware-chip-outline' : 'wifi'} size={24} color={colors.textPrimary} />
        </View>
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName} numberOfLines={1}>
            {item.name}
          </Text>
          {(item.manufacturer || item.model) && (
            <Text style={styles.deviceModel} numberOfLines={1}>
              {[item.manufacturer, item.model].filter(Boolean).join(' ')}
            </Text>
          )}
          <Text style={styles.deviceDetails}>
            {item.connectionType}
          </Text>
          <View style={styles.metricsContainer}>
            {item.wifiScore != null && (
                <Text style={styles.metricText}>Score: {item.wifiScore}/100</Text>
            )}
            {(item.dsPhyRateMbps != null || item.usPhyRateMbps != null) && (
                <Text style={styles.metricText}>
                    ↓{item.dsPhyRateMbps ?? '-'} / ↑{item.usPhyRateMbps ?? '-'} Mbps
                </Text>
            )}
            {item.rssi != null && (
                <Text style={styles.metricText}>Signal: {item.rssi} dBm</Text>
            )}
          </View>
        </View>
        <View style={[styles.qualityBadge, { backgroundColor: `${qualityColor}20` }]}>
          <Text style={[styles.qualityText, { color: qualityColor }]}>
            {item.signalQuality?.label || 'Unknown'}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.accentBlue} />
        <Text style={styles.loadingText}>Scanning devices...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadDevices} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Devices</Text>
        <TouchableOpacity onPress={loadDevices}>
            <Ionicons name="refresh" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      {devices.length === 0 ? (
        <Text style={styles.emptyText}>No devices currently connected.</Text>
      ) : (
        <FlatList
          data={devices}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false} // Since it's inside a ScrollView usually
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 0,
    marginBottom: 24,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: colors.error,
    marginBottom: 8,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  retryText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    gap: 12,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  deviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  deviceModel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  deviceDetails: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  metricsContainer: {
    marginTop: 4,
    flexDirection: 'column',
    gap: 2,
  },
  metricText: {
    fontSize: 11,
    color: colors.textSecondary,
    opacity: 0.8,
  },
  qualityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  qualityText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    padding: 20,
  },
});
