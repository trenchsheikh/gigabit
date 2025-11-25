import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../navigation/types';
import type { StackNavigationProp } from '@react-navigation/stack';

type PlansNavigationProp = StackNavigationProp<RootStackParamList>;

export const PlansScreen: React.FC = () => {
  const navigation = useNavigation<PlansNavigationProp>();
  const { housePlans, deleteHousePlan } = useAppStore();
  const insets = useSafeAreaInsets();

  const handleDelete = (planId: string) => {
    Alert.alert(
      'Delete Plan',
      'Are you sure you want to delete this floor plan? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHousePlan(planId);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete plan');
            }
          },
        },
      ]
    );
  };

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
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.planAddress}>{plan.addressLabel}</Text>
                  <Text style={styles.planInfo}>
                    {plan.floors} floor{plan.floors !== 1 ? 's' : ''} • {plan.rooms.length} rooms
                  </Text>
                  <Text style={styles.planId}>ID: {plan.applicationId}</Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      navigation.navigate('FloorPlanManualInput', {
                        initialPlan: plan,
                      });
                    }}
                  >
                    <Ionicons name="pencil" size={20} color={colors.accentBlue} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDelete(plan.applicationId);
                    }}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
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
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
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
    color: colors.textPrimary,
    marginBottom: 8,
  },
  planInfo: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  planId: {
    fontSize: 12,
    color: '#999',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deleteButton: {
    borderColor: colors.error,
    backgroundColor: '#FFF5F5',
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
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    minWidth: 200,
  },
});


