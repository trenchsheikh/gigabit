import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';
import { useAppStore } from '../store/useAppStore';
import type { RootStackParamList } from '../navigation/types';
import type { StackNavigationProp } from '@react-navigation/stack';

const { width } = Dimensions.get('window');

type OnboardingNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const { updateUserSettings } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to GigaBit WiFi AI',
      description: 'Your intelligent assistant for optimizing home WiFi networks',
      image: '📡',
    },
    {
      title: 'Speed Test',
      description: 'Test your network speed and get instant insights',
      image: '⚡',
    },
    {
      title: 'AI Assistants',
      description: 'Chat with custom AI assistants specialized in WiFi optimization',
      image: '🤖',
    },
    {
      title: 'AR Heatmap',
      description: 'Scan your home and visualize WiFi signal strength',
      image: '🗺️',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    await updateUserSettings({ hasCompletedOnboarding: true });
    navigation.replace('Main');
  };

  const handleSkip = () => {
    handleFinish();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        pagingEnabled
        horizontal
        scrollEnabled={false}
      >
        {steps.map((step, index) => (
          <View key={index} style={styles.stepContainer}>
            <View style={styles.imageContainer}>
              <Text style={styles.imageEmoji}>{step.image}</Text>
            </View>
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.description}>{step.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.indicatorContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentStep && styles.indicatorActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          {currentStep < steps.length - 1 && (
            <Button
              title="Skip"
              onPress={handleSkip}
              variant="outline"
              style={styles.skipButton}
            />
          )}
          <Button
            title={currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
            onPress={handleNext}
            variant="primary"
            style={styles.primaryButton}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  scrollContent: {
    flexGrow: 1,
  },
  stepContainer: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  imageContainer: {
    marginBottom: 40,
  },
  imageEmoji: {
    fontSize: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3A3A3A',
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: '#4CAF50',
    width: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
  },
  primaryButton: {
    flex: 2,
  },
});


