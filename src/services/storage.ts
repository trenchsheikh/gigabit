import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CustomAgent, ChatMessage, HousePlan, WifiHeatmapData, UserSettings } from '../types';

const STORAGE_KEYS = {
  AGENTS: 'agents',
  CHAT_MESSAGES: 'chat_messages',
  HOUSE_PLANS: 'house_plans',
  WIFI_HEATMAP: 'wifi_heatmap',
  USER_SETTINGS: 'user_settings',
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
};


