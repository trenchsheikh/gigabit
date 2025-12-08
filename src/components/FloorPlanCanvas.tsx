import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { RoomZone, HomeDevice, Door } from '../types';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, runOnJS } from 'react-native-reanimated';

interface FloorPlanCanvasProps {
  rooms: RoomZone[];
  devices: HomeDevice[];
  doors?: Door[];
  onUpdateRoom: (roomId: string, updates: Partial<RoomZone>) => void;
  onUpdateDevice: (deviceId: string, updates: Partial<HomeDevice>) => void;
  onUpdateDoor?: (doorId: string, updates: Partial<Door>) => void;
  onSelect?: (type: 'room' | 'device' | 'door' | null, id: string | null) => void;
  selectedId?: string | null;
  readOnly?: boolean;
  backgroundImage?: any;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_SIZE = Math.min(SCREEN_WIDTH - 40, 350);
const GRID_SIZE = 20;

const DraggableRoom = ({ 
  room, 
  onUpdate, 
  onSelect, 
  isSelected, 
  readOnly 
}: { 
  room: RoomZone; 
  onUpdate: (id: string, updates: Partial<RoomZone>) => void; 
  onSelect?: (id: string) => void;
  isSelected?: boolean;
  readOnly?: boolean;
}) => {
  const translateX = useSharedValue(room.x || 0);
  const translateY = useSharedValue(room.y || 0);
  const width = useSharedValue(room.width || 100);
  const height = useSharedValue(room.height || 100);
  
  const context = useSharedValue({ x: 0, y: 0, w: 0, h: 0 });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = { x: translateX.value, y: translateY.value, w: width.value, h: height.value };
      if (onSelect) runOnJS(onSelect)(room.id);
    })
    .onUpdate((event) => {
      if (readOnly) return;
      translateX.value = context.value.x + event.translationX;
      translateY.value = context.value.y + event.translationY;
    })
    .onEnd(() => {
      if (readOnly) return;
      const snappedX = Math.round(translateX.value / GRID_SIZE) * GRID_SIZE;
      const snappedY = Math.round(translateY.value / GRID_SIZE) * GRID_SIZE;
      translateX.value = snappedX;
      translateY.value = snappedY;
      runOnJS(onUpdate)(room.id, { x: snappedX, y: snappedY });
    });

  const resizeGesture = Gesture.Pan()
    .onStart(() => {
      context.value = { x: translateX.value, y: translateY.value, w: width.value, h: height.value };
    })
    .onUpdate((event) => {
      if (readOnly) return;
      width.value = Math.max(GRID_SIZE * 2, context.value.w + event.translationX);
      height.value = Math.max(GRID_SIZE * 2, context.value.h + event.translationY);
    })
    .onEnd(() => {
      if (readOnly) return;
      const snappedW = Math.round(width.value / GRID_SIZE) * GRID_SIZE;
      const snappedH = Math.round(height.value / GRID_SIZE) * GRID_SIZE;
      width.value = snappedW;
      height.value = snappedH;
      runOnJS(onUpdate)(room.id, { width: snappedW, height: snappedH });
    });

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
      width: width.value,
      height: height.value,
    };
  });

  const getBorderColor = () => {
    if (isSelected) return colors.accentBlue;
    if (room.wallMaterial === 'brick') return '#8D6E63';
    if (room.wallMaterial === 'concrete') return '#9E9E9E';
    if (room.wallMaterial === 'glass') return '#81D4FA';
    return colors.textSecondary;
  };

  const getBorderWidth = () => {
    if (isSelected) return 3;
    if (room.wallMaterial === 'brick' || room.wallMaterial === 'concrete') return 4;
    return 2;
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.room,
          {
            backgroundColor: room.color || colors.cardBackground,
            borderColor: getBorderColor(),
            borderWidth: getBorderWidth(),
          },
          rStyle,
        ]}
      >
        <Text style={styles.roomLabel}>{room.name}</Text>
        
        {isSelected && !readOnly && (
           <GestureDetector gesture={resizeGesture}>
             <View style={styles.resizeHandle} />
           </GestureDetector>
        )}
      </Animated.View>
    </GestureDetector>
  );
};

const DraggableDoor = ({ 
  door, 
  onUpdate, 
  onSelect, 
  isSelected, 
  readOnly 
}: { 
  door: Door; 
  onUpdate: (id: string, updates: Partial<Door>) => void; 
  onSelect?: (id: string) => void;
  isSelected?: boolean;
  readOnly?: boolean;
}) => {
  const translateX = useSharedValue(door.x || 0);
  const translateY = useSharedValue(door.y || 0);
  const context = useSharedValue({ x: 0, y: 0 });

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { x: translateX.value, y: translateY.value };
      if (onSelect) runOnJS(onSelect)(door.id);
    })
    .onUpdate((event) => {
      if (readOnly) return;
      translateX.value = context.value.x + event.translationX;
      translateY.value = context.value.y + event.translationY;
    })
    .onEnd(() => {
      if (readOnly) return;
      const snappedX = Math.round(translateX.value / (GRID_SIZE/2)) * (GRID_SIZE/2); // Finer grid for doors
      const snappedY = Math.round(translateY.value / (GRID_SIZE/2)) * (GRID_SIZE/2);
      translateX.value = snappedX;
      translateY.value = snappedY;
      runOnJS(onUpdate)(door.id, { x: snappedX, y: snappedY });
    });

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value }, 
        { translateY: translateY.value },
        { rotate: `${door.rotation}deg` }
      ],
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View 
        style={[
          styles.door, 
          { 
            width: door.width, 
            borderColor: isSelected ? colors.accentBlue : '#5D4037' 
          }, 
          rStyle
        ]}
      >
        <View style={styles.doorArc} />
      </Animated.View>
    </GestureDetector>
  );
};

const DraggableDevice = ({ device, onUpdate, readOnly }: { device: HomeDevice; onUpdate: (id: string, x: number, y: number) => void; readOnly?: boolean }) => {
  const translateX = useSharedValue(device.x || 0);
  const translateY = useSharedValue(device.y || 0);
  const context = useSharedValue({ x: 0, y: 0 });

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { x: translateX.value, y: translateY.value };
    })
    .onUpdate((event) => {
      if (readOnly) return;
      translateX.value = context.value.x + event.translationX;
      translateY.value = context.value.y + event.translationY;
    })
    .onEnd(() => {
      if (readOnly) return;
      runOnJS(onUpdate)(device.id, translateX.value, translateY.value);
    });

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    };
  });

  const getIconName = (type: string) => {
    switch (type) {
      case 'router': return 'wifi';
      case 'extender': return 'radio-outline';
      case 'smartphone': return 'phone-portrait-outline';
      case 'laptop': return 'laptop-outline';
      case 'smart-tv': return 'tv-outline';
      default: return 'hardware-chip-outline';
    }
  };

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.device, rStyle]}>
        <Ionicons name={getIconName(device.type) as any} size={24} color={colors.accentBlue} />
      </Animated.View>
    </GestureDetector>
  );
};

export const FloorPlanCanvas: React.FC<FloorPlanCanvasProps> = ({
  rooms,
  devices,
  doors = [],
  onUpdateRoom,
  onUpdateDevice,
  onUpdateDoor,
  onSelect,
  selectedId,
  readOnly = false,
  backgroundImage,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.canvas}>
        {/* Background Image */}
        {backgroundImage && (
          <Image
            source={backgroundImage}
            style={StyleSheet.absoluteFill}
            resizeMode="contain"
          />
        )}

        {/* Grid Background */}
        <View style={[styles.grid, { opacity: backgroundImage ? 0.3 : 1 }]}> 
          {Array.from({ length: CANVAS_SIZE / GRID_SIZE }).map((_, i) => (
            <View key={`v-${i}`} style={[styles.gridLineV, { left: i * GRID_SIZE }]} />
          ))}
          {Array.from({ length: CANVAS_SIZE / GRID_SIZE }).map((_, i) => (
            <View key={`h-${i}`} style={[styles.gridLineH, { top: i * GRID_SIZE }]} />
          ))}
        </View>

        {rooms.map((room) => (
          <DraggableRoom
            key={room.id}
            room={room}
            onUpdate={(id, updates) => onUpdateRoom(id, updates)}
            onSelect={(id) => onSelect && onSelect('room', id)}
            isSelected={selectedId === room.id}
            readOnly={readOnly}
          />
        ))}

        {doors.map((door) => (
          <DraggableDoor
            key={door.id}
            door={door}
            onUpdate={(id, updates) => onUpdateDoor && onUpdateDoor(id, updates)}
            onSelect={(id) => onSelect && onSelect('door', id)}
            isSelected={selectedId === door.id}
            readOnly={readOnly}
          />
        ))}

        {devices.map((device) => (
          <DraggableDevice
            key={device.id}
            device={device}
            onUpdate={(id, x, y) => onUpdateDevice(id, { x, y })}
            readOnly={readOnly}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    backgroundColor: '#F5F7FA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#E1E4E8',
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E1E4E8',
  },
  room: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    opacity: 0.9,
  },
  roomLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  resizeHandle: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: 20,
    height: 20,
    backgroundColor: colors.accentBlue,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFF',
    zIndex: 10,
  },
  door: {
    position: 'absolute',
    height: 10,
    backgroundColor: 'transparent',
    borderBottomWidth: 4,
    zIndex: 50,
  },
  doorArc: {
    position: 'absolute',
    top: -30,
    left: 0,
    width: 30,
    height: 30,
    borderTopLeftRadius: 30,
    borderWidth: 1,
    borderColor: '#5D4037',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    opacity: 0.5,
  },
  device: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 100, // Devices on top of rooms
  },
});
