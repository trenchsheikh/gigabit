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
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAppStore } from '../store/useAppStore';
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

  const renderAgent = ({ item }: { item: any }) => (
    <Card
      style={styles.agentCard}
      onPress={() => navigation.navigate('AgentDetail', { agentId: item.id })}
    >
      <View style={styles.agentCardContent}>
        <View style={styles.agentInfo}>
          <Text style={styles.agentName}>{item.name}</Text>
          <Text style={styles.agentDescription}>{item.description}</Text>
        </View>
        <View style={styles.agentAvatar}>
          <Text style={styles.agentAvatarEmoji}>
            {item.id === 'familyguardian-ai' ? '🛡️' : 
             item.id === 'cyberguardian-ai' ? '🔒' : 
             item.id === 'wifi-expert-ai' ? '📶' : '🤖'}
          </Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 16 }]}>
        <Text style={styles.title}>AI Assistants</Text>
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
        <>
          <FlatList
            data={agents}
            renderItem={renderAgent}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.headerSpacer} />
            }
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  newButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    minHeight: 40,
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  headerSpacer: {
    height: 0,
  },
  agentCard: {
    marginBottom: 12,
  },
  agentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  agentDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  agentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1E3A3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  agentAvatarEmoji: {
    fontSize: 32,
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
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    minWidth: 200,
  },
});


