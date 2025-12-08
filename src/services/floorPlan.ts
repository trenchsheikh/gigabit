import { HousePlan } from '../types';

// Mock data for demonstration
const RESTRICTED_ADDRESSES = [
  { address: '14 Hunters Place, Hindhead, Surrey, GU26 6UY', serial: 'CXNK00EB4D45' },
  { address: '15 Glenville Gardens, Grayshott, Hampshire, GU26 6SX', serial: 'CXNK00EB4C99' },
  { address: 'Holmwood Glen Road, Grayshott, Hampshire, GU26 6NF', serial: 'CXNK00EB56EB' },
  { address: 'Spurfold House Church Lane, Grayshott, Hampshire, GU26 6LY', serial: 'CXNK00EB5893' },
  { address: 'Heatherlands Headley Road, Grayshott, Hampshire, GU26 6TN', serial: 'CXNK00EB58CE' },
  { address: 'Rozel House Crossways Road, Grayshott, Hampshire, GU26 6HE', serial: 'CXNK00EB58D0' },
  { address: 'Seton Lodge Tarn Road, Grayshott, Hampshire, GU26 6TP', serial: 'CXNK00EB56B5' },
  { address: 'Daleside, Woodcock Bottom, Grayshott, Hampshire, GU26 6NA', serial: 'CXNK00EB4CB8' },
  { address: 'Casals Glen Road, Grayshott, Hampshire, GU26 6NB', serial: 'CXNK00EB58D5' },
  { address: 'The Haven Boundary Road, Grayshott, Hampshire, GU26 6TX', serial: 'CXNK00EB593B' },
  { address: 'Annexe Crossways West Portsmouth road, Hindhead, Surrey, GU26 6BY', serial: 'CXNK00EB5919' },
  { address: '49 Kingswood Firs, Grayshott, Hampshire, GU26 6ES', serial: 'CXNK00EB4C13' },
  { address: '52 Kingswood Firs, Grayshott, Hampshire, GU26 6ER', serial: 'CXNK00EB594C' },
];

const MOCK_PLAN: HousePlan = {
  applicationId: 'PLAN-2024-001',
  addressLabel: '123 High Street, London',
  floors: 2,
  rooms: [
    { id: 'r1', name: 'Living Room', floor: 0, estimatedAreaM2: 25 },
    { id: 'r2', name: 'Kitchen', floor: 0, estimatedAreaM2: 15 },
    { id: 'r3', name: 'Master Bedroom', floor: 1, estimatedAreaM2: 20 },
    { id: 'r4', name: 'Bedroom 2', floor: 1, estimatedAreaM2: 12 },
    { id: 'r5', name: 'Bathroom', floor: 1, estimatedAreaM2: 8 },
  ],
  createdAt: new Date().toISOString(),
};

import { Platform } from 'react-native';

const API_URL = Platform.select({
  android: 'http://10.0.2.2:4000',
  ios: 'http://192.168.1.175:4000', // Updated host IP
  default: 'http://192.168.1.175:4000',
});

export const floorPlanService = {
  /**
   * Simulates searching for a floor plan by postcode.
   * In a real app, this would call a backend API or scraper.
   */
  searchFloorPlan: async (address: string): Promise<HousePlan | null> => {
    try {
      // Find the address in our restricted list
      const matchedAddress = RESTRICTED_ADDRESSES.find(
        (item) => item.address.toLowerCase() === address.toLowerCase()
      );

      if (matchedAddress) {
        return {
          applicationId: `PLAN-${Date.now()}`,
          addressLabel: matchedAddress.address,
          createdAt: new Date().toISOString(),
          floorplanUrl: undefined, // No specific floorplan URL for now, or we could add one if provided
          rooms: [], 
          floors: 1,
          calixRouterSerialNumber: matchedAddress.serial,
        };
      }

      // Fallback to API if not in list (or we could return null if strict)
      // For now, let's keep the API call but only if it's not in the list?
      // The user said "limit it to all these addresses", so maybe we should ONLY return if in list.
      // But let's keep the API call as a fallback for now just in case, or maybe return null.
      // Given "limit it to all these addresses", I will return null if not found in list.
      
      return null;

    } catch (error) {
      console.error('Error fetching floorplan:', error);
      return null;
    }
  },

  async searchAddress(query: string): Promise<string[]> {
    try {
      if (!query) return [];
      
      const lowerQuery = query.toLowerCase();
      const matches = RESTRICTED_ADDRESSES
        .filter(item => item.address.toLowerCase().includes(lowerQuery))
        .map(item => item.address);
        
      return matches;
    } catch (error) {
      console.error('Error searching address:', error);
      return [];
    }
  },
};
