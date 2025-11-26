import { create } from 'zustand';
import type { CustomAgent, ChatMessage, HousePlan, WifiHeatmapData, UserSettings, NetworkSummary, HomeDevice, UserAddress } from '../types';
import type { PostcodeData } from '../services/postcode';
import { storageService } from '../services/storage';

interface AppState {
  // State
  isAuthenticated: boolean;
  username: string | null;
  userPostcode: string | null;
  userAddress: UserAddress | null;
  postcodeData: PostcodeData | null;
  agents: CustomAgent[];
  selectedAgent: CustomAgent | null;
  chatMessages: Record<string, ChatMessage[]>; // agentId -> messages
  housePlans: HousePlan[];
  selectedHousePlan: HousePlan | null;
  wifiHeatmap: WifiHeatmapData | null;
  userSettings: UserSettings;
  networkSummary: NetworkSummary;
  devices: HomeDevice[];

  // Actions
  signIn: (username: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUserPostcode: (postcode: string, data: PostcodeData) => Promise<void>;
  setUserAddress: (address: UserAddress) => Promise<void>;
  loadInitialData: () => Promise<void>;
  addAgent: (agent: CustomAgent) => Promise<void>;
  updateAgent: (agent: CustomAgent) => Promise<void>;
  deleteAgent: (agentId: string) => Promise<void>;
  selectAgent: (agent: CustomAgent | null) => Promise<void>;
  addChatMessage: (message: ChatMessage) => Promise<void>;
  loadChatMessages: (agentId: string) => Promise<void>;
  addHousePlan: (plan: HousePlan) => Promise<void>;
  updateHousePlan: (plan: HousePlan) => Promise<void>;
  deleteHousePlan: (applicationId: string) => Promise<void>;
  selectHousePlan: (plan: HousePlan | null) => void;
  updateWifiHeatmap: (data: WifiHeatmapData) => Promise<void>;
  updateUserSettings: (settings: Partial<UserSettings>) => Promise<void>;
  updateNetworkSummary: (summary: Partial<NetworkSummary>) => void;
  addDevice: (device: HomeDevice) => Promise<void>;
  updateDevice: (device: HomeDevice) => Promise<void>;
  deleteDevice: (deviceId: string) => Promise<void>;
  loadDevices: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  isAuthenticated: false,
  username: null,
  userPostcode: null,
  userAddress: null,
  postcodeData: null,
  agents: [],
  selectedAgent: null,
  chatMessages: {},
  housePlans: [],
  selectedHousePlan: null,
  wifiHeatmap: null,
  userSettings: { hasCompletedOnboarding: false },
  networkSummary: {},
  devices: [],

  signIn: async (username: string) => {
    await storageService.saveAuthData({ username, isAuthenticated: true });
    set({ isAuthenticated: true, username });
  },

  signOut: async () => {
    await storageService.clearAuthData();
    set({
      isAuthenticated: false,
      username: null,
      userPostcode: null,
      postcodeData: null,
    });
  },

  setUserPostcode: async (postcode: string, data: PostcodeData) => {
    await storageService.savePostcodeData(postcode, data);
    set({ userPostcode: postcode, postcodeData: data });
  },

  setUserAddress: async (address: UserAddress) => {
    // Save to storage (mock implementation for now, or add to storageService)
    set({ userAddress: address });
  },

  loadInitialData: async () => {
    const [authData, postcodeData] = await Promise.all([
      storageService.getAuthData(),
      storageService.getPostcodeData(),
    ]);

    const [agents, plans, heatmap, settings, devices] = await Promise.all([
      storageService.getAgents(),
      storageService.getHousePlans(),
      storageService.getWifiHeatmap(),
      storageService.getUserSettings(),
      storageService.getDevices(),
    ]);

    // If no agents exist, initialize with default agents
    let finalAgents = agents;
    if (agents.length === 0) {
      const { defaultAgents } = await import('../data/defaultAgents');
      for (const agent of defaultAgents) {
        await storageService.saveAgent(agent);
      }
      finalAgents = defaultAgents;
    }

    set({
      isAuthenticated: authData?.isAuthenticated ?? false,
      username: authData?.username ?? null,
      userPostcode: postcodeData?.postcode ?? null,
      postcodeData: postcodeData?.data ?? null,
      agents: finalAgents,
      housePlans: plans,
      wifiHeatmap: heatmap,
      userSettings: settings,
      devices: devices,
    });

    // Load selected house plan if exists
    if (settings.selectedHousePlanId) {
      const plan = plans.find((p) => p.applicationId === settings.selectedHousePlanId);
      if (plan) {
        set({ selectedHousePlan: plan });
      }
    }
  },

  addAgent: async (agent) => {
    await storageService.saveAgent(agent);
    set((state) => ({
      agents: [...state.agents, agent],
    }));
  },

  updateAgent: async (agent) => {
    await storageService.saveAgent(agent);
    set((state) => ({
      agents: state.agents.map((a) => (a.id === agent.id ? agent : a)),
    }));
  },

  deleteAgent: async (agentId) => {
    await storageService.deleteAgent(agentId);
    set((state) => ({
      agents: state.agents.filter((a) => a.id !== agentId),
      selectedAgent: state.selectedAgent?.id === agentId ? null : state.selectedAgent,
    }));
  },

  selectAgent: async (agent) => {
    set({ selectedAgent: agent });
    if (agent) {
      await get().loadChatMessages(agent.id);
    }
  },

  addChatMessage: async (message) => {
    await storageService.saveChatMessage(message);
    set((state) => ({
      chatMessages: {
        ...state.chatMessages,
        [message.agentId]: [...(state.chatMessages[message.agentId] || []), message],
      },
    }));
  },

  loadChatMessages: async (agentId) => {
    const messages = await storageService.getChatMessages(agentId);
    set((state) => ({
      chatMessages: {
        ...state.chatMessages,
        [agentId]: messages,
      },
    }));
  },

  addHousePlan: async (plan) => {
    await storageService.saveHousePlan(plan);
    set((state) => ({
      housePlans: [...state.housePlans, plan],
    }));
  },

  updateHousePlan: async (plan) => {
    await storageService.saveHousePlan(plan);
    set((state) => ({
      housePlans: state.housePlans.map((p) =>
        p.applicationId === plan.applicationId ? plan : p
      ),
      selectedHousePlan: state.selectedHousePlan?.applicationId === plan.applicationId
        ? plan
        : state.selectedHousePlan,
    }));
  },

  deleteHousePlan: async (applicationId) => {
    await storageService.deleteHousePlan(applicationId);
    set((state) => ({
      housePlans: state.housePlans.filter((p) => p.applicationId !== applicationId),
      selectedHousePlan: state.selectedHousePlan?.applicationId === applicationId
        ? null
        : state.selectedHousePlan,
    }));
  },

  selectHousePlan: (plan) => {
    set({ selectedHousePlan: plan });
    if (plan) {
      get().updateUserSettings({ selectedHousePlanId: plan.applicationId });
    }
  },

  updateWifiHeatmap: async (data) => {
    await storageService.saveWifiHeatmap(data);
    set({ wifiHeatmap: data });
  },

  updateUserSettings: async (settings) => {
    const newSettings = { ...get().userSettings, ...settings };
    await storageService.saveUserSettings(newSettings);
    set({ userSettings: newSettings });
  },

  updateNetworkSummary: (summary) => {
    set((state) => ({
      networkSummary: { ...state.networkSummary, ...summary },
    }));
  },

  addDevice: async (device) => {
    await storageService.saveDevice(device);
    set((state) => ({
      devices: [...state.devices, device],
      networkSummary: {
        ...state.networkSummary,
        deviceCount: state.devices.length + 1,
      },
    }));
  },

  updateDevice: async (device) => {
    await storageService.saveDevice(device);
    set((state) => ({
      devices: state.devices.map((d) => (d.id === device.id ? device : d)),
    }));
  },

  deleteDevice: async (deviceId) => {
    await storageService.deleteDevice(deviceId);
    set((state) => ({
      devices: state.devices.filter((d) => d.id !== deviceId),
      networkSummary: {
        ...state.networkSummary,
        deviceCount: Math.max(0, (state.networkSummary.deviceCount || 0) - 1),
      },
    }));
  },

  loadDevices: async () => {
    const devices = await storageService.getDevices();
    set({ devices });
  },
}));


