import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAppStore } from '../store/useAppStore';
import type { RootStackParamList } from '../navigation/types';
import type { StackNavigationProp } from '@react-navigation/stack';

type ScanNavigationProp = StackNavigationProp<RootStackParamList>;

export const ScanScreen: React.FC = () => {
  const navigation = useNavigation<ScanNavigationProp>();
  const { wifiHeatmap } = useAppStore();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 16 }]}>
        <Text style={styles.title}>WiFi Scanning</Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>AR WiFi Heatmap</Text>
          <Text style={styles.infoDescription}>
            Walk around your home and scan WiFi signal strength to create a
            visual heatmap of your network coverage.
          </Text>
        </Card>

        <Button
          title="Start AR Scan"
          onPress={() => navigation.navigate('ARHeatmap')}
          variant="primary"
          style={styles.scanButton}
        />

        {wifiHeatmap && wifiHeatmap.points.length > 0 && (
          <>
            <Card style={styles.statsCard}>
              <Text style={styles.statsTitle}>Last Scan Results</Text>
              <Text style={styles.statsText}>
                {wifiHeatmap.points.length} points recorded
              </Text>
              <Text style={styles.statsText}>
                {Object.keys(wifiHeatmap.roomAverages).length} rooms analyzed
              </Text>
            </Card>

            <Button
              title="View Heatmap Summary"
              onPress={() => navigation.navigate('HeatmapSummary')}
              variant="outline"
              style={styles.summaryButton}
            />
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  content: {
    padding: 16,
  },
  infoCard: {
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  infoDescription: {
    fontSize: 16,
    color: '#CCCCCC',
    lineHeight: 24,
  },
  scanButton: {
    marginBottom: 16,
  },
  statsCard: {
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  statsText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  summaryButton: {
    marginTop: 8,
  },
});


