import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Alert,
    Modal,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import NetInfo, { useNetInfo } from '@react-native-community/netinfo';

import { Button } from '../components/Button';
import { DeviceIdentificationModal } from '../components/DeviceIdentificationModal';
import { FloorPlanCanvas } from '../components/FloorPlanCanvas';
import { useAppStore } from '../store/useAppStore';
import type { WifiHeatmapPoint, HomeDevice } from '../types';
import type { RootStackParamList } from '../navigation/types';
import type { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

type ARHeatmapNavigationProp = StackNavigationProp<RootStackParamList, 'ARHeatmap'>;

const SPEEDTEST_URL = 'https://gigabitiq.speedtestcustom.com/';

// Grid configuration for AR heatmap
const GRID_COLS = 8;
const GRID_ROWS = 6;
// Slightly slower interval because we are hitting a real server
const SCAN_INTERVAL = 5000; // 5 seconds

type SpeedMetrics = {
  latencyMs: number | null;
  downloadMs: number | null;
  strengthNormalized: number; // 0–100
  offline: boolean;
};

  // Map network performance → 0–100 strength
  const normalizeStrength = (latencyMs: number, downloadMs: number): number => {
    let score = 100;

    // Penalise latency (Standard: Lower is better)
    // If user meant "High Latency = Green", they likely meant "High Performance" or "High Signal".
    // We will stick to "High Score = Green".
    if (latencyMs > 50) score -= Math.min((latencyMs - 50) / 2, 40);
    if (downloadMs > 500) score -= Math.min((downloadMs - 500) / 10, 40);

    if (score < 0) score = 0;
    if (score > 100) score = 100;
    return score;
  };

  const getStrengthColor = (strength: number): string => {
    // "Anything above 60 goes green"
    // "Between 50 is amber"
    // "Below 50 signal score is red"
    if (strength > 60) return '#4CAF50'; // Green
    if (strength >= 50) return '#FFC107'; // Amber
    return '#F44336'; // Red
  };

  export const ARHeatmapScreen: React.FC = () => {
    const navigation = useNavigation<ARHeatmapNavigationProp>();
    const { updateWifiHeatmap, selectedHousePlan, addDevice } = useAppStore();

    const [permission, requestPermission] = useCameraPermissions();
    const [points, setPoints] = useState<WifiHeatmapPoint[]>([]);
    const [recording, setRecording] = useState(false);
    const [showDeviceModal, setShowDeviceModal] = useState(false);
    
    // Pin Drop State
    const [showPinDropModal, setShowPinDropModal] = useState(false);
    const [pendingDevice, setPendingDevice] = useState<HomeDevice | null>(null);
    const [tempDevicePos, setTempDevicePos] = useState<{x: number, y: number}>({ x: 175, y: 175 }); // Center of 350x350 canvas

    const [speedMetrics, setSpeedMetrics] = useState<SpeedMetrics>({
      latencyMs: null,
      downloadMs: null,
      strengthNormalized: 0,
      offline: false,
    });

    const [liveStrength, setLiveStrength] = useState(0);

    const netInfo = useNetInfo();
    const [networkType, setNetworkType] = useState<string>('unknown');

    const cameraRef = useRef<any>(null);
    const scanIntervalRef = useRef<any>(null);
    const liveAnimRef = useRef<any>(null);

    useEffect(() => {
      if (netInfo.type) {
        setNetworkType(netInfo.type);
      }
    }, [netInfo.type]);

    // Simulate live signal fluctuation
    useEffect(() => {
      liveAnimRef.current = setInterval(() => {
        setLiveStrength((prev) => {
          const target = speedMetrics.strengthNormalized;
          // Move towards target with some noise
          const diff = target - prev;
          const step = diff * 0.1; // Smooth approach
          const noise = (Math.random() - 0.5) * 2; // +/- 1 jitter
          let next = prev + step + noise;
          
          // Clamp
          if (next < 0) next = 0;
          if (next > 100) next = 100;
          return next;
        });
      }, 100); // 10fps update

      return () => {
        if (liveAnimRef.current) clearInterval(liveAnimRef.current);
      };
    }, [speedMetrics.strengthNormalized]);

    const runHiddenSpeedTest = async (): Promise<SpeedMetrics> => {
      try {
        if (netInfo.isConnected === false) {
          return { latencyMs: null, downloadMs: null, strengthNormalized: 10, offline: true };
        }
        const state = await NetInfo.fetch();
        if (!state.isConnected) {
          return { latencyMs: null, downloadMs: null, strengthNormalized: 10, offline: true };
        }

        const url = `${SPEEDTEST_URL}?_=${Date.now()}`;
        const t1 = Date.now();
        const res = await fetch(url, {
          method: 'GET',
          headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
        });
        const latencyMs = Date.now() - t1;

        const d1 = Date.now();
        await res.arrayBuffer();
        const downloadMs = Date.now() - d1;

        const strengthNormalized = normalizeStrength(latencyMs, downloadMs);

        return { latencyMs, downloadMs, strengthNormalized, offline: false };
      } catch (err) {
        console.warn('Hidden speed test error', err);
        return { latencyMs: null, downloadMs: null, strengthNormalized: 10, offline: true };
      }
    };

    // Generate a single point at the center for the heatmap trail
    const generateCenterPoint = (strengthNormalized: number): WifiHeatmapPoint => {
      const centerX = width / 2;
      const centerY = height / 2;
      const strengthDbm = -100 + strengthNormalized;

      return {
        id: `point-${Date.now()}`,
        x: centerX,
        y: centerY,
        strengthDbm,
        createdAt: new Date().toISOString(),
      };
    };

    const performAutoScan = async () => {
      const metrics = await runHiddenSpeedTest();
      setSpeedMetrics(metrics);
      
      // Add a single point to the recorded history (trail)
      const newPoint = generateCenterPoint(metrics.strengthNormalized);
      setPoints((prev) => [...prev, newPoint]);
    };

    const handleStartRecording = () => {
      setRecording(true);
      void performAutoScan();
      scanIntervalRef.current = setInterval(() => {
        void performAutoScan();
      }, SCAN_INTERVAL);
    };

    const handleStopRecording = async () => {
      setRecording(false);
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }

      const roomAverages: Record<string, number> = {};
      if (selectedHousePlan) {
        selectedHousePlan.rooms.forEach((room) => {
          const roomPoints = points.filter((p) => p.roomId === room.id);
          if (roomPoints.length > 0) {
            const avg = roomPoints.reduce((sum, p) => sum + p.strengthDbm, 0) / roomPoints.length;
            roomAverages[room.id] = avg;
          }
        });
      }

      await updateWifiHeatmap({ points, roomAverages });
      Alert.alert(
        'Scan Complete',
        `Recorded ${points.length} points.`,
        [
          { text: 'View Summary', onPress: () => navigation.navigate('HeatmapSummary') },
          { text: 'OK' },
        ]
      );
    };

    useEffect(() => {
      return () => {
        if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
        if (liveAnimRef.current) clearInterval(liveAnimRef.current);
      };
    }, []);

    const handleClear = () => {
      Alert.alert('Clear Data', 'Clear all scan points?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => setPoints([]) },
      ]);
    };

    const handleDeviceIdentified = (device: HomeDevice) => {
      setPendingDevice(device);
      // Default position or try to find a good spot? Center is fine for now.
      setTempDevicePos({ x: 175, y: 175 }); 
      setShowDeviceModal(false);
      setShowPinDropModal(true);
    };

    const handleConfirmPinDrop = async () => {
      if (pendingDevice) {
        const finalDevice = {
          ...pendingDevice,
          x: tempDevicePos.x,
          y: tempDevicePos.y,
        };
        await addDevice(finalDevice);
        Alert.alert('Device Saved', `Device "${finalDevice.name}" added to floor plan.`);
        setPendingDevice(null);
        setShowPinDropModal(false);
      }
    };

    const currentStrengthColor = getStrengthColor(liveStrength);

    if (!permission) return <View style={styles.container} />;
    if (!permission.granted) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.message}>Camera permission required</Text>
          <Button title="Grant Permission" onPress={requestPermission} />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back" />

        {/* AR Markers (Recorded Trail) */}
        <View style={styles.arLayer} pointerEvents="none">
          {points.map((point) => {
            const normalizedStrength = point.strengthDbm + 100;
            const color = getStrengthColor(normalizedStrength);
            return (
              <View
                key={point.id}
                style={[styles.heatmapMarker, { left: point.x - 10, top: point.y - 10 }]}
              >
                <View style={[styles.trailDot, { backgroundColor: color }]} />
              </View>
            );
          })}
        </View>

        {/* UI Overlay */}
        <View style={styles.overlay} pointerEvents="box-none">
          {/* Header Card */}
          <View style={styles.headerCard}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.headerTitle}>AR Signal Scanner</Text>
                <Text style={styles.headerSubtitle}>
                  {recording ? 'Scanning environment...' : 'Ready to scan'}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: speedMetrics.offline ? '#9E9E9E' : currentStrengthColor }]}>
                 <Text style={styles.statusText}>
                   {speedMetrics.offline ? 'OFFLINE' : liveStrength >= 70 ? 'GOOD' : liveStrength >= 40 ? 'OKAY' : 'POOR'}
                 </Text>
              </View>
            </View>

            <View style={styles.metricsGrid}>
               <View style={styles.metricItem}>
                 <Text style={styles.metricLabel}>SIGNAL SCORE</Text>
                 <Text style={[styles.metricValue, { color: currentStrengthColor }]}>
                   {Math.round(liveStrength)}
                 </Text>
               </View>
               <View style={styles.divider} />
               <View style={styles.metricItem}>
                 <Text style={styles.metricLabel}>LATENCY</Text>
                 <Text style={styles.metricValue}>
                   {speedMetrics.latencyMs ? `${speedMetrics.latencyMs}ms` : '--'}
                 </Text>
               </View>
               <View style={styles.divider} />
               <View style={styles.metricItem}>
                 <Text style={styles.metricLabel}>DOWNLOAD</Text>
                 <Text style={styles.metricValue}>
                   {speedMetrics.downloadMs ? `${speedMetrics.downloadMs}ms` : '--'}
                 </Text>
               </View>
            </View>
          </View>

          {/* Live Hexagon Reticle (Center) */}
          <View style={styles.reticleContainer} pointerEvents="none">

             {/* Surrounding Circles */}
             {[0, 60, 120, 180, 240, 300].map((angle, i) => {
                const rad = angle * (Math.PI / 180);
                const radius = 60;
                const x = radius * Math.cos(rad);
                const y = radius * Math.sin(rad);
                return (
                  <View 
                    key={i} 
                    style={[
                      styles.hexCircle, 
                      { 
                        backgroundColor: currentStrengthColor,
                        transform: [{ translateX: x }, { translateY: y }] 
                      }
                    ]} 
                  />
                );
             })}
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomContainer}>
            
            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.sideButton]}
                onPress={() => setShowDeviceModal(true)}
              >
                <Ionicons name="add" size={28} color="#FFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.mainButton, 
                  { 
                    backgroundColor: recording ? '#FFF' : currentStrengthColor,
                    borderColor: recording ? currentStrengthColor : 'transparent',
                    borderWidth: recording ? 4 : 0
                  }
                ]}
                onPress={recording ? handleStopRecording : handleStartRecording}
              >
                <Ionicons 
                  name={recording ? "stop" : "scan"} 
                  size={32} 
                  color={recording ? currentStrengthColor : "#FFF"} 
                />
              </TouchableOpacity>

              {points.length > 0 ? (
                <TouchableOpacity
                  style={[styles.sideButton]}
                  onPress={handleClear}
                >
                  <Ionicons name="trash-outline" size={24} color="#FFF" />
                </TouchableOpacity>
              ) : (
                <View style={styles.sideButtonPlaceholder} />
              )}
            </View>
          </View>
        </View>

        <DeviceIdentificationModal
          visible={showDeviceModal}
          onClose={() => setShowDeviceModal(false)}
          onSave={handleDeviceIdentified}
          selectedHousePlan={selectedHousePlan}
        />

        {/* Pin Drop Modal */}
        <Modal
          visible={showPinDropModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPinDropModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Pin Device Location</Text>
                <TouchableOpacity onPress={() => setShowPinDropModal(false)}>
                  <Ionicons name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalSubtitle}>
                Drag the {pendingDevice?.name} to its location on the floor plan.
              </Text>

              <View style={styles.canvasContainer}>
                {selectedHousePlan ? (
                  <FloorPlanCanvas
                    rooms={selectedHousePlan.rooms}
                    doors={selectedHousePlan.doors}
                    devices={[
                      ...(selectedHousePlan.rooms.flatMap(r => [])), // We might want to show existing devices too, but for now just the new one
                      ...(pendingDevice ? [{ ...pendingDevice, x: tempDevicePos.x, y: tempDevicePos.y }] : [])
                    ]}
                    onUpdateDevice={(id, updates) => {
                      if (id === pendingDevice?.id && updates.x !== undefined && updates.y !== undefined) {
                        setTempDevicePos({ x: updates.x, y: updates.y });
                      }
                    }}
                    onUpdateRoom={() => {}} // Read only rooms
                    readOnly={false} // Allow moving the device
                    backgroundImage={selectedHousePlan.floorplanUrl}
                  />
                ) : (
                  <View style={styles.noPlanContainer}>
                    <Text style={styles.noPlanText}>No floor plan selected.</Text>
                  </View>
                )}
              </View>

              <Button 
                title="Confirm Location" 
                onPress={handleConfirmPinDrop}
                style={styles.confirmButton}
              />
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000',
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000',
    },
    camera: {
      flex: 1,
    },
    arLayer: {
      ...StyleSheet.absoluteFillObject,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'space-between',
      paddingTop: 60,
      paddingBottom: 40,
      paddingHorizontal: 20,
    },
    headerCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: 24,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 24,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: '#1A1A1A',
      letterSpacing: 0.5,
    },
    headerSubtitle: {
      fontSize: 14,
      color: '#666',
      marginTop: 4,
      fontWeight: '500',
    },
    statusBadge: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 16,
    },
    statusText: {
      color: '#FFF',
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1,
    },
    metricsGrid: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    metricItem: {
      alignItems: 'center',
      flex: 1,
    },
    divider: {
      width: 1,
      height: 32,
      backgroundColor: '#E0E0E0',
    },
    metricLabel: {
      fontSize: 11,
      color: '#888',
      fontWeight: '700',
      marginBottom: 6,
      letterSpacing: 0.5,
    },
    metricValue: {
      fontSize: 20,
      fontWeight: '800',
      color: '#1A1A1A',
    },
    reticleContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    hexCircle: {
      position: 'absolute',
      width: 24,
      height: 24,
      borderRadius: 12,
      opacity: 0.8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    bottomContainer: {
      alignItems: 'center',
      gap: 24,
      marginBottom: 10,
    },

    actionButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      paddingHorizontal: 20,
    },
    mainButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 10,
    },
    sideButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    sideButtonPlaceholder: {
      width: 56,
      height: 56,
    },
    heatmapMarker: {
      position: 'absolute',
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    trailDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: '#FFF',
    },
    message: {
      color: '#FFF',
      fontSize: 16,
      marginBottom: 20,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.background,
      borderRadius: 20,
      padding: 20,
      width: '100%',
      maxHeight: '90%',
      alignItems: 'center',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginBottom: 12,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    modalSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 20,
      textAlign: 'center',
    },
    canvasContainer: {
      width: '100%',
      aspectRatio: 1,
      backgroundColor: '#F5F7FA',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    noPlanContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    noPlanText: {
      color: colors.textSecondary,
      fontSize: 16,
    },
    confirmButton: {
      width: '100%',
    },
  });
