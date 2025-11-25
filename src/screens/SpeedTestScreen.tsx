import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';

type TestPhase = 'idle' | 'ping' | 'download' | 'upload' | 'complete';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GRAPH_HEIGHT = 80;

export const SpeedTestScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { networkSummary, updateNetworkSummary } = useAppStore();
  const [testPhase, setTestPhase] = useState<TestPhase>('idle');
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [ping, setPing] = useState(0);
  const [speedHistory, setSpeedHistory] = useState<number[]>([]);

  useEffect(() => {
    if (testPhase === 'download' || testPhase === 'upload') {
      const interval = setInterval(() => {
        setSpeedHistory((prev) => {
          const currentSpeed = testPhase === 'download' ? downloadSpeed : uploadSpeed;
          const newHistory = [...prev, currentSpeed];
          return newHistory.slice(-30);
        });
      }, 150);
      return () => clearInterval(interval);
    } else if (testPhase === 'idle' || testPhase === 'complete') {
      setSpeedHistory([]);
    }
  }, [testPhase, downloadSpeed, uploadSpeed]);

  useEffect(() => {
    if (testPhase === 'ping') {
      const pingValue = Math.random() * 50;
      setPing(Math.round(pingValue));
      setTimeout(() => {
        setTestPhase('download');
        setSpeedHistory([]);
      }, 1500);
    } else if (testPhase === 'download') {
      const targetSpeed = 50 + Math.random() * 450;
      const increment = targetSpeed / 60;
      
      const interval = setInterval(() => {
        setDownloadSpeed((prev) => {
          if (prev >= targetSpeed) {
            clearInterval(interval);
            setTestPhase('upload');
            setSpeedHistory([]);
            return targetSpeed;
          }
          return prev + increment;
        });
      }, 100);

      return () => clearInterval(interval);
    } else if (testPhase === 'upload') {
      const targetSpeed = 20 + Math.random() * 180;
      const increment = targetSpeed / 60;
      
      const interval = setInterval(() => {
        setUploadSpeed((prev) => {
          if (prev >= targetSpeed) {
            clearInterval(interval);
            setTestPhase('complete');
            
            updateNetworkSummary({
              currentSpeed: {
                download: Math.round(downloadSpeed),
                upload: Math.round(targetSpeed),
                ping: Math.round(ping),
              },
              lastSpeedTest: new Date().toISOString(),
            });
            
            return targetSpeed;
          }
          return prev + increment;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [testPhase, ping, downloadSpeed, updateNetworkSummary]);

  const handleStartTest = () => {
    setTestPhase('ping');
    setDownloadSpeed(0);
    setUploadSpeed(0);
    setPing(0);
    setSpeedHistory([]);
  };

  const handleReset = () => {
    setTestPhase('idle');
    setDownloadSpeed(0);
    setUploadSpeed(0);
    setPing(0);
    setSpeedHistory([]);
  };

  const getPhaseLabel = () => {
    if (testPhase === 'ping') return 'Testing Latency';
    if (testPhase === 'download') return 'Testing Download';
    if (testPhase === 'upload') return 'Testing Upload';
    if (testPhase === 'complete') return 'Complete';
    return 'Ready';
  };

  const renderGraph = () => {
    if (speedHistory.length === 0) return null;

    const maxValue = Math.max(...speedHistory, 100, 500);
    const graphColor = testPhase === 'download' ? '#2196F3' : '#FF9800';
    const barWidth = (SCREEN_WIDTH - 64) / Math.max(speedHistory.length, 30);

    return (
      <View style={styles.graphContainer}>
        <View style={styles.graph}>
          <View style={styles.graphArea}>
            {speedHistory.map((value, index) => {
              const barHeight = (value / maxValue) * GRAPH_HEIGHT;
              return (
                <View
                  key={index}
                  style={[
                    styles.graphBar,
                    {
                      width: barWidth,
                      height: barHeight,
                      backgroundColor: graphColor,
                      left: index * barWidth,
                      bottom: 0,
                      opacity: 0.6 + (index / speedHistory.length) * 0.4,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
        <Text style={styles.title}>Speed Test</Text>
        <View style={styles.statusRow}>
          <Ionicons 
            name={testPhase === 'complete' ? 'checkmark-circle' : testPhase !== 'idle' ? 'sync' : 'play-circle'} 
            size={16} 
            color={testPhase === 'complete' ? '#4CAF50' : testPhase !== 'idle' ? '#2196F3' : '#666666'} 
          />
          <Text style={styles.statusText}>{getPhaseLabel()}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Metrics Row - Horizontal */}
        <View style={styles.metricsRow}>
          <Card style={styles.metricCard}>
            <Ionicons name="download" size={18} color="#2196F3" />
            <Text style={styles.metricLabel}>Download</Text>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>
                {downloadSpeed > 0 ? downloadSpeed.toFixed(1) : '--'}
              </Text>
              <Text style={styles.metricUnit}>Mbps</Text>
            </View>
          </Card>

          <Card style={styles.metricCard}>
            <Ionicons name="cloud-upload" size={18} color="#FF9800" />
            <Text style={styles.metricLabel}>Upload</Text>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>
                {uploadSpeed > 0 ? uploadSpeed.toFixed(1) : '--'}
              </Text>
              <Text style={styles.metricUnit}>Mbps</Text>
            </View>
          </Card>

          <Card style={styles.metricCard}>
            <Ionicons name="time" size={18} color="#9C27B0" />
            <Text style={styles.metricLabel}>Ping</Text>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>
                {ping > 0 ? ping : '--'}
              </Text>
              <Text style={styles.metricUnit}>ms</Text>
            </View>
          </Card>
        </View>

        {/* Graph - Compact */}
        {(testPhase === 'download' || testPhase === 'upload' || testPhase === 'complete') && (
          <Card style={styles.graphCard}>
            {renderGraph()}
          </Card>
        )}

        {/* Action Button */}
        <View style={styles.buttonContainer}>
          {testPhase === 'idle' ? (
            <Button
              title="Start Speed Test"
              onPress={handleStartTest}
              variant="primary"
              style={styles.testButton}
            />
          ) : testPhase === 'complete' ? (
            <Button
              title="Test Again"
              onPress={handleReset}
              variant="primary"
              style={styles.testButton}
            />
          ) : (
            <Button
              title="Cancel Test"
              onPress={handleReset}
              variant="outline"
              style={styles.testButton}
            />
          )}
        </View>

        {/* Last Test - Compact */}
        {networkSummary?.lastSpeedTest && testPhase === 'idle' && networkSummary.currentSpeed && (
          <View style={styles.lastTestContainer}>
            <Text style={styles.lastTestLabel}>Last: </Text>
            <Text style={styles.lastTestValue}>
              {networkSummary.currentSpeed.download}↓ / {networkSummary.currentSpeed.upload}↑ / {networkSummary.currentSpeed.ping}ms
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    marginBottom: 0,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 6,
    marginBottom: 4,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  metricUnit: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  graphCard: {
    marginBottom: 12,
    padding: 12,
  },
  graphContainer: {
    width: '100%',
  },
  graph: {
    width: '100%',
    height: GRAPH_HEIGHT,
  },
  graphArea: {
    width: '100%',
    height: GRAPH_HEIGHT,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  graphBar: {
    position: 'absolute',
    borderRadius: 1,
  },
  buttonContainer: {
    marginBottom: 8,
  },
  testButton: {
    marginBottom: 0,
  },
  lastTestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  lastTestLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  lastTestValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
