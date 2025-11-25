import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../navigation/types';
import type { RouteProp } from '@react-navigation/native';

type AgentDetailRouteProp = RouteProp<RootStackParamList, 'AgentDetail'>;

export const AgentDetailScreen: React.FC = () => {
  const route = useRoute<AgentDetailRouteProp>();
  const navigation = useNavigation();
  const { agentId } = route.params;
  const { agents } = useAppStore();

  const agent = agents.find((a) => a.id === agentId);

  if (!agent) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Assistant not found</Text>
      </View>
    );
  }

  // Agent-specific action buttons
  const getActionButtons = () => {
    if (agent.id === 'familyguardian-ai') {
      return [
        { title: 'Set up parental controls', variant: 'primary' as const, onPress: () => handleChat() },
        { title: 'Learn about privacy settings', variant: 'secondary' as const, onPress: () => handleChat() },
        { title: 'Talk to FamilyGuardian', variant: 'secondary' as const, onPress: () => handleChat() },
      ];
    } else if (agent.id === 'cyberguardian-ai') {
      return [
        { title: 'Scan for threats', variant: 'primary' as const, onPress: () => handleChat() },
        { title: 'Security best practices', variant: 'secondary' as const, onPress: () => handleChat() },
        { title: 'Talk to CyberGuardian', variant: 'secondary' as const, onPress: () => handleChat() },
      ];
    } else if (agent.id === 'wifi-expert-ai') {
      return [
        { title: 'Run Speed Test', variant: 'primary' as const, onPress: () => navigation.navigate('SpeedTest') },
        { title: 'Optimize WiFi settings', variant: 'secondary' as const, onPress: () => handleChat() },
        { title: 'Talk to WiFi Expert', variant: 'secondary' as const, onPress: () => handleChat() },
      ];
    }
    return [
      { title: 'Start Chat', variant: 'primary' as const, onPress: () => handleChat() },
    ];
  };

  const handleChat = () => {
    navigation.navigate('AIAgentChat', { agentId: agent.id });
  };

  const getAgentAvatar = () => {
    if (agent.id === 'familyguardian-ai') {
      return '🛡️';
    } else if (agent.id === 'cyberguardian-ai') {
      return '🔒';
    } else if (agent.id === 'wifi-expert-ai') {
      return '📶';
    }
    return '🤖';
  };

  const getAgentDescription = () => {
    if (agent.id === 'familyguardian-ai') {
      return 'FamilyGuardian is here to help you keep your family safe online.';
    } else if (agent.id === 'cyberguardian-ai') {
      return 'CyberGuardian protects you from cyber threats and helps secure your digital life.';
    } else if (agent.id === 'wifi-expert-ai') {
      return 'WiFi Expert helps optimize your network performance and troubleshoot connectivity issues.';
    }
    return agent.description;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>{getAgentAvatar()}</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.agentTitle}>Meet {agent.name.replace(' AI', '')}</Text>

      {/* Description */}
      <Text style={styles.agentDescription}>{getAgentDescription()}</Text>

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        {getActionButtons().map((button, index) => (
          <Button
            key={index}
            title={button.title}
            onPress={button.onPress}
            variant={button.variant}
            style={styles.actionButton}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    marginTop: 20,
    marginBottom: 32,
  },
  avatarCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#3A3A3A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarEmoji: {
    fontSize: 72,
  },
  agentTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  agentDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
  },
  actionButton: {
    width: '100%',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 40,
    color: colors.textSecondary,
    fontSize: 16,
  },
});

