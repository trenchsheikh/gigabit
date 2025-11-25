import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { floorPlanService } from '../services/floorPlan';
import { colors } from '../theme/colors';

type NavigationProp = StackNavigationProp<RootStackParamList, 'FloorPlanSearch'>;

export const FloorPlanSearchScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { userPostcode } = useAppStore();

  useEffect(() => {
    const search = async () => {
      if (!userPostcode) {
        navigation.replace('FloorPlanManualInput');
        return;
      }

      try {
        const plan = await floorPlanService.searchFloorPlan(userPostcode);
        if (plan) {
          navigation.replace('FloorPlanConfirm', { plan });
        } else {
          navigation.replace('FloorPlanManualInput');
        }
      } catch (error) {
        console.error('Error searching for floor plan:', error);
        navigation.replace('FloorPlanManualInput');
      }
    };

    search();
  }, [userPostcode, navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accentBlue} style={styles.spinner} />
      <Text style={styles.title}>Searching public records...</Text>
      <Text style={styles.subtitle}>
        Looking for floor plans for {userPostcode}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  spinner: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
