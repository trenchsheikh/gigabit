import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Card } from '../components/Card';
import { useAppStore } from '../store/useAppStore';
import type { RootStackParamList } from '../navigation/types';
import type { RouteProp } from '@react-navigation/native';

const PLANNING_PORTAL_URL =
  'https://publicaccess.easthants.gov.uk/planning/index.html?fa=getApplication&id=181392';

type HousePlanDetailRouteProp = RouteProp<RootStackParamList, 'HousePlanDetail'>;

export const HousePlanDetailScreen: React.FC = () => {
  const route = useRoute<HousePlanDetailRouteProp>();
  const { planId } = route.params;
  const { housePlans } = useAppStore();
  const [plan, setPlan] = useState(
    housePlans.find((p) => p.applicationId === planId)
  );

  useEffect(() => {
    const foundPlan = housePlans.find((p) => p.applicationId === planId);
    setPlan(foundPlan);
  }, [planId, housePlans]);

  const handleViewPlanningPortal = async () => {
    try {
      await Linking.openURL(PLANNING_PORTAL_URL);
    } catch (error) {
      Alert.alert('Error', 'Failed to open planning portal');
    }
  };

  if (!plan) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Plan not found</Text>
      </View>
    );
  }

  const roomsByFloor = plan.rooms.reduce(
    (acc, room) => {
      if (!acc[room.floor]) {
        acc[room.floor] = [];
      }
      acc[room.floor].push(room);
      return acc;
    },
    {} as Record<number, typeof plan.rooms>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.headerCard}>
        <Text style={styles.address}>{plan.addressLabel}</Text>
        <Text style={styles.applicationId}>Application ID: {plan.applicationId}</Text>
        <Text style={styles.info}>
          {plan.floors} floor{plan.floors !== 1 ? 's' : ''} • {plan.rooms.length} rooms
        </Text>
      </Card>

      {Object.entries(roomsByFloor)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([floor, rooms]) => (
          <Card key={floor} style={styles.floorCard}>
            <Text style={styles.floorTitle}>
              {floor === '0' ? 'Ground Floor' : `Floor ${floor}`}
            </Text>
            {rooms.map((room) => (
              <View key={room.id} style={styles.roomItem}>
                <Text style={styles.roomName}>{room.name}</Text>
                {room.estimatedAreaM2 && (
                  <Text style={styles.roomArea}>
                    {room.estimatedAreaM2} m²
                  </Text>
                )}
              </View>
            ))}
          </Card>
        ))}

      <TouchableOpacity
        style={styles.linkContainer}
        onPress={handleViewPlanningPortal}
      >
        <Text style={styles.linkText}>View Planning Application Online →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  content: {
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
  },
  address: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  applicationId: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  info: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  floorCard: {
    marginBottom: 16,
  },
  floorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  roomItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  roomName: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  roomArea: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  linkContainer: {
    marginTop: 8,
    marginBottom: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#666',
    fontSize: 16,
  },
});


