import { create } from 'zustand';
import type { CustomAgent, ChatMessage, HousePlan, WifiHeatmapData, UserSettings, NetworkSummary } from '../types';
import { storageService } from '../services/storage';

interface AppState {
  // State
  agents: CustomAgent[];
  selectedAgent: CustomAgent | null;
  chatMessages: Record<string, ChatMessage[]>; // agentId -> messages
  housePlans: HousePlan[];
  selectedHousePlan: HousePlan | null;
  wifiHeatmap: WifiHeatmapData | null;
  userSettings: UserSettings;
  networkSummary: NetworkSummary;

  // Actions
  loadInitialData: () => Promise<void>;
  addAgent: (agent: CustomAgent) => Promise<void>;
  updateAgent: (agent: CustomAgent) => Promise<void>;
  deleteAgent: (agentId: string) => Promise<void>;
  selectAgent: (agent: CustomAgent | null) => Promise<void>;
  addChatMessage: (message: ChatMessage) => Promise<void>;
  loadChatMessages: (agentId: string) => Promise<void>;
  addHousePlan: (plan: HousePlan) => Promise<void>;
  selectHousePlan: (plan: HousePlan | null) => void;
  updateWifiHeatmap: (data: WifiHeatmapData) => Promise<void>;
  updateUserSettings: (settings: Partial<UserSettings>) => Promise<void>;
  updateNetworkSummary: (summary: Partial<NetworkSummary>) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  agents: [],
  selectedAgent: null,
  chatMessages: {},
  housePlans: [],
  selectedHousePlan: null,
  wifiHeatmap: null,
  userSettings: { hasCompletedOnboarding: false },
  networkSummary: {},

  loadInitialData: async () => {
    const [agents, plans, heatmap, settings] = await Promise.all([
      storageService.getAgents(),
      storageService.getHousePlans(),
      storageService.getWifiHeatmap(),
      storageService.getUserSettings(),
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
      agents: finalAgents,
      housePlans: plans,
      wifiHeatmap: heatmap,
      userSettings: settings,
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
}));


