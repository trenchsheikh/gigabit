import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAppStore } from '../store/useAppStore';
import { mockHousePlan181392 } from '../data/mockHousePlans';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../navigation/types';
import type { StackNavigationProp } from '@react-navigation/stack';

const PLANNING_PORTAL_URL =
  'https://publicaccess.easthants.gov.uk/planning/index.html?fa=getApplication&id=181392';

type HousePlansNavigationProp = StackNavigationProp<RootStackParamList>;

export const HousePlansScreen: React.FC = () => {
  const navigation = useNavigation<HousePlansNavigationProp>();
  const { addHousePlan, selectHousePlan } = useAppStore();
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!address.trim() || !postcode.trim()) {
      Alert.alert('Validation Error', 'Please fill in address and postcode');
      return;
    }

    setLoading(true);
    try {
      // For MVP, use the mocked plan for any valid input
      const fullAddress = `${address.trim()}, ${postcode.trim()}`;
      const plan = {
        ...mockHousePlan181392,
        addressLabel: fullAddress,
      };

      await addHousePlan(plan);
      selectHousePlan(plan);
      Alert.alert(
        'Success',
        'House plan added successfully!',
        [
          {
            text: 'View Details',
            onPress: () =>
              navigation.navigate('HousePlanDetail', {
                planId: plan.applicationId,
              }),
          },
          { text: 'OK' },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add house plan. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPlanningPortal = async () => {
    try {
      await Linking.openURL(PLANNING_PORTAL_URL);
    } catch (error) {
      Alert.alert('Error', 'Failed to open planning portal');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Text style={styles.title}>Add House Plan</Text>
        <Text style={styles.description}>
          Enter your address to load your house plan. For MVP, we support the
          East Hampshire planning application 181392.
        </Text>

        <Text style={styles.label}>Street Address *</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="e.g., 123 Main Street"
        />

        <Text style={styles.label}>Postcode *</Text>
        <TextInput
          style={styles.input}
          value={postcode}
          onChangeText={setPostcode}
          placeholder="e.g., GU35 0AB"
          autoCapitalize="characters"
        />

        <Button
          title="Load Plan"
          onPress={handleSubmit}
          variant="primary"
          loading={loading}
          style={styles.submitButton}
        />

        <TouchableOpacity
          style={styles.linkContainer}
          onPress={handleViewPlanningPortal}
        >
          <Text style={styles.linkText}>
            View Planning Application Online →
          </Text>
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.cardBackground,
    color: colors.textPrimary,
  },
  submitButton: {
    marginTop: 24,
  },
  linkContainer: {
    marginTop: 16,
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 14,
    color: colors.accentBlue,
    textAlign: 'center',
  },
});


