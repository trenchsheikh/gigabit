// AI Agent Types
export type AgentRole = 'expert' | 'assistant' | 'optimizer' | 'troubleshooter';

export interface CustomAgent {
  id: string;
  name: string;
  description: string;
  role: AgentRole;
  systemInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  agentId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  audioUrl?: string;
}

// House Plan Types
export interface Door {
  id: string;
  x: number;
  y: number;
  rotation: number; // 0, 90, 180, 270
  width: number;
  type: 'standard' | 'sliding' | 'double';
  floor: number;
}

export interface RoomZone {
  id: string;
  name: string;
  floor: number;
  estimatedAreaM2?: number;
  // Visual Layout
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  wallMaterial?: 'brick' | 'concrete' | 'drywall' | 'glass';
}

export interface ConstructionDetails {
  externalWallMaterial: 'brick' | 'stone' | 'concrete' | 'timber_frame' | 'other';
  internalWallMaterial: 'drywall' | 'solid_brick' | 'concrete' | 'other';
  floorMaterial: 'wood' | 'concrete' | 'tile' | 'carpet' | 'other';
}

export interface HousePlan {
  applicationId: string;
  addressLabel: string;
  floors: number;
  rooms: RoomZone[];
  doors?: Door[];
  constructionDetails?: ConstructionDetails;
  floorplanUrl?: any;
  calixRouterSerialNumber?: string;
  createdAt: string;
}

// WiFi Heatmap Types
export interface WifiSample {
  id: string;
  roomId?: string;
  strengthDbm: number; // -100 to 0 dBm, or 0-100 normalized
  createdAt: string;
}

export interface WifiHeatmapPoint extends WifiSample {
  x: number; // Screen coordinate or AR anchor
  y: number;
}

export interface WifiHeatmapData {
  points: WifiHeatmapPoint[];
  roomAverages: Record<string, number>; // roomId -> average strength
}

export interface UserAddress {
  houseNumber: string;
  street: string;
  postcode: string;
  fullAddress: string;
}

// User & Settings
export interface UserSettings {
  hasCompletedOnboarding: boolean;
  selectedHousePlanId?: string;
  preferredVoiceId?: string;
  notificationsEnabled?: boolean;
  analyticsEnabled?: boolean;
  accountDisabled?: boolean;
}

// Network Summary
export interface NetworkSummary {
  currentSpeed?: {
    download: number; // Mbps
    upload: number; // Mbps
    ping: number; // ms
  };
  lastSpeedTest?: string;
  deviceCount?: number;
}

// Device Types
export type DeviceType =
  | 'router'
  | 'extender'
  | 'smartphone'
  | 'laptop'
  | 'tablet'
  | 'smart-tv'
  | 'smart-speaker'
  | 'gaming-console'
  | 'iot-device'
  | 'other';

export interface HomeDevice {
  id: string;
  name: string;
  type: DeviceType;
  roomId?: string;
  roomName?: string;
  macAddress?: string;
  ipAddress?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Visual Position
  x?: number;
  y?: number;
}


