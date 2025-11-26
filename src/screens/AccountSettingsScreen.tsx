import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../navigation/types';
import type { StackNavigationProp } from '@react-navigation/stack';

type AccountSettingsNavigationProp = StackNavigationProp<RootStackParamList, 'AccountSettings'>;

export const AccountSettingsScreen: React.FC = () => {
  const navigation = useNavigation<AccountSettingsNavigationProp>();
  const insets = useSafeAreaInsets();
  const { userSettings, userPostcode, userAddress, postcodeData, updateUserSettings, signOut } = useAppStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    userSettings.notificationsEnabled ?? true
  );
  const [analyticsEnabled, setAnalyticsEnabled] = useState(
    userSettings.analyticsEnabled ?? true
  );

  const handleToggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    await updateUserSettings({ notificationsEnabled: value });
  };

  const handleToggleAnalytics = async (value: boolean) => {
    setAnalyticsEnabled(value);
    await updateUserSettings({ analyticsEnabled: value });
  };

  const handleDisableAccount = () => {
    Alert.alert(
      'Disable Account',
      'Are you sure you want to disable your account? You can re-enable it later by signing in again.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: async () => {
            await updateUserSettings({ accountDisabled: true });
            await signOut();
            navigation.replace('SignIn');
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            navigation.replace('SignIn');
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top, 20) + 16 }
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Account Settings</Text>
      </View>

      {/* Account Info */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Username</Text>
          <Text style={styles.infoValue}>admin</Text>
        </View>
        {userAddress ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={[styles.infoValue, { maxWidth: '60%', textAlign: 'right' }]} numberOfLines={2}>
              {userAddress.fullAddress}
            </Text>
          </View>
        ) : userPostcode && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Postcode</Text>
            <Text style={styles.infoValue}>{userPostcode}</Text>
          </View>
        )}
        {postcodeData?.parish && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>
              {postcodeData.parish}
              {postcodeData.admin_district && `, ${postcodeData.admin_district}`}
            </Text>
          </View>
        )}
      </Card>

      {/* Settings */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive push notifications about WiFi insights
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: '#3A3A3A', true: '#4CAF50' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#3A3A3A"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Analytics</Text>
            <Text style={styles.settingDescription}>
              Help improve the app by sharing usage data
            </Text>
          </View>
          <Switch
            value={analyticsEnabled}
            onValueChange={handleToggleAnalytics}
            trackColor={{ false: '#3A3A3A', true: '#4CAF50' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#3A3A3A"
          />
        </View>
      </Card>

      {/* Actions */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Actions</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('AddressEntry')}
        >
          <Text style={styles.actionButtonText}>Update Address</Text>
          <Text style={styles.actionButtonIcon}>→</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={[styles.actionButton, styles.dangerButton]}
          onPress={handleDisableAccount}
        >
          <Text style={[styles.actionButtonText, styles.dangerText]}>
            Disable Account
          </Text>
        </TouchableOpacity>
      </Card>

      {/* Sign Out */}
      <View style={styles.signOutContainer}>
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
          style={styles.signOutButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  card: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accentBlue,
  },
  actionButtonIcon: {
    fontSize: 18,
    color: colors.accentBlue,
  },
  dangerButton: {
    paddingVertical: 12,
  },
  dangerText: {
    color: '#FF4444',
  },
  signOutContainer: {
    marginTop: 20,
  },
  signOutButton: {
    width: '100%',
  },
});

