import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  SpeedTest: undefined;
  AIAgentChat: { agentId: string };
  AgentDetail: { agentId: string };
  HousePlans: undefined;
  HousePlanDetail: { planId: string };
  ARHeatmap: undefined;
  HeatmapSummary: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Agents: undefined;
  Plans: undefined;
  Scan: undefined;
};


