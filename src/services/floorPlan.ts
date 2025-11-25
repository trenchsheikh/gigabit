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

export const floorPlanService = {
  /**
   * Simulates searching for a floor plan by postcode.
   * In a real app, this would call a backend API or scraper.
   */
  searchFloorPlan: async (postcode: string): Promise<HousePlan | null> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // For demo purposes, let's say SW1A 1AA always finds a plan
    // and others might not (randomly, or just return null for now to test manual flow)
    if (postcode.toUpperCase().includes('SW1A')) {
      return {
        ...MOCK_PLAN,
        addressLabel: `${postcode.toUpperCase()} Address`,
      };
    }

    // 50/50 chance of finding a plan for other postcodes for testing
    // Or just return null to force manual flow testing
    return Math.random() > 0.5 ? MOCK_PLAN : null;
  },
};
