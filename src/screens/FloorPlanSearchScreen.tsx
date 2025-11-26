import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { floorPlanService } from '../services/floorPlan';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = StackNavigationProp<RootStackParamList, 'FloorPlanSearch'>;

export const FloorPlanSearchScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchingPlan, setSearchingPlan] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true);
        const addresses = await floorPlanService.searchAddress(query);
        setResults(addresses);
        setLoading(false);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectAddress = async (address: string) => {
    setSearchingPlan(true);
    try {
      const plan = await floorPlanService.searchFloorPlan(address);
      if (plan) {
        navigation.replace('FloorPlanConfirm', { plan });
      } else {
        // If no plan found, go to manual input with the address
        navigation.replace('FloorPlanManualInput', { address });
      }
    } catch (error) {
      console.error('Error searching for floor plan:', error);
      navigation.replace('FloorPlanManualInput', { address });
    } finally {
      setSearchingPlan(false);
    }
  };

  if (searchingPlan) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.accentBlue} style={styles.spinner} />
        <Text style={styles.title}>Searching public records...</Text>
        <Text style={styles.subtitle}>Looking for floor plans for {query}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Your Home</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Start typing your address..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
        {loading && <ActivityIndicator size="small" color={colors.accentBlue} />}
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.resultItem} onPress={() => handleSelectAddress(item)}>
            <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.resultText}>{item}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          query.length > 2 && !loading ? (
            <Text style={styles.emptyText}>No addresses found</Text>
          ) : null
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60, // Safe area
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultText: {
    marginLeft: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 20,
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
