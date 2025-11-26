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
    navigation.navigate('HousePlanDetail', { planId: plan.applicationId });
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
    <TouchableOpacity onPress={() => handleSelectPlan(item)}>
      <Card style={styles.planCard}>
        <View style={styles.planHeader}>
          <View style={styles.iconContainer}>
            <Text style={styles.planIcon}>🏠</Text>
          </View>
          <View style={styles.planInfo}>
            <Text style={styles.planAddress} numberOfLines={1}>
              {item.addressLabel || 'My Home'}
            </Text>
            <Text style={styles.planDetails}>
              {item.floors} Floors • {item.rooms.length} Rooms
            </Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeletePlan(item)}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
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
            Add a floor plan to start optimizing your WiFi network.
          </Text>
          <Button
            title="Add Your First Plan"
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
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  planIcon: {
    fontSize: 24,
  },
  planInfo: {
    flex: 1,
  },
  planAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  planDetails: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  deleteButton: {
    padding: 8,
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


