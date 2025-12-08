import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar, Alert, Modal, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { postcodeService } from '../services/postcode';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

type AddressSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddressSelection'>;

interface AddressItem {
  id: string;
  address: string;
  routerNumber: string;
}

const ADDRESSES: AddressItem[] = [
  { id: '1', address: '14 Hunters Place, Hindhead, Surrey, GU26 6UY', routerNumber: 'CXNK00EB4D45' },
  { id: '2', address: '15 Glenville Gardens, Grayshott, Hampshire, GU26 6SX', routerNumber: 'CXNK00EB4C99' },
  { id: '3', address: 'Holmwood Glen Road, Grayshott, Hampshire, GU26 6NF', routerNumber: 'CXNK00EB56EB' },
  { id: '4', address: 'Spurfold House Church Lane, Grayshott, Hampshire, GU26 6LY', routerNumber: 'CXNK00EB5893' },
  { id: '5', address: 'Heatherlands Headley Road, Grayshott, Hampshire, GU26 6TN', routerNumber: 'CXNK00EB58CE' },
  { id: '6', address: 'Rozel House Crossways Road, Grayshott, Hampshire, GU26 6HE', routerNumber: 'CXNK00EB58D0' },
  { id: '7', address: 'Seton Lodge Tarn Road, Grayshott, Hampshire, GU26 6TP', routerNumber: 'CXNK00EB56B5' },
  { id: '8', address: 'Daleside, Woodcock Bottom, Grayshott, Hampshire, GU26 6NA', routerNumber: 'CXNK00EB4CB8' },
  { id: '9', address: 'Casals Glen Road, Grayshott, Hampshire, GU26 6NB', routerNumber: 'CXNK00EB58D5' },
  { id: '10', address: 'The Haven Boundary Road, Grayshott, Hampshire, GU26 6TX', routerNumber: 'CXNK00EB593B' },
  { id: '11', address: 'Annexe Crossways West Portsmouth road, Hindhead, Surrey, GU26 6BY', routerNumber: 'CXNK00EB5919' },
  { id: '12', address: '49 Kingswood Firs, Grayshott, Hampshire, GU26 6ES', routerNumber: 'CXNK00EB4C13' },
  { id: '13', address: '52 Kingswood Firs, Grayshott, Hampshire, GU26 6ER', routerNumber: 'CXNK00EB594C' },
];

const FLOOR_PLAN_IMAGES: Record<string, any> = {
  '14 Hunters Place, Hindhead, Surrey, GU26 6UY': require('../assets/floor_plans/14-hunters-place.png'),
  '15 Glenville Gardens, Grayshott, Hampshire, GU26 6SX': require('../assets/floor_plans/15-glenville-gardens.png'),
  'Daleside, Woodcock Bottom, Grayshott, Hampshire, GU26 6NA': require('../assets/floor_plans/daleside-woodcock-bottom.png'),
};

const { width, height } = Dimensions.get('window');

export const AddressSelectionScreen: React.FC = () => {
  const navigation = useNavigation<AddressSelectionScreenNavigationProp>();
  const { setRouterNumber, setUserPostcode } = useAppStore();
  
  const [showFloorPlanModal, setShowFloorPlanModal] = useState(false);
  const [selectedFloorPlanImage, setSelectedFloorPlanImage] = useState<any>(null);
  const [pendingAddressItem, setPendingAddressItem] = useState<AddressItem | null>(null);

  const processAddressSelection = async (item: AddressItem) => {
    await setRouterNumber(item.routerNumber);
    
    // Extract postcode from address (last part)
    const parts = item.address.split(',');
    const rawPostcode = parts[parts.length - 1].trim();
    
    // Search for postcode data to populate the store correctly
    try {
      const data = await postcodeService.searchPostcode(rawPostcode);
      if (data) {
        await setUserPostcode(rawPostcode, data);
      } else {
        Alert.alert('Error', 'Could not find postcode data for this address.');
      }
    } catch (error) {
       console.error("Error fetching postcode data", error);
       Alert.alert('Error', 'Failed to fetch postcode data. Please try again.');
    }
  };

  const handleAddressSelect = async (item: AddressItem) => {
    if (FLOOR_PLAN_IMAGES[item.address]) {
      setSelectedFloorPlanImage(FLOOR_PLAN_IMAGES[item.address]);
      setPendingAddressItem(item);
      setShowFloorPlanModal(true);
    } else {
      await processAddressSelection(item);
    }
  };

  const handleConfirmFloorPlan = async () => {
    setShowFloorPlanModal(false);
    if (pendingAddressItem) {
      // Create and save the house plan with the image
      const newPlan: any = {
        applicationId: `PLAN-${pendingAddressItem.id}`,
        addressLabel: pendingAddressItem.address,
        floors: 1,
        rooms: [], // Initialize with empty rooms or default ones
        createdAt: new Date().toISOString(),
        floorplanUrl: selectedFloorPlanImage, // Save the image source
      };
      
      // Use the store to add and select the plan
      const { addHousePlan, selectHousePlan } = useAppStore.getState();
      await addHousePlan(newPlan);
      selectHousePlan(newPlan);

      await processAddressSelection(pendingAddressItem);
    }
  };

  const handleRejectFloorPlan = async () => {
    setShowFloorPlanModal(false);
    if (pendingAddressItem) {
      // User said no, but they still selected the address. 
      // We proceed with the address selection but without linking the floor plan (conceptually)
      // Since the requirement is just "asking the user is this their floor plan?", 
      // if they say no, we probably just proceed as if they selected the address normally.
      await processAddressSelection(pendingAddressItem);
    }
  };

  const renderItem = ({ item }: { item: AddressItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleAddressSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="home" size={24} color={colors.accentBlue} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.addressText}>{item.address}</Text>
        <Text style={styles.routerText}>Router: {item.routerNumber}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <Text style={styles.title}>Select Your Address</Text>
        <Text style={styles.subtitle}>Choose your property to connect to your router</Text>
      </View>
      <FlatList
        data={ADDRESSES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={showFloorPlanModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFloorPlanModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Is this your floor plan?</Text>
            
            <View style={styles.imageContainer}>
              {selectedFloorPlanImage && (
                <Image 
                  source={selectedFloorPlanImage} 
                  style={styles.floorPlanImage} 
                  resizeMode="contain" 
                />
              )}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={handleRejectFloorPlan}
              >
                <Text style={styles.cancelButtonText}>No</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={handleConfirmFloorPlan}
              >
                <Text style={styles.confirmButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.accentBlue}15`, // 15% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  routerText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'monospace', // To make the router number look distinct
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floorPlanImage: {
    width: '100%',
    height: '100%',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  confirmButton: {
    backgroundColor: colors.accentBlue,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
