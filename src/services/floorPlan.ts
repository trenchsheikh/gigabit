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

import { getFloorplanForAddress } from './api/floorplan';

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

      // Fallback to Scraper (Ported from Server)
      // Parse address: "14 Hunters Place, Hindhead, Surrey, GU26 6UY"
      const parts = address.split(',').map(p => p.trim());
      if (parts.length >= 2) {
          const postcode = parts[parts.length - 1];
          const firstPart = parts[0]; // "14 Hunters Place"
          
          // Try to split number and street
          const numberMatch = firstPart.match(/^(\d+)\s+(.*)$/);
          let houseNumber = '';
          let street = firstPart;
          
          if (numberMatch) {
              houseNumber = numberMatch[1];
              street = numberMatch[2];
          }

          console.log(`Scraping floorplan for: ${houseNumber} ${street}, ${postcode}`);
          const result = await getFloorplanForAddress(postcode, houseNumber, street);
          
          if (result && result.floorplanUrl) {
              return {
                  applicationId: `PLAN-${Date.now()}`,
                  addressLabel: result.listingAddress || address,
                  createdAt: new Date().toISOString(),
                  floorplanUrl: result.floorplanUrl,
                  rooms: [],
                  floors: 1,
              };
          }
      }
      
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
