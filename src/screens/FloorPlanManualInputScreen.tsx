import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';
import { HousePlan, RoomZone, ConstructionDetails } from '../types';
import { Ionicons } from '@expo/vector-icons';

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
    const [mode, setMode] = useState<'select' | 'form'>(initialPlan ? 'form' : 'select');

    // Form State
    const [floors, setFloors] = useState(initialPlan?.floors || 1);
    const [bedrooms, setBedrooms] = useState(() => {
        if (!initialPlan) return 1;
        return initialPlan.rooms.filter((r: any) => r.name.startsWith('Bedroom')).length || 1;
    });
    const [bathrooms, setBathrooms] = useState(() => {
        if (!initialPlan) return 1;
        return initialPlan.rooms.filter((r: any) => r.name.startsWith('Bathroom')).length || 1;
    });
    const [selectedRooms, setSelectedRooms] = useState<string[]>(() => {
        if (!initialPlan) return ['Living Room', 'Kitchen'];
        return initialPlan.rooms
            .filter((r: any) => !r.name.startsWith('Bedroom') && !r.name.startsWith('Bathroom'))
            .map((r: any) => r.name);
    });

    // Construction Details State
    const [externalWall, setExternalWall] = useState<ConstructionDetails['externalWallMaterial']>(
        initialPlan?.constructionDetails?.externalWallMaterial || 'brick'
    );
    const [internalWall, setInternalWall] = useState<ConstructionDetails['internalWallMaterial']>(
        initialPlan?.constructionDetails?.internalWallMaterial || 'drywall'
    );
    const [floorMaterial, setFloorMaterial] = useState<ConstructionDetails['floorMaterial']>(
        initialPlan?.constructionDetails?.floorMaterial || 'wood'
    );

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

    const handleManualSubmit = async () => {
        setLoading(true);

        // Construct rooms based on input
        const rooms: RoomZone[] = [];
        let roomIdCounter = 1;

        // Add selected common rooms (assume floor 0 for simplicity in MVP)
        selectedRooms.forEach(roomName => {
            rooms.push({
                id: `r${roomIdCounter++}`,
                name: roomName,
                floor: 0,
                estimatedAreaM2: 15, // Default estimate
            });
        });

        // Add bedrooms (assume floor 1 if > 1 floor, else 0)
        for (let i = 1; i <= bedrooms; i++) {
            rooms.push({
                id: `r${roomIdCounter++}`,
                name: `Bedroom ${i}`,
                floor: floors > 1 ? 1 : 0,
                estimatedAreaM2: 12,
            });
        }

        // Add bathrooms
        for (let i = 1; i <= bathrooms; i++) {
            rooms.push({
                id: `r${roomIdCounter++}`,
                name: `Bathroom ${i}`,
                floor: floors > 1 ? 1 : 0,
                estimatedAreaM2: 6,
            });
        }

        const newPlan: HousePlan = {
            applicationId: initialPlan?.applicationId || `MANUAL-FORM-${Date.now()}`,
            addressLabel: initialPlan?.addressLabel || addressParam || userPostcode || 'My Home',
            floors: floors,
            rooms: rooms,
            constructionDetails: {
                externalWallMaterial: externalWall,
                internalWallMaterial: internalWall,
                floorMaterial: floorMaterial,
            },
            createdAt: initialPlan?.createdAt || new Date().toISOString(),
        };

        // Simulate small delay for "processing"
        setTimeout(async () => {
            await finishPlan(newPlan);
        }, 1000);
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

    const toggleRoom = (room: string) => {
        if (selectedRooms.includes(room)) {
            setSelectedRooms(selectedRooms.filter(r => r !== room));
        } else {
            setSelectedRooms([...selectedRooms, room]);
        }
    };

    const Counter = ({ label, value, onChange, min = 1, max = 10 }: any) => (
        <View style={styles.counterRow}>
            <Text style={styles.counterLabel}>{label}</Text>
            <View style={styles.counterControls}>
                <TouchableOpacity
                    style={[styles.counterBtn, value <= min && styles.counterBtnDisabled]}
                    onPress={() => value > min && onChange(value - 1)}
                    disabled={value <= min}
                >
                    <Ionicons name="remove" size={20} color={value <= min ? colors.textSecondary : colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{value}</Text>
                <TouchableOpacity
                    style={[styles.counterBtn, value >= max && styles.counterBtnDisabled]}
                    onPress={() => value < max && onChange(value + 1)}
                    disabled={value >= max}
                >
                    <Ionicons name="add" size={20} color={value >= max ? colors.textSecondary : colors.textPrimary} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const Selector = ({ label, value, options, onChange }: any) => (
        <View style={styles.selectorContainer}>
            <Text style={styles.selectorLabel}>{label}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorScroll}>
                {options.map((opt: any) => (
                    <TouchableOpacity
                        key={opt.value}
                        style={[
                            styles.selectorChip,
                            value === opt.value && styles.selectorChipSelected,
                        ]}
                        onPress={() => onChange(opt.value)}
                    >
                        <Text
                            style={[
                                styles.selectorChipText,
                                value === opt.value && styles.selectorChipTextSelected,
                            ]}
                        >
                            {opt.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    if (mode === 'select') {
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

                    <Card style={styles.optionCard} onPress={() => setMode('form')}>
                        <Text style={styles.optionIcon}>📝</Text>
                        <Text style={styles.optionTitle}>Fill Out Form</Text>
                        <Text style={styles.optionDescription}>
                            Answer a few questions about your home layout.
                        </Text>
                        <Button
                            title="Start Manual Entry"
                            onPress={() => setMode('form')}
                            variant="outline"
                            style={styles.button}
                        />
                    </Card>
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => {
                        if (initialPlan) {
                            navigation.goBack();
                        } else {
                            setMode('select');
                        }
                    }} style={styles.backLink}>
                        <Ionicons name="arrow-back" size={20} color={colors.accentBlue} />
                        <Text style={styles.backLinkText}>Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>{initialPlan ? 'Edit House Details' : 'House Details'}</Text>
                    <Text style={styles.subtitle}>
                        Tell us about your home structure.
                    </Text>
                </View>

                <Card style={styles.formCard}>
                    <Counter label="Number of Floors" value={floors} onChange={setFloors} max={5} />
                    <View style={styles.separator} />
                    <Counter label="Bedrooms" value={bedrooms} onChange={setBedrooms} />
                    <View style={styles.separator} />
                    <Counter label="Bathrooms" value={bathrooms} onChange={setBathrooms} />
                </Card>

                <Text style={styles.sectionTitle}>Construction Details</Text>
                <Card style={styles.formCard}>
                    <Selector
                        label="External Walls"
                        value={externalWall}
                        onChange={setExternalWall}
                        options={[
                            { label: 'Brick', value: 'brick' },
                            { label: 'Stone', value: 'stone' },
                            { label: 'Concrete', value: 'concrete' },
                            { label: 'Timber', value: 'timber_frame' },
                        ]}
                    />
                    <View style={styles.separator} />
                    <Selector
                        label="Internal Walls"
                        value={internalWall}
                        onChange={setInternalWall}
                        options={[
                            { label: 'Drywall', value: 'drywall' },
                            { label: 'Solid Brick', value: 'solid_brick' },
                            { label: 'Concrete', value: 'concrete' },
                        ]}
                    />
                    <View style={styles.separator} />
                    <Selector
                        label="Flooring"
                        value={floorMaterial}
                        onChange={setFloorMaterial}
                        options={[
                            { label: 'Wood', value: 'wood' },
                            { label: 'Concrete', value: 'concrete' },
                            { label: 'Tile', value: 'tile' },
                            { label: 'Carpet', value: 'carpet' },
                        ]}
                    />
                </Card>

                <Text style={styles.sectionTitle}>Other Rooms</Text>
                <Card style={styles.roomsCard}>
                    <View style={styles.roomsGrid}>
                        {COMMON_ROOMS.map((room) => (
                            <TouchableOpacity
                                key={room}
                                style={[
                                    styles.roomChip,
                                    selectedRooms.includes(room) && styles.roomChipSelected,
                                ]}
                                onPress={() => toggleRoom(room)}
                            >
                                <Text
                                    style={[
                                        styles.roomChipText,
                                        selectedRooms.includes(room) && styles.roomChipTextSelected,
                                    ]}
                                >
                                    {room}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Card>

                <Button
                    title={initialPlan ? "Update Floor Plan" : "Create Floor Plan"}
                    onPress={handleManualSubmit}
                    loading={loading}
                    style={styles.submitButton}
                />
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
    backLink: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    backLinkText: {
        color: colors.accentBlue,
        fontSize: 16,
        marginLeft: 4,
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
    formCard: {
        padding: 0,
        marginBottom: 24,
    },
    counterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    counterLabel: {
        fontSize: 16,
        color: colors.textPrimary,
        fontWeight: '500',
    },
    counterControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    counterBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    counterBtnDisabled: {
        opacity: 0.5,
        backgroundColor: colors.background,
    },
    counterValue: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textPrimary,
        minWidth: 20,
        textAlign: 'center',
    },
    separator: {
        height: 1,
        backgroundColor: colors.border,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 12,
    },
    roomsCard: {
        padding: 16,
        marginBottom: 24,
    },
    roomsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    roomChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.backgroundSecondary,
        borderWidth: 1,
        borderColor: colors.border,
    },
    roomChipSelected: {
        backgroundColor: colors.accentBlue + '20', // 20% opacity
        borderColor: colors.accentBlue,
    },
    roomChipText: {
        fontSize: 14,
        color: colors.textPrimary,
    },
    roomChipTextSelected: {
        color: colors.accentBlue,
        fontWeight: '600',
    },
    submitButton: {
        marginBottom: 40,
    },
    selectorContainer: {
        padding: 16,
    },
    selectorLabel: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 12,
        fontWeight: '500',
    },
    selectorScroll: {
        gap: 8,
    },
    selectorChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.backgroundSecondary,
        borderWidth: 1,
        borderColor: colors.border,
    },
    selectorChipSelected: {
        backgroundColor: colors.accentBlue,
        borderColor: colors.accentBlue,
    },
    selectorChipText: {
        fontSize: 14,
        color: colors.textPrimary,
    },
    selectorChipTextSelected: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});
