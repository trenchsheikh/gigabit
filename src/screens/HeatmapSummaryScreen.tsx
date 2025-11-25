import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Card } from '../components/Card';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';

export const HeatmapSummaryScreen: React.FC = () => {
  const { wifiHeatmap, selectedHousePlan } = useAppStore();

  if (!wifiHeatmap || wifiHeatmap.points.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No heatmap data available</Text>
      </View>
    );
  }

  const getStrengthLabel = (strength: number): string => {
    if (strength >= -50) return 'Excellent';
    if (strength >= -60) return 'Good';
    if (strength >= -70) return 'Fair';
    if (strength >= -80) return 'Weak';
    return 'Very Weak';
  };

  const getStrengthColor = (strength: number): string => {
    if (strength >= -50) return '#4CAF50';
    if (strength >= -60) return '#8BC34A';
    if (strength >= -70) return '#FFC107';
    if (strength >= -80) return '#FF9800';
    return '#F44336';
  };

  const overallAverage =
    wifiHeatmap.points.reduce((sum, p) => sum + p.strengthDbm, 0) /
    wifiHeatmap.points.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.summaryCard}>
        <Text style={styles.title}>Heatmap Summary</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{wifiHeatmap.points.length}</Text>
            <Text style={styles.statLabel}>Points Recorded</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: getStrengthColor(overallAverage) }]}>
              {overallAverage.toFixed(1)} dBm
            </Text>
            <Text style={styles.statLabel}>Average Strength</Text>
          </View>
        </View>
        <View style={styles.overallStrength}>
          <Text style={styles.overallLabel}>Overall Signal Quality:</Text>
          <Text
            style={[
              styles.overallValue,
              { color: getStrengthColor(overallAverage) },
            ]}
          >
            {getStrengthLabel(overallAverage)}
          </Text>
        </View>
      </Card>

      {selectedHousePlan && Object.keys(wifiHeatmap.roomAverages).length > 0 && (
        <Card style={styles.roomsCard}>
          <Text style={styles.roomsTitle}>Room Analysis</Text>
          {selectedHousePlan.rooms.map((room) => {
            const avgStrength = wifiHeatmap.roomAverages[room.id];
            if (avgStrength === undefined) return null;

            return (
              <View key={room.id} style={styles.roomItem}>
                <View style={styles.roomInfo}>
                  <Text style={styles.roomName}>{room.name}</Text>
                  <Text style={styles.roomFloor}>
                    Floor {room.floor + 1}
                  </Text>
                </View>
                <View style={styles.roomStrength}>
                  <View
                    style={[
                      styles.strengthBar,
                      {
                        width: `${((avgStrength + 100) / 100) * 100}%`,
                        backgroundColor: getStrengthColor(avgStrength),
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.roomStrengthValue,
                      { color: getStrengthColor(avgStrength) },
                    ]}
                  >
                    {avgStrength.toFixed(1)} dBm
                  </Text>
                  <Text
                    style={[
                      styles.roomStrengthLabel,
                      { color: getStrengthColor(avgStrength) },
                    ]}
                  >
                    {getStrengthLabel(avgStrength)}
                  </Text>
                </View>
              </View>
            );
          })}
        </Card>
      )}

      <Card style={styles.pointsCard}>
        <Text style={styles.pointsTitle}>All Points ({wifiHeatmap.points.length})</Text>
        <View style={styles.pointsList}>
          {wifiHeatmap.points.slice(0, 20).map((point) => (
            <View key={point.id} style={styles.pointItem}>
              <View
                style={[
                  styles.pointIndicator,
                  {
                    backgroundColor: getStrengthColor(point.strengthDbm),
                  },
                ]}
              />
              <Text style={styles.pointStrength}>
                {point.strengthDbm.toFixed(1)} dBm
              </Text>
              <Text style={styles.pointTime}>
                {new Date(point.createdAt).toLocaleTimeString()}
              </Text>
            </View>
          ))}
          {wifiHeatmap.points.length > 20 && (
            <Text style={styles.morePoints}>
              +{wifiHeatmap.points.length - 20} more points
            </Text>
          )}
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  summaryCard: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  overallStrength: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    alignItems: 'center',
  },
  overallLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  overallValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  roomsCard: {
    marginBottom: 16,
  },
  roomsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  roomItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  roomInfo: {
    marginBottom: 8,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  roomFloor: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  roomStrength: {
    marginTop: 8,
  },
  strengthBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  roomStrengthValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  roomStrengthLabel: {
    fontSize: 12,
  },
  pointsCard: {
    marginBottom: 16,
  },
  pointsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  pointsList: {
    maxHeight: 300,
  },
  pointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  pointIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  pointStrength: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  pointTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  morePoints: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 8,
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: colors.textSecondary,
    fontSize: 16,
  },
});


