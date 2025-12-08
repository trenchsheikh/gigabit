import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';
import { HousePlan } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'FloorPlanManualInput'>;
type RouteProps = RouteProp<RootStackParamList, 'FloorPlanManualInput'>;

const COMMON_ROOMS = [
    'Living Room',
    'Kitchen',
    'Dining Room',
    'Conservatory',
    'Garage',
    'Study/Office',
    'Utility Room',
];

export const FloorPlanManualInputScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();
    const { addHousePlan, updateHousePlan, selectHousePlan, userPostcode, setUserPostcode, setUserAddress } = useAppStore();
    const [loading, setLoading] = useState(false);
    const initialPlan = route.params?.initialPlan;
    const addressParam = route.params?.address;
    const handleUpload = async () => {
        setLoading(true);
        // Simulate processing an uploaded image
        setTimeout(async () => {
            const newPlan: HousePlan = {
                applicationId: `MANUAL-UPLOAD-${Date.now()}`,
                addressLabel: userPostcode || 'My Home',
                floors: 1,
                rooms: [
                    { id: 'r1', name: 'Living Room', floor: 0, estimatedAreaM2: 20 },
                    { id: 'r2', name: 'Kitchen', floor: 0, estimatedAreaM2: 15 },
                    { id: 'r3', name: 'Bedroom', floor: 0, estimatedAreaM2: 12 },
                ],
                createdAt: new Date().toISOString(),
            };
            await finishPlan(newPlan);
        }, 1500);
    };

    const finishPlan = async (plan: HousePlan) => {
        if (initialPlan) {
            await updateHousePlan(plan);
        } else {
            await addHousePlan(plan);

            // If we have an address param (meaning we came from search), save it to profile
            if (addressParam) {
                const parts = addressParam.split(',');
                const postcode = parts[parts.length - 1]?.trim() || '';
                const streetPart = parts[0]?.trim() || '';

                const numberMatch = streetPart.match(/^(\d+)/);
                const houseNumber = numberMatch ? numberMatch[1] : '';
                const street = streetPart.replace(/^(\d+)/, '').trim();

                if (postcode) {
                    // We could fetch postcode data here too, but for now just save minimal
                    await setUserPostcode(postcode, {
                        postcode,
                        quality: 1,
                        country: 'United Kingdom',
                    } as any);
                }

                await setUserAddress({
                    houseNumber,
                    street,
                    postcode,
                    fullAddress: addressParam,
                });
            }
        }
        selectHousePlan(plan);
        setLoading(false);
        Alert.alert(
            'Success',
            initialPlan ? 'Floor plan updated successfully!' : 'Floor plan added successfully!',
            [
                {
                    text: 'Continue',
                    onPress: () => {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Main', params: { screen: 'Plans' } }],
                        });
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Add Your Floor Plan</Text>
                    <Text style={styles.subtitle}>
                        Choose how you want to add your floor plan details.
                    </Text>
                </View>

                <Card style={styles.optionCard} onPress={handleUpload}>
                    <Text style={styles.optionIcon}>📸</Text>
                    <Text style={styles.optionTitle}>Upload Image</Text>
                    <Text style={styles.optionDescription}>
                        Take a photo or upload an existing image of your floor plan.
                    </Text>
                    <Button
                        title="Upload Floor Plan"
                        onPress={handleUpload}
                        loading={loading}
                        style={styles.button}
                    />
                </Card>

                <View style={styles.divider}>
                    <View style={styles.line} />
                    <Text style={styles.orText}>OR</Text>
                    <View style={styles.line} />
                </View>

                <Card style={styles.optionCard} onPress={() => navigation.navigate('FloorPlanCreator', { initialPlan })}>
                    <Text style={styles.optionIcon}>✨</Text>
                    <Text style={styles.optionTitle}>Visual Creator</Text>
                    <Text style={styles.optionDescription}>
                        Drag and drop rooms and devices to map your home.
                    </Text>
                    <Button
                        title="Open Visual Creator"
                        onPress={() => navigation.navigate('FloorPlanCreator', { initialPlan, address: addressParam })}
                        variant="secondary"
                        style={styles.button}
                    />
                </Card>
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
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    optionCard: {
        alignItems: 'center',
        padding: 24,
        marginBottom: 0,
    },
    optionIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    optionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    optionDescription: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    button: {
        width: '100%',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    orText: {
        marginHorizontal: 16,
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
});
