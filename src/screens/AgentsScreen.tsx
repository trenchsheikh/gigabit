import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../navigation/types';
import type { StackNavigationProp } from '@react-navigation/stack';

type AgentsNavigationProp = StackNavigationProp<RootStackParamList>;

export const AgentsScreen: React.FC = () => {
  const navigation = useNavigation<AgentsNavigationProp>();
  const { agents, loadInitialData } = useAppStore();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadInitialData();
  }, []);

  const getAgentColor = (agentId: string) => {
    switch (agentId) {
      case 'familyguardian-ai':
        return '255, 152, 0'; // Orange
      case 'cyberguardian-ai':
        return '244, 67, 54'; // Red
      case 'wifi-expert-ai':
        return '33, 150, 243'; // Blue
      default:
        return '76, 175, 80'; // Green
    }
  };

  const getAgentIcon = (agentId: string) => {
    switch (agentId) {
      case 'familyguardian-ai':
        return '🛡️';
      case 'cyberguardian-ai':
        return '🔒';
      case 'wifi-expert-ai':
        return '📶';
      default:
        return '🤖';
    }
  };

  const renderAgent = ({ item }: { item: any }) => {
    const colorRgb = getAgentColor(item.id);
    const icon = getAgentIcon(item.id);
    
    return (
      <TouchableOpacity
        style={styles.agentCardWrapper}
        onPress={() => navigation.navigate('AgentDetail', { agentId: item.id })}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[
            `rgba(${colorRgb}, 0.15)`,
            `rgba(${colorRgb}, 0.08)`,
            'rgba(255, 255, 255, 0.9)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.agentCardGradient}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.5 }}
            style={styles.glassShine}
          />
          <View style={styles.agentCard}>
            <View style={styles.agentCardContent}>
              <View style={[styles.agentAvatar, { backgroundColor: `rgba(${colorRgb}, 0.2)` }]}>
                <Text style={styles.agentAvatarEmoji}>{icon}</Text>
              </View>
              <View style={styles.agentInfo}>
                <Text style={styles.agentName}>{item.name}</Text>
                <Text style={styles.agentDescription}>{item.description}</Text>
              </View>
              <View style={styles.agentArrow}>
                <Ionicons name="chevron-forward" size={20} color={`rgb(${colorRgb})`} />
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 16 }]}>
        <Text style={styles.title}>Personal Assistants</Text>
      </View>
      {agents.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🤖</Text>
          <Text style={styles.emptyTitle}>No AI Assistants Available</Text>
          <Text style={styles.emptyDescription}>
            AI Assistants will appear here when available
          </Text>
        </View>
      ) : (
        <FlatList
          data={agents}
          renderItem={renderAgent}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  list: {
    padding: 20,
    paddingTop: 12,
  },
  agentCardWrapper: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  agentCardGradient: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  glassShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    zIndex: 2,
  },
  agentCard: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 0,
    position: 'relative',
    zIndex: 1,
  },
  agentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  agentDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  agentAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  agentAvatarEmoji: {
    fontSize: 28,
  },
  agentArrow: {
    // Arrow positioned with gap
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});


