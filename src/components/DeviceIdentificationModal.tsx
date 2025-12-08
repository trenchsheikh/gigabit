import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { DeviceType, HomeDevice } from '../types';
import { colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';

interface DeviceIdentificationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (device: HomeDevice) => void;
  onDelete?: (deviceId: string) => void;
  selectedHousePlan?: { rooms: Array<{ id: string; name: string }> } | null;
}

import { fetchDevices, DeviceSummary } from '../services/api/devices';

const DEVICE_TYPES: { value: DeviceType; label: string; icon: string }[] = [
  { value: 'router', label: 'Router', icon: 'router' },
  { value: 'extender', label: 'WiFi Extender', icon: 'radio' },
  { value: 'smartphone', label: 'Smartphone', icon: 'phone-portrait' },
  { value: 'laptop', label: 'Laptop', icon: 'laptop' },
  { value: 'tablet', label: 'Tablet', icon: 'tablet-portrait' },
  { value: 'smart-tv', label: 'Smart TV', icon: 'tv' },
  { value: 'smart-speaker', label: 'Smart Speaker', icon: 'volume-high' },
  { value: 'gaming-console', label: 'Gaming Console', icon: 'game-controller' },
  { value: 'iot-device', label: 'IoT Device', icon: 'hardware-chip' },
  { value: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
];

export const DeviceIdentificationModal: React.FC<DeviceIdentificationModalProps> = ({
  visible,
  onClose,
  onSave,
  onDelete,
  selectedHousePlan,
}) => {
  const insets = useSafeAreaInsets();
  const { devices, deleteDevice, routerNumber } = useAppStore();
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState<DeviceType>('other');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [macAddress, setMacAddress] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [showExistingDevices, setShowExistingDevices] = useState(false);
  
  // Router Devices State
  const [routerDevices, setRouterDevices] = useState<DeviceSummary[]>([]);
  const [loadingRouterDevices, setLoadingRouterDevices] = useState(false);
  const [showRouterDevices, setShowRouterDevices] = useState(true);

  useEffect(() => {
    if (visible) {
      // Load existing saved devices
      useAppStore.getState().loadDevices();
      
      // Fetch devices from router
      fetchRouterDevices();
    }
  }, [visible]);

  const fetchRouterDevices = async () => {
    try {
      setLoadingRouterDevices(true);
      
      const data = await fetchDevices(routerNumber || undefined);
      setRouterDevices(data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoadingRouterDevices(false);
    }
  };

  const handleSelectRouterDevice = (device: DeviceSummary) => {
    setDeviceName(device.name);
    setMacAddress(device.id); // Assuming ID is MAC or similar
    // Try to guess type based on name/model/manufacturer
    const lowerName = (device.name + ' ' + (device.model || '') + ' ' + (device.manufacturer || '')).toLowerCase();
    if (lowerName.includes('tv')) setDeviceType('smart-tv');
    else if (lowerName.includes('phone') || lowerName.includes('iphone') || lowerName.includes('android')) setDeviceType('smartphone');
    else if (lowerName.includes('laptop') || lowerName.includes('macbook')) setDeviceType('laptop');
    else if (lowerName.includes('pad') || lowerName.includes('tablet')) setDeviceType('tablet');
    else if (lowerName.includes('speaker') || lowerName.includes('alexa') || lowerName.includes('google home')) setDeviceType('smart-speaker');
    else if (lowerName.includes('console') || lowerName.includes('xbox') || lowerName.includes('playstation') || lowerName.includes('nintendo')) setDeviceType('gaming-console');
    else if (lowerName.includes('extender') || lowerName.includes('mesh')) setDeviceType('extender');
    else setDeviceType('other');

    setNotes(`Connected via ${device.connectionType}. Manufacturer: ${device.manufacturer || 'Unknown'}. Model: ${device.model || 'Unknown'}`);
    
    // Collapse the list after selection
    setShowRouterDevices(false);
  };

  const getDeviceTypeIcon = (type: DeviceType): string => {
    const deviceType = DEVICE_TYPES.find((dt) => dt.value === type);
    return deviceType?.icon || 'ellipsis-horizontal';
  };

  const handleDeleteDevice = (device: HomeDevice) => {
    Alert.alert(
      'Delete Device',
      `Are you sure you want to delete "${device.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteDevice(device.id);
            if (onDelete) {
              onDelete(device.id);
            }
          },
        },
      ]
    );
  };

  const handleSave = () => {
    if (!deviceName.trim()) {
      Alert.alert('Error', 'Please enter a device name');
      return;
    }

    const selectedRoom = selectedHousePlan?.rooms.find((r) => r.id === selectedRoomId);
    
    const device: HomeDevice = {
      id: `device-${Date.now()}`,
      name: deviceName.trim(),
      type: deviceType,
      roomId: selectedRoomId || undefined,
      roomName: selectedRoom?.name || undefined,
      macAddress: macAddress.trim() || undefined,
      ipAddress: ipAddress.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(device);
    
    // Reset form
    setDeviceName('');
    setDeviceType('other');
    setSelectedRoomId('');
    setMacAddress('');
    setIpAddress('');
    setNotes('');
    onClose();
  };

  const handleCancel = () => {
    setDeviceName('');
    setDeviceType('other');
    setSelectedRoomId('');
    setMacAddress('');
    setIpAddress('');
    setNotes('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={[styles.overlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Identify Device</Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Router Devices Selection */}
            <View style={styles.section}>
              <TouchableOpacity 
                style={styles.sectionHeader} 
                onPress={() => setShowRouterDevices(!showRouterDevices)}
              >
                <Text style={styles.sectionTitle}>Detected Devices ({routerDevices.length})</Text>
                <Ionicons name={showRouterDevices ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              
              {showRouterDevices && (
                <View style={styles.routerDevicesList}>
                  {loadingRouterDevices ? (
                    <Text style={styles.loadingText}>Scanning for devices...</Text>
                  ) : routerDevices.length === 0 ? (
                    <Text style={styles.emptyText}>No devices found on router.</Text>
                  ) : (
                    routerDevices.map((device) => (
                      <TouchableOpacity
                        key={device.id}
                        style={styles.routerDeviceItem}
                        onPress={() => handleSelectRouterDevice(device)}
                      >
                        <View style={styles.routerDeviceIcon}>
                           <Ionicons name={device.connectionType === 'Ethernet' ? 'hardware-chip-outline' : 'wifi'} size={20} color={colors.accentBlue} />
                        </View>
                        <View style={styles.routerDeviceInfo}>
                          <Text style={styles.routerDeviceName}>{device.name}</Text>
                          <Text style={styles.routerDeviceMeta}>
                            {[device.manufacturer, device.model].filter(Boolean).join(' ')}
                          </Text>
                        </View>
                        <Ionicons name="add-circle-outline" size={24} color={colors.accentBlue} />
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
            </View>

            <View style={styles.divider} />

            {/* Manual Entry Form */}
            <Text style={styles.sectionTitle}>Device Details</Text>

            {/* Divider */}
            {devices.length > 0 && (
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Add New Device</Text>
                <View style={styles.dividerLine} />
              </View>
            )}

            {/* Device Name */}
            <View style={styles.field}>
              <Text style={styles.label}>Device Name *</Text>
              <TextInput
                style={styles.input}
                value={deviceName}
                onChangeText={setDeviceName}
                placeholder="e.g., Living Room TV"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Device Type */}
            <View style={styles.field}>
              <Text style={styles.label}>Device Type *</Text>
              <View style={styles.typeGrid}>
                {DEVICE_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeButton,
                      deviceType === type.value && styles.typeButtonSelected,
                    ]}
                    onPress={() => setDeviceType(type.value)}
                  >
                    <Ionicons
                      name={type.icon as any}
                      size={20}
                      color={deviceType === type.value ? colors.textPrimary : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.typeButtonText,
                        deviceType === type.value && styles.typeButtonTextSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Room Selection */}
            {selectedHousePlan && selectedHousePlan.rooms.length > 0 && (
              <View style={styles.field}>
                <Text style={styles.label}>Room Location</Text>
                <View style={styles.roomList}>
                  <TouchableOpacity
                    style={[
                      styles.roomButton,
                      !selectedRoomId && styles.roomButtonSelected,
                    ]}
                    onPress={() => setSelectedRoomId('')}
                  >
                    <Text
                      style={[
                        styles.roomButtonText,
                        !selectedRoomId && styles.roomButtonTextSelected,
                      ]}
                    >
                      None
                    </Text>
                  </TouchableOpacity>
                  {selectedHousePlan.rooms.map((room) => (
                    <TouchableOpacity
                      key={room.id}
                      style={[
                        styles.roomButton,
                        selectedRoomId === room.id && styles.roomButtonSelected,
                      ]}
                      onPress={() => setSelectedRoomId(room.id)}
                    >
                      <Text
                        style={[
                          styles.roomButtonText,
                          selectedRoomId === room.id && styles.roomButtonTextSelected,
                        ]}
                      >
                        {room.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* MAC Address */}
            <View style={styles.field}>
              <Text style={styles.label}>MAC Address (Optional)</Text>
              <TextInput
                style={styles.input}
                value={macAddress}
                onChangeText={setMacAddress}
                placeholder="e.g., AA:BB:CC:DD:EE:FF"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="characters"
              />
            </View>

            {/* IP Address */}
            <View style={styles.field}>
              <Text style={styles.label}>IP Address (Optional)</Text>
              <TextInput
                style={styles.input}
                value={ipAddress}
                onChangeText={setIpAddress}
                placeholder="e.g., 192.168.1.100"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            {/* Notes */}
            <View style={styles.field}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Additional information about this device..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save Device</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
    maxHeight: 500,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
    minWidth: '30%',
  },
  typeButtonSelected: {
    backgroundColor: colors.accentBlue,
    borderColor: colors.accentBlue,
  },
  typeButtonText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  typeButtonTextSelected: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  roomList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roomButton: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  roomButtonSelected: {
    backgroundColor: colors.accentBlue,
    borderColor: colors.accentBlue,
  },
  roomButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  roomButtonTextSelected: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  saveButton: {
    backgroundColor: colors.accentBlue,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionHeaderLeft: {
    flex: 1,
  },
  devicesList: {
    gap: 8,
    marginTop: 8,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
  },
  deviceItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  deviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  deviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  deviceTypeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  deviceMetaSeparator: {
    fontSize: 12,
    color: colors.textTertiary,
    marginHorizontal: 6,
  },
  deviceRoom: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  deviceDetails: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 2,
  },
  deleteDeviceButton: {
    padding: 8,
    marginLeft: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  routerDevicesList: {
    gap: 8,
  },
  routerDeviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  routerDeviceIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  routerDeviceInfo: {
    flex: 1,
  },
  routerDeviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  routerDeviceMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  loadingText: {
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 10,
  },
});

