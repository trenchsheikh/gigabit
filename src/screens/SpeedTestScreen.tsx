import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const SpeedTestScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.webviewContainer, { paddingTop: insets.top }]}>
        <WebView
          source={{ uri: 'https://gigabitiq.speedtestcustom.com/' }}
          style={styles.webview}
          containerStyle={styles.webviewContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  webviewContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  webviewContent: {
    flex: 1,
    marginTop: -80, // Reverted to previous crop
    backgroundColor: 'transparent',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

