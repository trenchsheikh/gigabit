import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList } from '../navigation/types';
import type { StackNavigationProp } from '@react-navigation/stack';
import { HousePlan } from '../types';

type HousePlansNavigationProp = StackNavigationProp<RootStackParamList>;

export const HousePlansScreen: React.FC = () => {
  const navigation = useNavigation<HousePlansNavigationProp>();
  const { housePlans, selectHousePlan, deleteHousePlan } = useAppStore();

  const handleAddPlan = () => {
    navigation.navigate('FloorPlanSearch');
  };

  const handleSelectPlan = (plan: HousePlan) => {
    selectHousePlan(plan);
    if (plan.applicationId.startsWith('VISUAL-')) {
        navigation.navigate('FloorPlanCreator', { initialPlan: plan });
    } else {
        navigation.navigate('HousePlanDetail', { planId: plan.applicationId });
    }
  };

  const handleDeletePlan = (plan: HousePlan) => {
    Alert.alert(
      'Delete Plan',
      'Are you sure you want to delete this floor plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteHousePlan(plan.applicationId),
        },
      ]
    );
  };

  const renderPlanItem = ({ item }: { item: HousePlan }) => (
    <Card style={styles.planCard}>
      <TouchableOpacity 
        style={styles.planHeaderContainer} 
        onPress={() => handleSelectPlan(item)}
        activeOpacity={0.7}
      >
        <View style={styles.planHeader}>
          <View style={styles.planInfo}>
            <Text style={styles.planAddress}>
              {item.addressLabel || 'My Home'}
            </Text>
            <Text style={styles.planDetails}>
              {item.floors} Floors • {item.rooms.length} Rooms
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </View>
      </TouchableOpacity>
      
      <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('FloorPlanCreator', { initialPlan: item })}
            >
              <Ionicons name="create-outline" size={20} color={colors.accentBlue} />
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteActionButton]}
              onPress={() => handleDeletePlan(item)}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
            </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Floor Plans</Text>
        <Button
          title="Add Plan"
          onPress={handleAddPlan}
          variant="primary"
          style={styles.addButton}
          icon={<Ionicons name="add" size={20} color="#FFF" />}
        />
      </View>

      {housePlans.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyTitle}>No Floor Plans Yet</Text>
          <Text style={styles.emptyDescription}>
            Create a floor plan to visualize your home.
          </Text>
          <Button
            title="Create New Plan"
            onPress={handleAddPlan}
            variant="primary"
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <FlatList
          data={housePlans}
          renderItem={renderPlanItem}
          keyExtractor={(item) => item.applicationId}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  addButton: {
    paddingHorizontal: 16,
    height: 40,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  planCard: {
    marginBottom: 16,
    padding: 16,
  },
  planHeaderContainer: {
    marginBottom: 12,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Ensure chevron is pushed to right
  },
  planInfo: {
    flex: 1,
  },
  planAddress: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  planDetails: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: colors.border,
  },
  deleteActionButton: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FFEBEE',
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: colors.accentBlue,
  },
  deleteButtonText: {
    color: colors.error,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  emptyButton: {
    width: '100%',
  },
});


