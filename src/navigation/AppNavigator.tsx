import React, { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import type { RootStackParamList, MainTabParamList } from './types';

// Screens
import { SignInScreen } from '../screens/SignInScreen';
import { PostcodeScreen } from '../screens/PostcodeScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { AgentsScreen } from '../screens/AgentsScreen';
import { PlansScreen } from '../screens/PlansScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { AccountSettingsScreen } from '../screens/AccountSettingsScreen';
import { SpeedTestScreen } from '../screens/SpeedTestScreen';
import { AIAgentChatScreen } from '../screens/AIAgentChatScreen';
import { HousePlansScreen } from '../screens/HousePlansScreen';
import { HousePlanDetailScreen } from '../screens/HousePlanDetailScreen';
import { ARHeatmapScreen } from '../screens/ARHeatmapScreen';
import { HeatmapSummaryScreen } from '../screens/HeatmapSummaryScreen';
import { AgentDetailScreen } from '../screens/AgentDetailScreen';
import { FloorPlanSearchScreen } from '../screens/FloorPlanSearchScreen';
import { FloorPlanConfirmScreen } from '../screens/FloorPlanConfirmScreen';
import { FloorPlanManualInputScreen } from '../screens/FloorPlanManualInputScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accentBlue,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          height: 70 + Math.max(insets.bottom - 8, 0),
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
          marginBottom: 0,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Agents"
        component={AgentsScreen}
        options={{
          tabBarLabel: 'Assistants',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="chat" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Plans"
        component={PlansScreen}
        options={{
          tabBarLabel: 'Plans',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="map" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarLabel: 'Scan',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="scan" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountSettingsScreen}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="account" color={color} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const TabIcon: React.FC<{ name: string; color: string; focused: boolean }> = ({ name, color, focused }) => {
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    home: focused ? 'home' : 'home-outline',
    chat: focused ? 'chatbubbles' : 'chatbubbles-outline',
    map: focused ? 'map' : 'map-outline',
    scan: focused ? 'scan' : 'scan-outline',
    account: focused ? 'person' : 'person-outline',
  };

  return <Ionicons name={iconMap[name] || 'ellipse-outline'} size={24} color={color} />;
};

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, userPostcode, userSettings, loadInitialData } = useAppStore();

  useEffect(() => {
    loadInitialData();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="SignIn" component={SignInScreen} />
        ) : !userPostcode ? (
          <Stack.Screen name="Postcode" component={PostcodeScreen} />
        ) : !userSettings.hasCompletedOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="FloorPlanSearch"
              component={FloorPlanSearchScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="FloorPlanConfirm"
              component={FloorPlanConfirmScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="FloorPlanManualInput"
              component={FloorPlanManualInputScreen}
              options={{
                headerShown: true,
                title: 'Add Floor Plan',
                headerStyle: {
                  backgroundColor: colors.cardBackground,
                  elevation: 0,
                  shadowOpacity: 0.3,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
                headerTitleStyle: {
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.textPrimary,
                },
                headerTintColor: colors.accentBlue,
              }}
            />
            <Stack.Screen
              name="Postcode"
              component={PostcodeScreen}
              options={{
                headerShown: true,
                title: 'Update Postcode',
                headerStyle: {
                  backgroundColor: colors.cardBackground,
                  elevation: 0,
                  shadowOpacity: 0.3,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowRadius: 2,
                },
                headerTitleStyle: {
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.textPrimary,
                },
                headerTintColor: colors.accentBlue,
              }}
            />
            <Stack.Screen
              name="AccountSettings"
              component={AccountSettingsScreen}
              options={{
                headerShown: true,
                title: 'Account Settings',
                headerStyle: {
                  backgroundColor: colors.cardBackground,
                  elevation: 0,
                  shadowOpacity: 0.3,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowRadius: 2,
                },
                headerTitleStyle: {
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.textPrimary,
                },
                headerTintColor: colors.accentBlue,
              }}
            />
            <Stack.Screen
              name="SpeedTest"
              component={SpeedTestScreen}
              options={{
                headerShown: true,
                title: 'Speed Test',
                headerStyle: {
                  backgroundColor: colors.cardBackground,
                  elevation: 0,
                  shadowOpacity: 0.3,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowRadius: 2,
                },
                headerTitleStyle: {
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.textPrimary,
                },
                headerTintColor: colors.accentBlue,
              }}
            />
            <Stack.Screen
              name="AgentDetail"
              component={AgentDetailScreen}
              options={{
                headerShown: true,
                title: '',
                headerStyle: {
                  backgroundColor: colors.cardBackground,
                  elevation: 0,
                  shadowOpacity: 0.3,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowRadius: 2,
                },
                headerTitleStyle: {
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.textPrimary,
                },
                headerTintColor: colors.accentBlue,
              }}
            />
            <Stack.Screen
              name="AIAgentChat"
              component={AIAgentChatScreen}
              options={({ route }) => {
                // Get agent name for header
                const params = route.params as { agentId: string } | undefined;
                const agentId = params?.agentId;
                const agents = useAppStore.getState().agents;
                const agent = agentId ? agents.find((a) => a.id === agentId) : null;
                
                return {
                  headerShown: true,
                  title: agent?.name || 'Chat',
                  headerStyle: {
                    backgroundColor: '#1A1A1A',
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 0.5,
                    borderBottomColor: '#2A2A2A',
                  },
                  headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: '600',
                    color: '#FFFFFF',
                  },
                  headerTintColor: '#4CAF50',
                };
              }}
            />
            <Stack.Screen
              name="HousePlans"
              component={HousePlansScreen}
              options={{
                headerShown: true,
                title: 'House Plans',
                headerStyle: {
                  backgroundColor: colors.cardBackground,
                  elevation: 0,
                  shadowOpacity: 0.3,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowRadius: 2,
                },
                headerTitleStyle: {
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.textPrimary,
                },
                headerTintColor: colors.accentBlue,
              }}
            />
            <Stack.Screen
              name="HousePlanDetail"
              component={HousePlanDetailScreen}
              options={{
                headerShown: true,
                title: 'Plan Details',
                headerStyle: {
                  backgroundColor: colors.cardBackground,
                  elevation: 0,
                  shadowOpacity: 0.3,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowRadius: 2,
                },
                headerTitleStyle: {
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.textPrimary,
                },
                headerTintColor: colors.accentBlue,
              }}
            />
            <Stack.Screen
              name="ARHeatmap"
              component={ARHeatmapScreen}
              options={{
                headerShown: true,
                title: 'WiFi Scan',
                headerStyle: {
                  backgroundColor: colors.cardBackground,
                  elevation: 0,
                  shadowOpacity: 0.3,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowRadius: 2,
                },
                headerTitleStyle: {
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.textPrimary,
                },
                headerTintColor: colors.accentBlue,
              }}
            />
            <Stack.Screen
              name="HeatmapSummary"
              component={HeatmapSummaryScreen}
              options={{
                headerShown: true,
                title: 'Heatmap Summary',
                headerStyle: {
                  backgroundColor: colors.cardBackground,
                  elevation: 0,
                  shadowOpacity: 0.3,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowRadius: 2,
                },
                headerTitleStyle: {
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.textPrimary,
                },
                headerTintColor: colors.accentBlue,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

