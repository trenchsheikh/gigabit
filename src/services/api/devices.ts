import { callCalixServiceInsights } from './calix';

// Type definition for the normalized device summary
export type DeviceSummary = {
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
  model?: string;
  manufacturer?: string;
};

export async function fetchDevices(routerNumber?: string): Promise<DeviceSummary[]> {
    if (!routerNumber) {
      console.error('No router serial number provided');
      throw new Error('Router serial number is required');
    }

    const serialNumber = routerNumber.trim();
    if (__DEV__) {
        console.log(`[Devices API] Fetching devices for Router Serial: '${serialNumber}'`);
    }

    try {
        const listResponse = await callCalixServiceInsights<any>('/system/device-list', {
            params: { serialNumber },
        });
        
        const rawDevices = Array.isArray(listResponse) ? listResponse : (listResponse.devices || listResponse.deviceList || []);

        // 2. Fetch details for each device sequentially with retry logic
        const detailedDevices = [];
        
        // Helper to sleep
        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        for (const d of rawDevices) {
            const mac = d.macAddress || d.deviceId || d.id;
            if (!mac) continue;

            let retries = 3;
            let delay = 500; // Start with 500ms delay to speed up
            let success = false;

            while (retries > 0 && !success) {
                try {
                    // Always wait a bit before request to be nice to the API
                    await sleep(delay);
                    
                    const detailResponse = await callCalixServiceInsights<any>('/device/detail', {
                        params: { 
                            serialNumber,
                            deviceMac: mac
                        }
                    });
                    detailedDevices.push({ ...d, ...detailResponse });
                    success = true;
                } catch (error: any) {
                    if (error?.response?.status === 429 || error?.message?.includes('429')) {
                        console.warn(`Rate limit hit for device ${mac}. Retrying in ${delay * 2}ms...`);
                        await sleep(delay * 2); // Wait longer before retry
                        delay *= 2; // Exponential backoff
                        retries--;
                    } else if (error?.response?.status === 404 || error?.message?.includes('404') || error?.message?.includes('not exist')) {
                        console.warn(`Device ${mac} not found (404) during detail fetch. Using basic info.`);
                        detailedDevices.push(d); // Fallback to basic info
                        success = true; // Treat as handled
                    } else {
                        console.warn(`Failed to fetch details for device ${mac}:`, error.message);
                        detailedDevices.push(d); // Fallback to basic info immediately on non-429 error
                        success = true; // Treat as "handled"
                    }
                }
            }
            
            if (!success) {
                console.warn(`Max retries reached for device ${mac}, using basic info.`);
                detailedDevices.push(d);
            }
        }

        // Deduplicate based on MAC address/ID
        const uniqueDevices = new Map();
        
        detailedDevices.forEach((d: any) => {
            const id = d.macAddress || d.deviceId || d.id;
            if (!id) return; // Skip if no ID

            const existing = uniqueDevices.get(id);
            const isOnline = d.status === 'online' || d.online === true;
            
            if (!existing || (!existing.online && isOnline)) {
                uniqueDevices.set(id, { ...d, _isOnline: isOnline });
            }
        });

        const devices: DeviceSummary[] = Array.from(uniqueDevices.values()).map(
        (d: any): DeviceSummary => {
            // Use details from /device/detail if available
            // Map kebab-case properties from YAML
            const rssi = typeof d.rssi === 'number' ? d.rssi : 
                        (typeof d['signal-strength'] === 'number' ? d['signal-strength'] : 
                        (typeof d.wifiSignalStrength === 'number' ? d.wifiSignalStrength : undefined));
                        
            const wifiScore = d.wifiScore ?? d['wifi-score'] ?? d['client-efficiency-score'] ?? null;
            
            const dsPhyRate = d.dsPhyRate ?? d['DS-phy-rate'] ?? d.downstreamRate ?? null;
            const usPhyRate = d.usPhyRate ?? d['US-phy-rate'] ?? d.upstreamRate ?? null;
            
            // Extract Model and Manufacturer
            // Note: 'fingerpint-vendor' has a typo in the YAML/API
            const model = d['fingerprint-model'] || d.modelName || d.model || undefined;
            const manufacturer = d['fingerpint-vendor'] || d['fingerprint-vendor'] || d.manufacturer || undefined;

            // Calculate Signal Quality
            let signalQuality: DeviceSummary['signalQuality'] = { label: 'Unknown', level: 'unknown' };
            
            // Use signal-bars if available (direct from API)
            if (typeof d['signal-bars'] === 'number') {
                const bars = d['signal-bars'];
                if (bars >= 4) signalQuality = { label: 'Excellent', level: 'excellent' };
                else if (bars === 3) signalQuality = { label: 'Good', level: 'good' };
                else if (bars === 2) signalQuality = { label: 'Fair', level: 'fair' };
                else signalQuality = { label: 'Poor', level: 'poor' };
            } 
            else if (wifiScore !== null) {
                if (wifiScore >= 4) signalQuality = { label: 'Excellent', level: 'excellent' };
                else if (wifiScore === 3) signalQuality = { label: 'Good', level: 'good' };
                else if (wifiScore === 2) signalQuality = { label: 'Fair', level: 'fair' };
                else if (wifiScore <= 1) signalQuality = { label: 'Poor', level: 'poor' };
            } else if (rssi !== undefined) {
                if (rssi >= -50) signalQuality = { label: 'Excellent', level: 'excellent' };
                else if (rssi >= -60) signalQuality = { label: 'Good', level: 'good' };
                else if (rssi >= -70) signalQuality = { label: 'Fair', level: 'fair' };
                else signalQuality = { label: 'Poor', level: 'poor' };
            }

            // Improve Name Mapping
            let name = d.hostName || d.deviceName || d.macAddress || 'Unknown device';
            if (name === d.macAddress) {
                name = `Device ${d.macAddress.slice(-5)}`; 
            }

            return {
                id: d.macAddress || d.deviceId || d.id,
                name: name,
                connectionType: d.connection || d.interfaceType || 'Wi-Fi',
                rssi,
                wifiScore,
                dsPhyRateMbps: dsPhyRate,
                usPhyRateMbps: usPhyRate,
                online: d._isOnline !== undefined ? d._isOnline : true,
                signalQuality,
                model,
                manufacturer
            };
        }
        );

        return devices;
    } catch (err: any) {
        console.error('Error fetching devices from Calix:', JSON.stringify(err?.response?.data || err?.message || err, null, 2));
        throw err;
    }
}
