import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAppStore } from '../store/useAppStore';
import { postcodeService } from '../services/postcode';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../navigation/types';
import type { StackNavigationProp } from '@react-navigation/stack';

type PostcodeNavigationProp = StackNavigationProp<RootStackParamList, 'Postcode'>;

export const PostcodeScreen: React.FC = () => {
  const navigation = useNavigation<PostcodeNavigationProp>();
  const { userPostcode, setUserPostcode } = useAppStore();
  const [postcode, setPostcode] = useState(userPostcode || '');
  const [loading, setLoading] = useState(false);
  const [postcodeData, setPostcodeData] = useState<any>(null);

  const handleSearch = async () => {
    if (!postcode.trim()) {
      Alert.alert('Error', 'Please enter a postcode');
      return;
    }

    // Basic UK postcode format validation
    const ukPostcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
    const formattedPostcode = postcode.trim().toUpperCase().replace(/\s+/g, ' ');
    
    if (!ukPostcodeRegex.test(formattedPostcode)) {
      Alert.alert('Error', 'Please enter a valid UK postcode (e.g., SW1A 1AA)');
      return;
    }

    // MVP Restriction: East Hampshire only (GU30-35, PO8-9) and Grayshott/Hindhead (GU26)
    const ehRegex = /^(GU3[0-5]|PO[89]|GU26)\s.*$/;
    if (!ehRegex.test(formattedPostcode)) {
      Alert.alert(
        'Coming Soon',
        'GigaBit is currently only available in the East Hampshire area (GU30-35, PO8-9). We are expanding soon!',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    try {
      const data = await postcodeService.searchPostcode(formattedPostcode);
      if (data) {
        setPostcodeData(data);
        await setUserPostcode(formattedPostcode, data);
        Alert.alert(
          'Success',
          `Postcode found: ${data.postcode || formattedPostcode}\n${data.parish || data.admin_district || ''}`,
          [
            {
              text: 'Continue',
              onPress: () => {
                // If user already had a postcode, go back; otherwise go to Main
                if (userPostcode) {
                  navigation.goBack();
                } else {
                  navigation.replace('FloorPlanSearch');
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Postcode not found. Please try again.');
      }
    } catch (error) {
      console.error('Postcode search error:', error);
      Alert.alert('Error', 'Failed to search postcode. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Only allow skip if user doesn't have a postcode yet
    if (!userPostcode) {
      Alert.alert(
        'Skip Postcode',
        'You can add your postcode later in settings.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Skip',
            onPress: () => navigation.replace('Main', { screen: 'Dashboard' }),
          },
        ]
      );
    } else {
      // If updating postcode, just go back
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.icon}>📍</Text>
            <Text style={styles.title}>Enter Your Postcode</Text>
            <Text style={styles.subtitle}>
              We'll use this to provide location-based WiFi insights
            </Text>
          </View>

          <Card style={styles.card}>
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>UK Postcode</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., SW1A 1AA"
                  placeholderTextColor={colors.textSecondary}
                  value={postcode}
                  onChangeText={(text) => {
                    // Auto-format postcode
                    const formatted = text.toUpperCase().replace(/[^A-Z0-9\s]/g, '');
                    setPostcode(formatted);
                  }}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  editable={!loading}
                  onSubmitEditing={handleSearch}
                />
                <Text style={styles.hint}>
                  Enter your UK postcode to get started
                </Text>
              </View>

              {loading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#4CAF50" />
                  <Text style={styles.loadingText}>Searching...</Text>
                </View>
              )}

              {postcodeData && (
                <View style={styles.resultContainer}>
                  <Text style={styles.resultTitle}>Postcode Details:</Text>
                  <Text style={styles.resultText}>
                    {postcodeData.postcode || postcode}
                  </Text>
                  {postcodeData.parish && (
                    <Text style={styles.resultText}>{postcodeData.parish}</Text>
                  )}
                  {postcodeData.admin_district && (
                    <Text style={styles.resultText}>
                      {postcodeData.admin_district}
                    </Text>
                  )}
                </View>
              )}

              <View style={styles.buttonContainer}>
                <Button
                  title="Search"
                  onPress={handleSearch}
                  loading={loading}
                  style={styles.searchButton}
                />
                <Button
                  title="Skip for Now"
                  onPress={handleSkip}
                  variant="outline"
                  style={styles.skipButton}
                  disabled={loading}
                />
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    fontSize: 80,
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
    marginTop: 20,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  resultContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.accentBlue,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accentBlue,
    marginBottom: 8,
  },
  resultText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  searchButton: {
    width: '100%',
  },
  skipButton: {
    width: '100%',
  },
});

