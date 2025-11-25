import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';

type NavigationProp = StackNavigationProp<RootStackParamList, 'FloorPlanConfirm'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'FloorPlanConfirm'>;

export const FloorPlanConfirmScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { plan } = route.params;
  const { addHousePlan, selectHousePlan } = useAppStore();

  const handleConfirm = async () => {
    // Save the plan to the store
    await addHousePlan(plan);
    selectHousePlan(plan);
    
    // Navigate to the main app (Plans tab)
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main', params: { screen: 'Plans' } }],
    });
  };

  const handleReject = () => {
    navigation.replace('FloorPlanManualInput');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.icon}>🏠</Text>
          <Text style={styles.title}>Is this your home?</Text>
          <Text style={styles.subtitle}>
            We found a floor plan that matches your address.
          </Text>
        </View>

        <Card style={styles.card}>
          <View style={styles.planPreview}>
            <Text style={styles.placeholderIcon}>🗺️</Text>
            <Text style={styles.placeholderText}>Floor Plan Preview</Text>
          </View>
          
          <View style={styles.details}>
            <Text style={styles.address}>{plan.addressLabel}</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{plan.floors}</Text>
                <Text style={styles.statLabel}>Floors</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{plan.rooms.length}</Text>
                <Text style={styles.statLabel}>Rooms</Text>
              </View>
            </View>
          </View>
        </Card>

        <View style={styles.actions}>
          <Button
            title="Yes, this is it"
            onPress={handleConfirm}
            style={styles.confirmButton}
          />
          <Button
            title="No, that's not right"
            onPress={handleReject}
            variant="outline"
            style={styles.rejectButton}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 32,
  },
  planPreview: {
    height: 200,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 8,
    opacity: 0.5,
  },
  placeholderText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  details: {
    padding: 20,
  },
  address: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.accentBlue,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  actions: {
    gap: 12,
  },
  confirmButton: {
    width: '100%',
  },
  rejectButton: {
    width: '100%',
  },
});
