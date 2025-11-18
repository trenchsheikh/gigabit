import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAppStore } from '../store/useAppStore';
import type { RootStackParamList, MainTabParamList } from './types';
import type { StackScreenProps } from '@react-navigation/stack';

// Screens
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { AgentsScreen } from '../screens/AgentsScreen';
import { PlansScreen } from '../screens/PlansScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { SpeedTestScreen } from '../screens/SpeedTestScreen';
import { AIAgentChatScreen } from '../screens/AIAgentChatScreen';
import { HousePlansScreen } from '../screens/HousePlansScreen';
import { HousePlanDetailScreen } from '../screens/HousePlanDetailScreen';
import { ARHeatmapScreen } from '../screens/ARHeatmapScreen';
import { HeatmapSummaryScreen } from '../screens/HeatmapSummaryScreen';
import { AgentDetailScreen } from '../screens/AgentDetailScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: {
          backgroundColor: '#1A1A1A',
          borderTopWidth: 0.5,
          borderTopColor: '#2A2A2A',
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          height: 70 + Math.max(insets.bottom - 8, 0),
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
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
    </Tab.Navigator>
  );
};

const TabIcon: React.FC<{ name: string; color: string; focused: boolean }> = ({ name, color, focused }) => {
  // Simple icon placeholders - in production, use react-native-vector-icons
  const icons: Record<string, string> = {
    home: '🏠',
    chat: '💬',
    map: '🗺️',
    scan: '📡',
  };
  return (
    <Text 
      style={{ 
        fontSize: focused ? 26 : 24,
        opacity: focused ? 1 : 0.6,
      }}
    >
      {icons[name] || '•'}
    </Text>
  );
};

export const AppNavigator: React.FC = () => {
  const { userSettings, loadInitialData } = useAppStore();

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
        {!userSettings.hasCompletedOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="SpeedTest"
              component={SpeedTestScreen}
              options={{
                headerShown: true,
                title: 'Speed Test',
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
              }}
            />
            <Stack.Screen
              name="AgentDetail"
              component={AgentDetailScreen}
              options={{
                headerShown: true,
                title: '',
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
              }}
            />
            <Stack.Screen
              name="HousePlanDetail"
              component={HousePlanDetailScreen}
              options={{
                headerShown: true,
                title: 'Plan Details',
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
              }}
            />
            <Stack.Screen
              name="ARHeatmap"
              component={ARHeatmapScreen}
              options={{
                headerShown: true,
                title: 'WiFi Scan',
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
              }}
            />
            <Stack.Screen
              name="HeatmapSummary"
              component={HeatmapSummaryScreen}
              options={{
                headerShown: true,
                title: 'Heatmap Summary',
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
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

