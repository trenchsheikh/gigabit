import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CustomAgent, ChatMessage, HousePlan, WifiHeatmapData, UserSettings, HomeDevice } from '../types';
import type { PostcodeData } from './postcode';

const STORAGE_KEYS = {
  AGENTS: 'agents',
  CHAT_MESSAGES: 'chat_messages',
  HOUSE_PLANS: 'house_plans',
  WIFI_HEATMAP: 'wifi_heatmap',
  USER_SETTINGS: 'user_settings',
  AUTH_DATA: 'auth_data',
  POSTCODE_DATA: 'postcode_data',
  DEVICES: 'devices',
} as const;

export const storageService = {
  // Agents
  async getAgents(): Promise<CustomAgent[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.AGENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading agents:', error);
      return [];
    }
  },

  async saveAgent(agent: CustomAgent): Promise<void> {
    const agents = await this.getAgents();
    const existingIndex = agents.findIndex((a) => a.id === agent.id);
    if (existingIndex >= 0) {
      agents[existingIndex] = agent;
    } else {
      agents.push(agent);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(agents));
  },

  async deleteAgent(agentId: string): Promise<void> {
    const agents = await this.getAgents();
    const filtered = agents.filter((a) => a.id !== agentId);
    await AsyncStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(filtered));
  },

  // Chat Messages
  async getChatMessages(agentId: string): Promise<ChatMessage[]> {
    try {
      const data = await AsyncStorage.getItem(`${STORAGE_KEYS.CHAT_MESSAGES}_${agentId}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading chat messages:', error);
      return [];
    }
  },

  async saveChatMessage(message: ChatMessage): Promise<void> {
    const messages = await this.getChatMessages(message.agentId);
    messages.push(message);
    await AsyncStorage.setItem(
      `${STORAGE_KEYS.CHAT_MESSAGES}_${message.agentId}`,
      JSON.stringify(messages)
    );
  },

  async clearChatMessages(agentId: string): Promise<void> {
    await AsyncStorage.removeItem(`${STORAGE_KEYS.CHAT_MESSAGES}_${agentId}`);
  },

  // House Plans
  async getHousePlans(): Promise<HousePlan[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.HOUSE_PLANS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading house plans:', error);
      return [];
    }
  },

  async saveHousePlan(plan: HousePlan): Promise<void> {
    const plans = await this.getHousePlans();
    const existingIndex = plans.findIndex((p) => p.applicationId === plan.applicationId);
    if (existingIndex >= 0) {
      plans[existingIndex] = plan;
    } else {
      plans.push(plan);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.HOUSE_PLANS, JSON.stringify(plans));
  },

  async deleteHousePlan(applicationId: string): Promise<void> {
    const plans = await this.getHousePlans();
    const filtered = plans.filter((p) => p.applicationId !== applicationId);
    await AsyncStorage.setItem(STORAGE_KEYS.HOUSE_PLANS, JSON.stringify(filtered));
  },

  // WiFi Heatmap
  async getWifiHeatmap(): Promise<WifiHeatmapData | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WIFI_HEATMAP);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading WiFi heatmap:', error);
      return null;
    }
  },

  async saveWifiHeatmap(data: WifiHeatmapData): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.WIFI_HEATMAP, JSON.stringify(data));
  },

  // User Settings
  async getUserSettings(): Promise<UserSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
      return data ? JSON.parse(data) : { hasCompletedOnboarding: false };
    } catch (error) {
      console.error('Error loading user settings:', error);
      return { hasCompletedOnboarding: false };
    }
  },

  async saveUserSettings(settings: UserSettings): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
  },

  // Auth Data
  async getAuthData(): Promise<{ username: string; isAuthenticated: boolean } | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading auth data:', error);
      return null;
    }
  },

  async saveAuthData(authData: { username: string; isAuthenticated: boolean }): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_DATA, JSON.stringify(authData));
  },

  async clearAuthData(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_DATA);
  },

  // Postcode Data
  async getPostcodeData(): Promise<{ postcode: string; data: PostcodeData } | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.POSTCODE_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading postcode data:', error);
      return null;
    }
  },

  async savePostcodeData(postcode: string, data: PostcodeData): Promise<void> {
    await AsyncStorage.setItem(
      STORAGE_KEYS.POSTCODE_DATA,
      JSON.stringify({ postcode, data })
    );
  },

  // Devices
  async getDevices(): Promise<HomeDevice[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.DEVICES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading devices:', error);
      return [];
    }
  },

  async saveDevice(device: HomeDevice): Promise<void> {
    const devices = await this.getDevices();
    const existingIndex = devices.findIndex((d) => d.id === device.id);
    if (existingIndex >= 0) {
      devices[existingIndex] = device;
    } else {
      devices.push(device);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices));
  },

  async deleteDevice(deviceId: string): Promise<void> {
    const devices = await this.getDevices();
    const filtered = devices.filter((d) => d.id !== deviceId);
    await AsyncStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(filtered));
  },
};


