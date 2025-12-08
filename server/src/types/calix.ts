export interface CalixDevice {
  hostName?: string;
  macAddress: string;
  ipAddress?: string;
  connection?: string; // e.g. "2.4GHz", "5GHz", "Ethernet"
  wifiSignalStrength?: number; // RSSI
  wifiScore?: number;
  dsPhyRate?: number;
  usPhyRate?: number;
  status?: string; // "online"
  connectionType?: string; // "wifi"
  band?: number; // 2.4, 5, 6
  model?: string;
  manufacturer?: string;
}

export interface DeviceSummary {
  id: string;
  name: string;
  connectionType: string;
  rssi?: number;
  wifiScore?: number | null;
  dsPhyRateMbps?: number | null;
  usPhyRateMbps?: number | null;
  online: boolean;
  signalQuality?: {
    label: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Unknown';
    level: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
  };
}
