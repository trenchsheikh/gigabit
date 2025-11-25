import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { DeviceIdentificationModal } from '../components/DeviceIdentificationModal';
import { useAppStore } from '../store/useAppStore';
import type { WifiHeatmapPoint, HomeDevice } from '../types';
import type { RootStackParamList } from '../navigation/types';
import type { StackNavigationProp } from '@react-navigation/stack';

const { width, height } = Dimensions.get('window');

type ARHeatmapNavigationProp = StackNavigationProp<RootStackParamList, 'ARHeatmap'>;

// Mock WiFi strength function - in production, this would query actual RSSI
const getMockWiFiStrength = (): number => {
  // Returns normalized strength 0-100
  return Math.floor(Math.random() * 40) + 60; // 60-100 for demo
};

// Grid configuration for AR heatmap
const GRID_COLS = 8;
const GRID_ROWS = 6;
const SCAN_INTERVAL = 1000; // Scan every 1 second

export const ARHeatmapScreen: React.FC = () => {
  const navigation = useNavigation<ARHeatmapNavigationProp>();
  const { updateWifiHeatmap, wifiHeatmap, selectedHousePlan, addDevice } = useAppStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [points, setPoints] = useState<WifiHeatmapPoint[]>([]);
  const [recording, setRecording] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const cameraRef = useRef<any>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate grid points for AR overlay
  const generateGridPoints = (): WifiHeatmapPoint[] => {
    const gridPoints: WifiHeatmapPoint[] = [];
    const cellWidth = width / GRID_COLS;
    const cellHeight = height / GRID_ROWS;
    
    // Start from bottom third of screen (ground level)
    const groundStartY = height * 0.6;
    
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const x = col * cellWidth + cellWidth / 2;
        const y = groundStartY + row * cellHeight + cellHeight / 2;
        
        // Only add points that are within screen bounds
        if (y < height - 50) {
          const strength = getMockWiFiStrength();
          const strengthDbm = -100 + strength;
          
          gridPoints.push({
            id: `grid-${row}-${col}`,
            x,
            y,
            strengthDbm,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
    
    return gridPoints;
  };

  // Auto-scan function
  const performAutoScan = () => {
    if (!recording) return;
    
    const newPoints = generateGridPoints();
    setPoints((prev) => {
      // Update existing points or add new ones
      const updatedPoints = [...prev];
      newPoints.forEach((newPoint) => {
        const existingIndex = updatedPoints.findIndex((p) => p.id === newPoint.id);
        if (existingIndex >= 0) {
          // Update existing point with new strength
          updatedPoints[existingIndex] = newPoint;
        } else {
          // Add new point
          updatedPoints.push(newPoint);
        }
      });
      return updatedPoints;
    });
  };

  const handleStartRecording = () => {
    setRecording(true);
    // Start auto-scanning
    performAutoScan(); // Initial scan
    scanIntervalRef.current = setInterval(performAutoScan, SCAN_INTERVAL);
  };

  const handleStopRecording = async () => {
    setRecording(false);
    
    // Stop auto-scanning
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    // Calculate room averages if house plan is selected
    const roomAverages: Record<string, number> = {};
    if (selectedHousePlan) {
      selectedHousePlan.rooms.forEach((room) => {
        const roomPoints = points.filter((p) => p.roomId === room.id);
        if (roomPoints.length > 0) {
          const avg =
            roomPoints.reduce((sum, p) => sum + p.strengthDbm, 0) /
            roomPoints.length;
          roomAverages[room.id] = avg;
        }
      });
    }

    await updateWifiHeatmap({
      points,
      roomAverages,
    });

    Alert.alert(
      'Scan Complete',
      `Recorded ${points.length} points. View summary?`,
      [
        {
          text: 'View Summary',
          onPress: () => navigation.navigate('HeatmapSummary'),
        },
        { text: 'OK' },
      ]
    );
  };

  // Cleanup interval on unmount
  React.useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, []);

  const handleClear = () => {
    Alert.alert('Clear Points', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => setPoints([]),
      },
    ]);
  };

  const handleSaveDevice = async (device: HomeDevice) => {
    await addDevice(device);
    Alert.alert('Success', `Device "${device.name}" has been added to your network.`);
    // Devices list will auto-refresh via the modal's useEffect
  };

  const getStrengthColor = (strength: number): string => {
    // strength is 0-100 normalized
    if (strength >= 80) return '#4CAF50'; // Green - Strong
    if (strength >= 60) return '#FFC107'; // Yellow - Medium
    if (strength >= 40) return '#FF9800'; // Orange - Weak
    return '#F44336'; // Red - Very Weak
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera permission is required</Text>
        <Button
          title="Grant Permission"
          onPress={requestPermission}
          variant="primary"
          style={styles.button}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      >
        {/* AR Heatmap Overlay - Flat ground markers */}
        {points.map((point) => {
          const normalizedStrength = point.strengthDbm + 100; // Convert back to 0-100
          const color = getStrengthColor(normalizedStrength);
          return (
            <View
              key={point.id}
              style={[
                styles.heatmapMarker,
                {
                  left: point.x - 25,
                  top: point.y - 25,
                },
              ]}
            >
              {/* Outer glow ring */}
              <View
                style={[
                  styles.markerGlow,
                  {
                    backgroundColor: color,
                    opacity: 0.3,
                  },
                ]}
              />
              {/* Main marker circle */}
              <View
                style={[
                  styles.markerCircle,
                  {
                    backgroundColor: color,
                  },
                ]}
              />
              {/* Inner highlight */}
              <View
                style={[
                  styles.markerInner,
                  {
                    backgroundColor: color,
                    opacity: 0.8,
                  },
                ]}
              />
            </View>
          );
        })}

        {/* Overlay UI */}
        <View style={styles.overlay}>
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructions}>
              {recording
                ? 'Scanning WiFi signal strength automatically...'
                : 'Press Start to begin AR scanning'}
            </Text>
            {recording && (
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>Live Scanning</Text>
              </View>
            )}
          </View>

          <View style={styles.legend}>
            <Text style={styles.legendTitle}>Signal Strength</Text>
            <View style={styles.legendRow}>
              <View style={[styles.legendItem, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendLabel}>Strong</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendItem, { backgroundColor: '#FFC107' }]} />
              <Text style={styles.legendLabel}>Medium</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendItem, { backgroundColor: '#FF9800' }]} />
              <Text style={styles.legendLabel}>Weak</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendItem, { backgroundColor: '#F44336' }]} />
              <Text style={styles.legendLabel}>Very Weak</Text>
            </View>
          </View>

          <View style={styles.controls}>
            {!recording ? (
              <Button
                title="Start Scanning"
                onPress={handleStartRecording}
                variant="primary"
                style={styles.controlButton}
              />
            ) : (
              <Button
                title="Stop & Save"
                onPress={handleStopRecording}
                variant="primary"
                style={styles.controlButton}
              />
            )}
            <TouchableOpacity
              style={styles.identifyDeviceButton}
              onPress={() => setShowDeviceModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              <Text style={styles.identifyDeviceText}>Identify Device</Text>
            </TouchableOpacity>
            {points.length > 0 && (
              <Button
                title="Clear"
                onPress={handleClear}
                variant="outline"
                style={styles.controlButton}
              />
            )}
            <Text style={styles.pointsCount}>
              Points: {points.length}
            </Text>
          </View>
        </View>
      </CameraView>

      <DeviceIdentificationModal
        visible={showDeviceModal}
        onClose={() => setShowDeviceModal(false)}
        onSave={handleSaveDevice}
        selectedHousePlan={selectedHousePlan}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 16,
  },
  instructionsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 8,
    marginTop: 40,
  },
  instructions: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
    marginRight: 8,
  },
  recordingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  legend: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  legendTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendItem: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendLabel: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  controls: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
    borderRadius: 8,
  },
  controlButton: {
    marginBottom: 8,
  },
  identifyDeviceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  identifyDeviceText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pointsCount: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  heatmapMarker: {
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerGlow: {
    position: 'absolute',
    width: 50,
    height: 30, // Flattened for ground perspective
    borderRadius: 25,
    opacity: 0.25,
    transform: [{ scaleY: 0.6 }], // Flatten to simulate ground view
  },
  markerCircle: {
    position: 'absolute',
    width: 40,
    height: 24, // Flattened for ground perspective
    borderRadius: 20,
    opacity: 0.9,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    transform: [{ scaleY: 0.6 }], // Flatten to simulate ground view
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5, // Android shadow
  },
  markerInner: {
    position: 'absolute',
    width: 24,
    height: 14, // Flattened for ground perspective
    borderRadius: 12,
    opacity: 0.95,
    transform: [{ scaleY: 0.6 }], // Flatten to simulate ground view
  },
  message: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  button: {
    marginTop: 20,
    marginHorizontal: 40,
  },
});


