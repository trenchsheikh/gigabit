import type { HousePlan } from '../types';

// Mock house plan data for East Hampshire planning application 181392
export const mockHousePlan181392: HousePlan = {
  applicationId: '181392',
  addressLabel: 'Sample Address, East Hampshire',
  floors: 2,
  rooms: [
    // Ground Floor
    { id: 'room-1', name: 'Living Room', floor: 0, estimatedAreaM2: 25 },
    { id: 'room-2', name: 'Kitchen', floor: 0, estimatedAreaM2: 15 },
    { id: 'room-3', name: 'Dining Room', floor: 0, estimatedAreaM2: 18 },
    { id: 'room-4', name: 'Hallway', floor: 0, estimatedAreaM2: 8 },
    { id: 'room-5', name: 'Bathroom', floor: 0, estimatedAreaM2: 6 },
    // First Floor
    { id: 'room-6', name: 'Master Bedroom', floor: 1, estimatedAreaM2: 20 },
    { id: 'room-7', name: 'Bedroom 2', floor: 1, estimatedAreaM2: 15 },
    { id: 'room-8', name: 'Bedroom 3', floor: 1, estimatedAreaM2: 12 },
    { id: 'room-9', name: 'Bathroom', floor: 1, estimatedAreaM2: 6 },
    { id: 'room-10', name: 'Landing', floor: 1, estimatedAreaM2: 5 },
  ],
  createdAt: new Date().toISOString(),
};






