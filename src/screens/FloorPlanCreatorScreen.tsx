import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { FloorPlanCanvas } from '../components/FloorPlanCanvas';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { RoomZone, HomeDevice, HousePlan, Door } from '../types';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type NavigationProp = StackNavigationProp<RootStackParamList, 'FloorPlanCreator'>;
type RouteProps = RouteProp<RootStackParamList, 'FloorPlanCreator'>;

export const FloorPlanCreatorScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { 
    addHousePlan, 
    updateHousePlan, 
    selectHousePlan, 
    userPostcode, 
    userAddress, 
    setUserPostcode, 
    setUserAddress, 
    userSettings,
    devices: globalDevices,
    addDevice,
    updateDevice
  } = useAppStore();
  
  const initialPlan = route.params?.initialPlan;
  const addressParam = (route.params as any)?.address;

  const [currentFloor, setCurrentFloor] = useState(0);
  const [rooms, setRooms] = useState<RoomZone[]>(initialPlan?.rooms || []);
  const [doors, setDoors] = useState<Door[]>(initialPlan?.doors || []);
  const [devices, setDevices] = useState<HomeDevice[]>([]); 
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'room' | 'device' | 'door' | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize visual layout if missing
  useEffect(() => {
    if (rooms.length > 0 && !rooms[0].x) {
      const newRooms = rooms.map((room, index) => ({
        ...room,
        x: (index % 2) * 120 + 20,
        y: Math.floor(index / 2) * 120 + 20,
        width: 100,
        height: 100,
        color: colors.cardBackground,
        wallMaterial: 'brick' as const,
      }));
      setRooms(newRooms);
    }
  }, []);

  // Load global devices into local state
  useEffect(() => {
    // We want to show all devices, or maybe filter by those that have positions?
    // For now, let's load all devices so they can be placed.
    // If we want to filter by "devices in this house", we might need a houseId on devices, 
    // but currently we assume one house context.
    setDevices(globalDevices);
  }, [globalDevices]);

  const handleUpdateRoom = (roomId: string, updates: Partial<RoomZone>) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, ...updates } : r));
  };

  const handleUpdateDevice = (deviceId: string, updates: Partial<HomeDevice>) => {
    setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, ...updates } : d));
  };

  const handleUpdateDoor = (doorId: string, updates: Partial<Door>) => {
    setDoors(prev => prev.map(d => d.id === doorId ? { ...d, ...updates } : d));
  };

  const handleSelect = (type: 'room' | 'device' | 'door' | null, id: string | null) => {
    setSelectedType(type);
    setSelectedId(id);
  };

  const handleAddRoom = (name: string) => {
    const newRoom: RoomZone = {
      id: `room-${Date.now()}`,
      name,
      floor: currentFloor,
      x: 125,
      y: 125,
      width: 100,
      height: 100,
      color: colors.cardBackground,
      estimatedAreaM2: 15,
      wallMaterial: 'brick',
    };
    setRooms([...rooms, newRoom]);
    handleSelect('room', newRoom.id);
  };

  const handleAddDoor = (type: Door['type']) => {
    const newDoor: Door = {
      id: `door-${Date.now()}`,
      x: 150,
      y: 150,
      rotation: 0,
      width: 60,
      type,
      floor: currentFloor,
    };
    setDoors([...doors, newDoor]);
    handleSelect('door', newDoor.id);
  };

  const handleAddDevice = (type: HomeDevice['type']) => {
    const newDevice: HomeDevice = {
      id: `dev-${Date.now()}`,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      x: 150,
      y: 150,
    };
    setDevices([...devices, newDevice]);
    handleSelect('device', newDevice.id);
  };

  const handleDeleteSelected = () => {
    if (!selectedId || !selectedType) return;
    
    if (selectedType === 'room') {
      setRooms(prev => prev.filter(r => r.id !== selectedId));
    } else if (selectedType === 'door') {
      setDoors(prev => prev.filter(d => d.id !== selectedId));
    } else if (selectedType === 'device') {
      setDevices(prev => prev.filter(d => d.id !== selectedId));
      // Also delete from global store? Or just remove from view until saved?
      // If we remove from local view, we should probably delete from global store on save.
      // For now, let's just remove from local view.
    }
    handleSelect(null, null);
  };

  const handleSave = async () => {
    setLoading(true);
    
    // If we have an address param (from search), save it to profile if not set
    if (addressParam && !userPostcode) {
        const parts = addressParam.split(',');
        const postcode = parts[parts.length - 1]?.trim() || '';
        const streetPart = parts[0]?.trim() || '';

        const numberMatch = streetPart.match(/^(\d+)/);
        const houseNumber = numberMatch ? numberMatch[1] : '';
        const street = streetPart.replace(/^(\d+)/, '').trim();

        if (postcode) {
            await setUserPostcode(postcode, {
                postcode,
                quality: 1,
                country: 'United Kingdom',
            } as any);
        }

        await setUserAddress({
            houseNumber,
            street,
            postcode,
            fullAddress: addressParam,
        });
    }

    // Check if a plan with this address already exists (if we're not already editing one)
    let existingPlanId = initialPlan?.applicationId;
    
    if (!existingPlanId) {
      const targetAddress = addressParam || userAddress?.fullAddress || userPostcode || 'My Home';
      // Simple normalization for comparison
      const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim();
      const targetNorm = normalize(targetAddress);
      
      const existingPlan = useAppStore.getState().housePlans.find(p => 
        normalize(p.addressLabel) === targetNorm
      );
      
      if (existingPlan) {
        existingPlanId = existingPlan.applicationId;
      }
    }

    const updatedPlan: HousePlan = {
      applicationId: existingPlanId || `VISUAL-${Date.now()}`,
      addressLabel: initialPlan?.addressLabel || addressParam || userAddress?.fullAddress || userPostcode || 'My Home',
      floors: Math.max(initialPlan?.floors || 1, currentFloor + 1),
      rooms: rooms,
      doors: doors,
      constructionDetails: initialPlan?.constructionDetails,
      createdAt: initialPlan?.createdAt || new Date().toISOString(),
    };

    if (existingPlanId) {
      await updateHousePlan(updatedPlan);
    } else {
      await addHousePlan(updatedPlan);
    }
    
    // Save devices
    // We iterate through local devices and update/add them to the global store
    for (const device of devices) {
        // Check if device exists in global store
        const existing = globalDevices.find(d => d.id === device.id);
        if (existing) {
            await updateDevice(device);
        } else {
            await addDevice(device);
        }
    }

    selectHousePlan(updatedPlan);
    setLoading(false);
    
    Alert.alert('Success', 'Floor plan saved!', [
      { 
        text: 'OK', 
        onPress: () => {
            if (userSettings.hasCompletedOnboarding) {
                navigation.navigate('Main', { screen: 'Plans' });
            } else {
                // Stay or navigate as needed
            }
        } 
      }
    ]);
  };

  const currentFloorRooms = rooms.filter(r => r.floor === currentFloor);
  const currentFloorDoors = doors.filter(d => d.floor === currentFloor);

  const renderPropertiesPanel = () => {
    if (!selectedId || !selectedType) return null;

    if (selectedType === 'room') {
      const room = rooms.find(r => r.id === selectedId);
      if (!room) return null;
      return (
        <View style={styles.propertiesPanel}>
          <View style={styles.propHeader}>
            <Text style={styles.propTitle}>Room Properties</Text>
            <TouchableOpacity onPress={handleDeleteSelected}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
          <Text style={styles.propLabel}>Wall Material</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.propOptions}>
            {['brick', 'concrete', 'drywall', 'glass'].map((mat) => (
              <TouchableOpacity 
                key={mat} 
                style={[styles.propChip, room.wallMaterial === mat && styles.propChipSelected]}
                onPress={() => handleUpdateRoom(room.id, { wallMaterial: mat as any })}
              >
                <Text style={[styles.propChipText, room.wallMaterial === mat && styles.propChipTextSelected]}>
                  {mat.charAt(0).toUpperCase() + mat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      );
    }

    if (selectedType === 'door') {
      const door = doors.find(d => d.id === selectedId);
      if (!door) return null;
      return (
        <View style={styles.propertiesPanel}>
           <View style={styles.propHeader}>
            <Text style={styles.propTitle}>Door Properties</Text>
            <TouchableOpacity onPress={handleDeleteSelected}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
          <View style={styles.propRow}>
            <Text style={styles.propLabel}>Rotation: {door.rotation}°</Text>
            <TouchableOpacity onPress={() => handleUpdateDoor(door.id, { rotation: (door.rotation + 90) % 360 })}>
              <Ionicons name="refresh" size={24} color={colors.accentBlue} />
            </TouchableOpacity>
          </View>
          <Text style={styles.propLabel}>Type</Text>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.propOptions}>
            {['standard', 'sliding', 'double'].map((type) => (
              <TouchableOpacity 
                key={type} 
                style={[styles.propChip, door.type === type && styles.propChipSelected]}
                onPress={() => handleUpdateDoor(door.id, { type: type as any })}
              >
                <Text style={[styles.propChipText, door.type === type && styles.propChipTextSelected]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      );
    }
    
    if (selectedType === 'device') {
        const device = devices.find(d => d.id === selectedId);
        if (!device) return null;
        return (
            <View style={styles.propertiesPanel}>
                <View style={styles.propHeader}>
                    <Text style={styles.propTitle}>Device Properties</Text>
                    <TouchableOpacity onPress={handleDeleteSelected}>
                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.propLabel}>Name: {device.name}</Text>
                <Text style={styles.propLabel}>Type: {device.type}</Text>
            </View>
        );
    }

    return null;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Visual Creator</Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
             <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.floorSelector}>
            {[0, 1, 2].map(floor => (
                <TouchableOpacity 
                    key={floor} 
                    style={[styles.floorTab, currentFloor === floor && styles.floorTabActive]}
                    onPress={() => {
                      setCurrentFloor(floor);
                      handleSelect(null, null);
                    }}
                >
                    <Text style={[styles.floorTabText, currentFloor === floor && styles.floorTabTextActive]}>
                        {floor === 0 ? 'Ground' : `Floor ${floor}`}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.instruction}>
            Floor {currentFloor}: Drag corners to resize. Tap items to edit.
          </Text>

          <FloorPlanCanvas
            rooms={currentFloorRooms}
            doors={currentFloorDoors}
            devices={devices} 
            onUpdateRoom={handleUpdateRoom}
            onUpdateDevice={handleUpdateDevice}
            onUpdateDoor={handleUpdateDoor}
            onSelect={handleSelect}
            selectedId={selectedId}
            backgroundImage={initialPlan?.floorplanUrl}
          />

          {renderPropertiesPanel()}

          <View style={styles.toolbar}>
            <Text style={styles.toolbarTitle}>Add Room</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.deviceList}>
              {['Living Room', 'Kitchen', 'Bedroom', 'Bathroom', 'Hallway', 'Study'].map(room => (
                  <TouchableOpacity key={room} style={styles.toolBtn} onPress={() => handleAddRoom(room)}>
                    <Ionicons name="square-outline" size={24} color={colors.textPrimary} />
                    <Text style={styles.toolLabel}>{room}</Text>
                  </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.toolbar}>
            <Text style={styles.toolbarTitle}>Add Door</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.deviceList}>
              {['standard', 'sliding', 'double'].map(type => (
                  <TouchableOpacity key={type} style={styles.toolBtn} onPress={() => handleAddDoor(type as any)}>
                    <Ionicons name="log-in-outline" size={24} color={colors.textPrimary} />
                    <Text style={styles.toolLabel}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                  </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.toolbar}>
            <Text style={styles.toolbarTitle}>Add Device</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.deviceList}>
              <TouchableOpacity style={styles.toolBtn} onPress={() => handleAddDevice('router')}>
                <Ionicons name="wifi" size={24} color={colors.textPrimary} />
                <Text style={styles.toolLabel}>Router</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolBtn} onPress={() => handleAddDevice('extender')}>
                <Ionicons name="radio-outline" size={24} color={colors.textPrimary} />
                <Text style={styles.toolLabel}>Extender</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolBtn} onPress={() => handleAddDevice('smart-tv')}>
                <Ionicons name="tv-outline" size={24} color={colors.textPrimary} />
                <Text style={styles.toolLabel}>TV</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolBtn} onPress={() => handleAddDevice('laptop')}>
                <Ionicons name="laptop-outline" size={24} color={colors.textPrimary} />
                <Text style={styles.toolLabel}>Laptop</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  saveButton: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.accentBlue,
  },
  floorSelector: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 12,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
  },
  floorTab: {
      paddingVertical: 6,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: colors.backgroundSecondary,
  },
  floorTabActive: {
      backgroundColor: colors.accentBlue,
  },
  floorTabText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
  },
  floorTabTextActive: {
      color: '#FFFFFF',
  },
  content: {
    padding: 20,
  },
  instruction: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  toolbar: {
    marginTop: 24,
  },
  toolbarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  deviceList: {
    flexDirection: 'row',
  },
  toolBtn: {
    alignItems: 'center',
    marginRight: 12,
    padding: 12,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 80,
  },
  toolLabel: {
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 4,
  },
  propertiesPanel: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  propHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  propTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  propRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  propLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  propOptions: {
    flexDirection: 'row',
  },
  propChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  propChipSelected: {
    backgroundColor: colors.accentBlue,
    borderColor: colors.accentBlue,
  },
  propChipText: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  propChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
