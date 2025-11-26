import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  SignIn: undefined;
  AddressEntry: undefined;
  Onboarding: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  SpeedTest: undefined;
  AIAgentChat: { agentId: string };
  AgentDetail: { agentId: string };
  HousePlans: undefined;
  HousePlanDetail: { planId: string };
  ARHeatmap: undefined;
  HeatmapSummary: undefined;
  AccountSettings: undefined;
  FloorPlanSearch: undefined;
  FloorPlanConfirm: { plan: any }; // Using any for now to avoid circular dependency, or import HousePlan
  FloorPlanManualInput: { initialPlan?: any; address?: string }; // Using any for now to avoid circular dependency
};

export type MainTabParamList = {
  Dashboard: undefined;
  Agents: undefined;
  Plans: undefined;
  Scan: undefined;
  Account: undefined;
};


