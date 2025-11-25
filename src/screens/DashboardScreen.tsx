import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  PanResponder,
  Animated,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../navigation/types';
import type { StackNavigationProp } from '@react-navigation/stack';

type DashboardNavigationProp = StackNavigationProp<RootStackParamList>;

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  route: keyof RootStackParamList;
  params?: any;
}

interface Notification {
  id: string;
  type: 'spam' | 'scam' | 'security' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardNavigationProp>();
  const insets = useSafeAreaInsets();
  const { networkSummary, agents, wifiHeatmap, loadInitialData } = useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const panY = useRef(new Animated.Value(1000)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const isDragging = useRef(false);

  useEffect(() => {
    // Ensure initial data is loaded
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (showNotifications) {
      // Animate in when opening
      panY.setValue(1000);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showNotifications]);

  // Sample notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'spam',
      title: 'Suspicious Network Detected',
      message: 'Potential spam network "Free_WiFi_2024" detected nearby',
      time: '2m ago',
      read: false,
    },
    {
      id: '2',
      type: 'scam',
      title: 'Phishing Attempt Blocked',
      message: 'Blocked connection to known phishing domain',
      time: '15m ago',
      read: false,
    },
    {
      id: '3',
      type: 'security',
      title: 'Network Security Update',
      message: 'Your WiFi security settings have been optimized',
      time: '1h ago',
      read: true,
    },
    {
      id: '4',
      type: 'info',
      title: 'Speed Test Complete',
      message: 'Your network speed test completed successfully',
      time: '2h ago',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'spam':
        return 'shield-outline';
      case 'scam':
        return 'warning-outline';
      case 'security':
        return 'lock-closed-outline';
      default:
        return 'information-circle-outline';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'spam':
        return '255, 152, 0'; // Orange
      case 'scam':
        return '244, 67, 54'; // Red
      case 'security':
        return '76, 175, 80'; // Green
      default:
        return '33, 150, 243'; // Blue
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleCloseNotifications = () => {
    Animated.parallel([
      Animated.timing(panY, {
        toValue: 1000,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowNotifications(false);
      panY.setValue(1000);
      panY.setOffset(0);
      opacity.setValue(0);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to downward swipes with sufficient movement
        // Prioritize vertical movement over horizontal
        const isDownward = gestureState.dy > 8 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy) * 1.5;
        if (isDownward) {
          isDragging.current = true;
          return true;
        }
        return false;
      },
      onPanResponderGrant: () => {
        isDragging.current = true;
        const currentValue = (panY as any)._value || 0;
        panY.setOffset(currentValue);
        panY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward movement
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        isDragging.current = false;
        panY.flattenOffset();
        const shouldClose = gestureState.dy > 120 || (gestureState.vy > 0.4 && gestureState.dy > 50);
        if (shouldClose) {
          // Smooth close animation
          Animated.parallel([
            Animated.timing(panY, {
              toValue: 1000,
              duration: 300,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 250,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]).start(() => {
            setShowNotifications(false);
            panY.setValue(1000);
            panY.setOffset(0);
            opacity.setValue(0);
          });
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 8,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        isDragging.current = false;
        panY.flattenOffset();
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 8,
        }).start();
      },
    })
  ).current;

  const quickActions: QuickAction[] = [
    {
      id: 'wifi-test',
      title: 'WiFi Test',
      description: 'Test network speed',
      icon: '⚡',
      color: '#4CAF50',
      route: 'SpeedTest',
    },
    {
      id: 'ar-scan',
      title: 'AR Scan',
      description: 'Visualize WiFi coverage',
      icon: '📡',
      color: '#2196F3',
      route: 'ARHeatmap',
    },
    {
      id: 'discover-agents',
      title: 'Discover Agents',
      description: 'AI WiFi assistants',
      icon: '🤖',
      color: '#FF9800',
      route: 'Agents',
    },
  ];


  const handleQuickAction = (action: QuickAction) => {
    if (action.route === 'Agents') {
      // Navigate to Agents tab using composite navigation
      navigation.navigate('Main', { screen: 'Agents' });
    } else if (action.params) {
      navigation.navigate(action.route as any, action.params);
    } else {
      navigation.navigate(action.route as any);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Title and Bell Icon */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 16 }]}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>GigabitIQ</Text>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => {
              setShowNotifications(true);
              isDragging.current = false;
              panY.setValue(0);
              panY.setOffset(0);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* App Introduction */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Smart WiFi Management</Text>
          <Text style={styles.introDescription}>
            Test network speeds, scan WiFi coverage with AR heatmaps, chat with AI assistants, 
            and monitor security threats all in one intelligent platform.
          </Text>
        </View>

        {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => {
            const actionColorRgb = action.color === '#FF9800' 
              ? '255, 152, 0' 
              : action.color === '#2196F3' 
              ? '33, 150, 243' 
              : '76, 175, 80';
            
            return (
              <TouchableOpacity
                key={action.id}
                onPress={() => handleQuickAction(action)}
                activeOpacity={0.8}
                style={styles.quickActionCardWrapper}
              >
                <LinearGradient
                  colors={[
                    `rgba(${actionColorRgb}, 0.15)`,
                    `rgba(${actionColorRgb}, 0.08)`,
                    'rgba(255, 255, 255, 0.9)',
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quickActionCardGradient}
                >
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 0.5 }}
                    style={styles.glassShine}
                  />
                  <View style={styles.quickActionCard}>
                    <View style={styles.quickActionContent}>
                      <Text style={styles.quickActionIcon}>{action.icon}</Text>
                      <View style={styles.quickActionTextContainer}>
                        <Text style={styles.quickActionTitle} numberOfLines={1}>{action.title}</Text>
                        <Text style={styles.quickActionDescription} numberOfLines={1}>{action.description}</Text>
                      </View>
                      <Text style={[styles.quickActionArrowText, { color: action.color }]}>→</Text>
                    </View>
          </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
              </View>
            </View>
      </View>

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={handleCloseNotifications}
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            { opacity }
          ]}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleCloseNotifications}
          />
          <Animated.View
            style={[
              styles.notificationsContainer,
              { 
                paddingTop: insets.top + 20,
                transform: [{ translateY: panY }],
              }
            ]}
            {...panResponder.panHandlers}
          >
            <LinearGradient
              colors={[
                'rgba(255, 255, 255, 0.98)',
                'rgba(255, 255, 255, 0.95)',
              ]}
              style={styles.notificationsGradient}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 0.3 }}
                style={styles.glassShine}
              >
              </LinearGradient>
              {/* Swipe indicator */}
              <View style={styles.swipeIndicator} />
              <View style={styles.notificationsContent}>
                <View style={styles.notificationsHeader}>
                  <Text style={styles.notificationsTitle}>Notifications</Text>
                </View>

                <FlatList
                  scrollEnabled={!isDragging.current}
                  nestedScrollEnabled={true}
                  data={notifications}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    const colorRgb = getNotificationColor(item.type);
                    return (
                      <TouchableOpacity
                        style={[
                          styles.notificationItem,
                          !item.read && styles.notificationItemUnread
                        ]}
                        onPress={() => markAsRead(item.id)}
                        activeOpacity={0.7}
                      >
                        <LinearGradient
                          colors={[
                            `rgba(${colorRgb}, 0.15)`,
                            `rgba(${colorRgb}, 0.08)`,
                            'rgba(255, 255, 255, 0.9)',
                          ]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.notificationItemGradient}
                        >
                          <View style={styles.notificationItemContent}>
                            <View style={[styles.notificationIconContainer, { backgroundColor: `rgba(${colorRgb}, 0.2)` }]}>
                              <Ionicons 
                                name={getNotificationIcon(item.type) as any} 
                                size={20} 
                                color={`rgb(${colorRgb})`} 
                              />
                            </View>
                            <View style={styles.notificationTextContainer}>
                              <Text style={styles.notificationItemTitle}>{item.title}</Text>
                              <Text style={styles.notificationItemMessage}>{item.message}</Text>
                              <Text style={styles.notificationItemTime}>{item.time}</Text>
                            </View>
                            {!item.read && (
                              <View style={[styles.unreadDot, { backgroundColor: `rgb(${colorRgb})` }]} />
                            )}
              </View>
                        </LinearGradient>
                      </TouchableOpacity>
                    );
                  }}
                  contentContainerStyle={styles.notificationsList}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </LinearGradient>
          </Animated.View>
        </Animated.View>
      </Modal>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 0,
  },
  introSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  introDescription: {
    fontSize: 17,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 340,
    fontWeight: '500',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    position: 'absolute',
    right: 0,
  },
  glassShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    zIndex: 2,
  },
  quickActionsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  quickActionsGrid: {
    gap: 12,
  },
  quickActionCardWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionCardGradient: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  quickActionCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 0,
    position: 'relative',
    zIndex: 1,
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickActionIcon: {
    fontSize: 20,
  },
  quickActionTextContainer: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  quickActionDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  quickActionArrowText: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  notificationsContainer: {
    flex: 1,
    marginTop: 60,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 20,
  },
  swipeIndicator: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  notificationsGradient: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    position: 'relative',
    overflow: 'hidden',
  },
  notificationsContent: {
    flex: 1,
    padding: 20,
  },
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  notificationsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  notificationsList: {
    gap: 12,
  },
  notificationItem: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  notificationItemUnread: {
    opacity: 1,
  },
  notificationItemGradient: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  notificationItemContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    gap: 12,
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  notificationItemMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
    lineHeight: 18,
  },
  notificationItemTime: {
    fontSize: 11,
    color: colors.textSecondary,
    opacity: 0.7,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
});


