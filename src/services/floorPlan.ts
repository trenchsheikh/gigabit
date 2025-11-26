import { HousePlan } from '../types';

// Mock data for demonstration
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
  android: 'http://10.0.2.2:3001',
  ios: 'http://172.20.10.10:3001', // Host IP from error log
  default: 'http://172.20.10.10:3001',
});

export const floorPlanService = {
  /**
   * Simulates searching for a floor plan by postcode.
   * In a real app, this would call a backend API or scraper.
   */
  searchFloorPlan: async (postcode: string): Promise<HousePlan | null> => {
    try {
      // For now, we'll assume the user enters "Postcode, HouseNumber Street" or similar
      // In a real app, we'd parse this better or have separate fields
      const parts = postcode.split(',');
      const actualPostcode = parts[parts.length - 1]?.trim() || postcode;
      const addressPart = parts[0]?.trim() || '';

      // Simple parsing to extract house number and street
      // This is brittle and should be improved with a proper address picker
      const numberMatch = addressPart.match(/^(\d+)/);
      const houseNumber = numberMatch ? numberMatch[1] : '1'; // Default to 1 if not found
      const street = addressPart.replace(/^(\d+)/, '').trim() || 'High Street';

      const response = await fetch(`${API_URL}/api/floorplan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postcode: actualPostcode,
          houseNumber,
          street,
        }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json() as any;

      return {
        applicationId: `PLAN-${Date.now()}`,
        addressLabel: data.listingAddress || `${houseNumber} ${street}, ${actualPostcode}`,
        createdAt: new Date().toISOString(),
        floorplanUrl: data.floorplanUrl,
        rooms: [], // We'd need to parse the image or have the user add them
        floors: 1, // Default
      };
    } catch (error) {
      console.error('Error fetching floorplan:', error);
      return null;
    }
  },

  async searchAddress(query: string): Promise<string[]> {
    try {
      const response = await fetch(`${API_URL}/api/address-search?query=${encodeURIComponent(query)}`);
      if (!response.ok) return [];
      const data = await response.json() as string[];
      return data;
    } catch (error) {
      console.error('Error searching address:', error);
      return [];
    }
  },
};
