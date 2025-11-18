import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CallModalProps {
  visible: boolean;
  agentName: string;
  agentEmoji: string;
  callStatus: 'connecting' | 'speaking' | 'connected' | 'ended';
  onEndCall: () => void;
  inputText?: string;
  onInputChange?: (text: string) => void;
  onSend?: () => void;
  speechRecognitionAvailable?: boolean;
}

export const CallModal: React.FC<CallModalProps> = ({
  visible,
  agentName,
  agentEmoji,
  callStatus,
  onEndCall,
  inputText = '',
  onInputChange,
  onSend,
  speechRecognitionAvailable = false,
}) => {
  const insets = useSafeAreaInsets();
  const [pulseAnimation, setPulseAnimation] = React.useState(false);
  const [callDuration, setCallDuration] = React.useState(0);
  const durationIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (callStatus === 'connecting' || callStatus === 'speaking' || callStatus === 'connected') {
      const interval = setInterval(() => {
        setPulseAnimation((prev) => !prev);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callStatus]);

  // Start call timer when connected
  React.useEffect(() => {
    if (callStatus === 'connected' || callStatus === 'speaking') {
      durationIntervalRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      if (callStatus === 'ended') {
        setCallDuration(0);
      }
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [callStatus]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return speechRecognitionAvailable ? 'Connected - Speak or type your message' : 'Connected - Type your message';
      case 'speaking':
        return 'Speaking...';
      default:
        return 'On Call';
    }
  };

  const isActive = callStatus === 'connecting' || callStatus === 'speaking' || callStatus === 'connected';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onEndCall}
    >
      <View style={[styles.overlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.container}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarCircle, isActive && styles.avatarCircleActive]}>
              <Text style={styles.avatarEmoji}>{agentEmoji}</Text>
            </View>
            {isActive && (
              <>
                <View style={[styles.pulseRing, pulseAnimation && styles.pulseRingActive]} />
                <View style={[styles.pulseRing2, !pulseAnimation && styles.pulseRingActive]} />
              </>
            )}
          </View>

          {/* Status Text */}
          <Text style={styles.agentName}>{agentName}</Text>
          <Text style={styles.statusText}>{getStatusText()}</Text>

          {/* Loading Indicator */}
          {callStatus === 'connecting' && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#4CAF50" />
            </View>
          )}

          {/* Call Duration (if connected/speaking) */}
          {(callStatus === 'connected' || callStatus === 'speaking') && (
            <View style={styles.durationContainer}>
              <Text style={styles.durationText}>{formatDuration(callDuration)}</Text>
            </View>
          )}

          {/* Text Input (when connected) */}
          {callStatus === 'connected' && onInputChange && onSend && (
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.inputContainer}
            >
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={onInputChange}
                placeholder="Type your message..."
                placeholderTextColor="#999999"
                multiline
                maxLength={500}
                autoFocus={false}
                returnKeyType="send"
                onSubmitEditing={inputText.trim() ? onSend : undefined}
              />
              <TouchableOpacity
                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                onPress={inputText.trim() ? onSend : undefined}
                disabled={!inputText.trim()}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          )}

          {/* End Call Button */}
          <TouchableOpacity
            style={styles.endCallButton}
            onPress={onEndCall}
            activeOpacity={0.8}
          >
            <Text style={styles.endCallIcon}>📞</Text>
            <Text style={styles.endCallText}>End Call</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#3A3A3A',
  },
  avatarCircleActive: {
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#4CAF50',
    opacity: 0.4,
  },
  pulseRing2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#4CAF50',
    opacity: 0.2,
  },
  pulseRingActive: {
    opacity: 0.8,
    transform: [{ scale: 1.1 }],
  },
  durationContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  durationText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  avatarEmoji: {
    fontSize: 60,
  },
  agentName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 18,
    color: '#CCCCCC',
    marginBottom: 24,
    textAlign: 'center',
  },
  loadingContainer: {
    marginBottom: 32,
  },
  endCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    minWidth: 150,
    gap: 8,
  },
  endCallIcon: {
    fontSize: 20,
  },
  endCallText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
    maxWidth: 400,
    marginBottom: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  sendButtonDisabled: {
    backgroundColor: '#3A3A3A',
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

