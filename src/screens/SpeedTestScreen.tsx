import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { ErrorView } from '../components/ErrorView';
import { LoadingSpinner } from '../components/LoadingSpinner';

const SPEED_TEST_URL = 'https://gigabitiq.speedtestcustom.com/';

export const SpeedTestScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLoadStart = () => {
    setLoading(true);
    setError(null);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    setError(nativeEvent.description || 'Failed to load speed test');
    setLoading(false);
  };

  const handleReload = () => {
    setError(null);
    setLoading(true);
  };

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorView message={error} onRetry={handleReload} retryLabel="Reload" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <LoadingSpinner message="Loading speed test..." />
        </View>
      )}
      <WebView
        source={{ uri: SPEED_TEST_URL }}
        style={styles.webview}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        bounces={false}
        overScrollMode="never"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1A1A1A',
    zIndex: 1,
  },
});


