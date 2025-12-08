import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  SignIn: undefined;
  AddressSelection: undefined;
  AddressEntry: undefined;
  Onboarding: undefined;
  Postcode: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  SpeedTest: undefined;
  AIAgentChat: { agentId: string };
  AgentDetail: { agentId: string };
  Scan: undefined;
  Account: undefined;
  HousePlans: undefined;
  HousePlanDetail: { planId: string };
  ARHeatmap: undefined;
  HeatmapSummary: undefined;
  AccountSettings: undefined;
  FloorPlanSearch: undefined;
  FloorPlanConfirm: { plan: any };
  FloorPlanManualInput: { initialPlan?: any; address?: string };
  FloorPlanCreator: { initialPlan?: any };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Agents: undefined;
  Plans: undefined;
  Scan: undefined;
  Account: undefined;
};


