import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAppStore } from '../store/useAppStore';
import type { RootStackParamList } from '../navigation/types';
import type { StackNavigationProp } from '@react-navigation/stack';

type PlansNavigationProp = StackNavigationProp<RootStackParamList>;

export const PlansScreen: React.FC = () => {
  const navigation = useNavigation<PlansNavigationProp>();
  const { housePlans } = useAppStore();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 16 }]}>
        <Text style={styles.title}>House Plans</Text>
        <Button
          title="+ Add Plan"
          onPress={() => navigation.navigate('HousePlans')}
          variant="primary"
          style={styles.addButton}
        />
      </View>

      {housePlans.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🗺️</Text>
          <Text style={styles.emptyTitle}>No House Plans Yet</Text>
          <Text style={styles.emptyDescription}>
            Add your house plan to get started with WiFi optimization
          </Text>
          <Button
            title="Add Plan"
            onPress={() => navigation.navigate('HousePlans')}
            variant="primary"
            style={styles.createButton}
          />
        </View>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {housePlans.map((plan) => (
            <Card
              key={plan.applicationId}
              style={styles.planCard}
              onPress={() =>
                navigation.navigate('HousePlanDetail', {
                  planId: plan.applicationId,
                })
              }
            >
              <Text style={styles.planAddress}>{plan.addressLabel}</Text>
              <Text style={styles.planInfo}>
                {plan.floors} floor{plan.floors !== 1 ? 's' : ''} • {plan.rooms.length} rooms
              </Text>
              <Text style={styles.planId}>ID: {plan.applicationId}</Text>
            </Card>
          ))}
        </ScrollView>
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
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  planCard: {
    marginBottom: 12,
  },
  planAddress: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  planInfo: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  planId: {
    fontSize: 12,
    color: '#999',
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


