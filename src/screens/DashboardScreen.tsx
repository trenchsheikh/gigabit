import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAppStore } from '../store/useAppStore';
import type { RootStackParamList } from '../navigation/types';
import type { StackNavigationProp } from '@react-navigation/stack';

type DashboardNavigationProp = StackNavigationProp<RootStackParamList>;

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardNavigationProp>();
  const { networkSummary } = useAppStore();
  const insets = useSafeAreaInsets();

  // Mock protection scores matching Figma
  const protectionScore = 78;
  const subScores = [
    { name: 'Online Safety', score: 80, icon: '🛡️' },
    { name: 'Scam Protection', score: 90, icon: '🛡️' },
    { name: 'WiFi Health', score: 65, icon: '📶' },
  ];

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top, 20) + 16 }
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>GigaBit WiFi AI</Text>
      </View>

      {/* Protection Score */}
      <View style={styles.protectionScoreSection}>
        <Text style={styles.protectionScoreLabel}>Protection Score</Text>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${protectionScore}%` }]} />
          </View>
          <Text style={styles.progressBarText}>{protectionScore}/100</Text>
        </View>
      </View>

      {/* Overall Protection */}
      <Card style={styles.overallProtectionCard}>
        <View style={styles.protectionGraphic}>
          <Text style={styles.graphicEmoji}>🛡️👨‍👩‍👧‍👦</Text>
        </View>
        <View style={styles.protectionContent}>
          <Text style={styles.protectionTitle}>Overall Protection</Text>
          <Text style={styles.protectionDescription}>
            Your family's overall protection score is good. Keep up the great work!
          </Text>
          <Button
            title="View Details"
            onPress={() => {}}
            variant="secondary"
            style={styles.viewDetailsButton}
          />
        </View>
      </Card>

      {/* Sub-Scores */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sub-Scores</Text>
        {subScores.map((item, index) => (
          <Card key={index} style={styles.subScoreCard}>
            <View style={styles.subScoreRow}>
              <Text style={styles.subScoreIcon}>{item.icon}</Text>
              <View style={styles.subScoreContent}>
                <Text style={styles.subScoreName}>{item.name}</Text>
                <Text style={styles.subScoreValue}>{item.score}/100</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>

      {/* Assistants */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assistants</Text>
        {[
          { id: 'familyguardian-ai', name: 'FamilyGuardian AI', description: 'Online Safety Advisor', emoji: '🛡️' },
          { id: 'cyberguardian-ai', name: 'CyberGuardian AI', description: 'Cybersecurity Expert', emoji: '🔒' },
          { id: 'wifi-expert-ai', name: 'WiFi Expert AI', description: 'WiFi Optimization Advisor', emoji: '📶' },
        ].map((assistant) => (
          <Card key={assistant.id} style={styles.assistantCard}>
            <View style={styles.assistantRow}>
              <View style={styles.assistantContent}>
                <Text style={styles.assistantName}>{assistant.name}</Text>
                <Text style={styles.assistantDescription}>{assistant.description}</Text>
              </View>
              <View style={styles.assistantAvatar}>
                <Text style={styles.assistantAvatarEmoji}>{assistant.emoji}</Text>
              </View>
            </View>
            <Button
              title="Open"
              onPress={() => navigation.navigate('AgentDetail', { agentId: assistant.id })}
              variant="secondary"
              style={styles.openButton}
            />
          </Card>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A', // Dark mode background
  },
  content: {
    padding: 20,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  protectionScoreSection: {
    marginBottom: 24,
  },
  protectionScoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressBarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    minWidth: 50,
  },
  overallProtectionCard: {
    marginBottom: 24,
    backgroundColor: '#2A2A2A',
  },
  protectionGraphic: {
    height: 180,
    backgroundColor: '#1E3A3A',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  graphicEmoji: {
    fontSize: 80,
  },
  protectionContent: {
    gap: 12,
  },
  protectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  protectionDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  viewDetailsButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  summaryCard: {
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000000',
  },
  speedRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  speedItem: {
    alignItems: 'center',
  },
  speedLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  speedValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  lastTest: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  subScoreCard: {
    marginBottom: 12,
    backgroundColor: '#2A2A2A',
  },
  subScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  subScoreIcon: {
    fontSize: 24,
  },
  subScoreContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subScoreName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subScoreValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  assistantCard: {
    backgroundColor: '#2A2A2A',
  },
  assistantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  assistantContent: {
    flex: 1,
  },
  assistantName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  assistantDescription: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  assistantAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1E3A3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  assistantAvatarEmoji: {
    fontSize: 32,
  },
  openButton: {
    alignSelf: 'flex-start',
  },
});


