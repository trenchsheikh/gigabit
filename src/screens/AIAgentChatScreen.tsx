import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';

// Safe import of speech recognition - handle case where native module isn't available
let SpeechRecognition: any = null;
try {
  const speechRecognitionModule = require('expo-speech-recognition');
  // Check if the module is actually available (not just the JS wrapper)
  if (speechRecognitionModule && typeof speechRecognitionModule.getPermissionsAsync === 'function') {
    SpeechRecognition = speechRecognitionModule;
  }
} catch (error) {
  console.warn('Speech recognition module not available:', error);
}
import { openAIService, OpenAIError } from '../services/openai';
import { elevenLabsService } from '../services/elevenlabs';
import { CallModal } from '../components/CallModal';
import type { RootStackParamList } from '../navigation/types';
import type { RouteProp } from '@react-navigation/native';

type ChatRouteProp = RouteProp<RootStackParamList, 'AIAgentChat'>;

export const AIAgentChatScreen: React.FC = () => {
  const route = useRoute<ChatRouteProp>();
  const { agentId } = route.params;
  const { agents, chatMessages, addChatMessage, loadChatMessages } = useAppStore();
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(false);
  const [callingAI, setCallingAI] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechPermission, setSpeechPermission] = useState<'granted' | 'denied' | 'undetermined' | null>(null);
  const [callStatus, setCallStatus] = useState<'connecting' | 'speaking' | 'connected' | 'ended'>('ended');
  const [speechRecognitionAvailable, setSpeechRecognitionAvailable] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const agent = agents.find((a) => a.id === agentId);
  const messages = chatMessages[agentId] || [];

  useEffect(() => {
    if (agent) {
      loadChatMessages(agentId);
    }
    
    // Check speech recognition permissions if available
    if (SpeechRecognition) {
      setSpeechRecognitionAvailable(true);
      SpeechRecognition.getPermissionsAsync()
        .then((status: any) => {
          setSpeechPermission(status.status);
        })
        .catch((error: any) => {
          console.warn('Failed to get speech recognition permissions:', error);
          setSpeechRecognitionAvailable(false);
        });
    } else {
      setSpeechRecognitionAvailable(false);
    }
  }, [agentId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Scroll to end when keyboard appears
  useEffect(() => {
    const keyboardWillShow = () => {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    };

    if (Platform.OS === 'ios') {
      const showSubscription = Keyboard.addListener('keyboardWillShow', keyboardWillShow);
      return () => {
        showSubscription.remove();
      };
    } else {
      const showSubscription = Keyboard.addListener('keyboardDidShow', keyboardWillShow);
      return () => {
        showSubscription.remove();
      };
    }
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || !agent || loading) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      agentId,
      role: 'user' as const,
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    await addChatMessage(userMessage);
    setInputText('');
    setLoading(true);

    try {
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await openAIService.chatCompletion(agent, [
        ...conversationHistory,
        { role: 'user', content: userMessage.content },
      ]);

      const assistantMessage = {
        id: `msg-${Date.now() + 1}`,
        agentId,
        role: 'assistant' as const,
        content: response,
        timestamp: new Date().toISOString(),
      };

      await addChatMessage(assistantMessage);
      
      // If call is active, play the AI response
      if (showCallModal && callStatus !== 'ended') {
        await handlePlayAudio(assistantMessage.id, response);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof OpenAIError
        ? error.message
        : 'Failed to get response. Please try again.';

      // Only show error if it's not a mock response (which works fine)
      if (!errorMessage.includes('mock')) {
        const errorMsg = {
          id: `msg-error-${Date.now()}`,
          agentId,
          role: 'assistant' as const,
          content: `I apologize, but I'm having trouble connecting right now. ${errorMessage.includes('API key') ? 'Please check your API configuration.' : 'Please try again in a moment.'}`,
          timestamp: new Date().toISOString(),
        };
        await addChatMessage(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAudio = async (messageId: string, content: string) => {
    if (playingAudio) {
      await elevenLabsService.stopAudio();
      setPlayingAudio(false);
      setShowCallModal(false);
      setCallStatus('ended');
      return;
    }

    try {
      setPlayingAudio(true);
      setShowCallModal(true);
      setCallStatus('connecting');
      
      const audioUri = await elevenLabsService.synthesizeSpeech(content);
      
      // If audio URI is empty (no API key), simulate call experience
      if (!audioUri) {
        setCallStatus('connected');
        // Simulate speaking for a few seconds - keep modal open
        setTimeout(() => {
          setCallStatus('speaking');
          // After "speaking", keep call open and wait for user
          setTimeout(() => {
            setPlayingAudio(false);
            setCallStatus('connected');
            // Optionally start listening for user speech if available
            if (speechRecognitionAvailable && speechPermission === 'granted') {
              setTimeout(() => {
                handleStartListening();
              }, 500);
            }
          }, 2000);
        }, 1000);
        return;
      }
      
      setCallStatus('connected');
      
      // Play audio with status updates - modal stays open during entire playback
      await elevenLabsService.playAudio(audioUri, (status) => {
        if (status.isLoaded) {
          if (status.isPlaying) {
            setCallStatus('speaking');
          }
          // When audio finishes, keep call open and wait for user response
          if (status.didJustFinish) {
            setPlayingAudio(false);
            // Change to connected status so user can respond - don't close the call
            setCallStatus('connected');
            // Optionally start listening for user speech if available
            if (speechRecognitionAvailable && speechPermission === 'granted') {
              // Auto-start listening after AI finishes speaking
              setTimeout(() => {
                handleStartListening();
              }, 500);
            }
          }
        }
      });
    } catch (error) {
      setPlayingAudio(false);
      setShowCallModal(false);
      setCallStatus('ended');
      console.error('TTS error:', error);
      // Don't show error alert - just silently fail (chat still works)
    }
  };

  const handleCallAI = async () => {
    if (!agent || callingAI || playingAudio) return;

    // Get the last assistant message or generate a greeting
    const lastAssistantMessage = [...messages].reverse().find(msg => msg.role === 'assistant');
    
    if (lastAssistantMessage) {
      // Play the last assistant message
      await handlePlayAudio(lastAssistantMessage.id, lastAssistantMessage.content);
    } else {
      // Generate a greeting and play it
      try {
        setCallingAI(true);
        setShowCallModal(true);
        setCallStatus('connecting');
        
        let greeting: string;
        try {
          // Try to get real response from API - super short intro to get user talking
          greeting = await openAIService.chatCompletion(agent, [
            { role: 'user', content: 'Say a very brief 5-10 word greeting to start the conversation. Keep it short and friendly.' },
          ]);
        } catch (apiError) {
          // If API fails (invalid key, network error, etc.), use mock response
          console.warn('API call failed, using mock response:', apiError);
          greeting = openAIService.getMockResponse(agent, [
            { role: 'user', content: 'Say a very brief 5-10 word greeting to start the conversation. Keep it short and friendly.' },
          ]);
        }
        
        const greetingMessage = {
          id: `msg-${Date.now()}`,
          agentId,
          role: 'assistant' as const,
          content: greeting,
          timestamp: new Date().toISOString(),
        };
        
        await addChatMessage(greetingMessage);
        setCallingAI(false);
        await handlePlayAudio(greetingMessage.id, greeting);
      } catch (error) {
        console.error('Call AI error:', error);
        setCallingAI(false);
        setShowCallModal(false);
        setCallStatus('ended');
        // Fallback to mock greeting if everything fails
        try {
          const mockGreeting = openAIService.getMockResponse(agent, [
            { role: 'user', content: 'Say a very brief 5-10 word greeting to start the conversation. Keep it short and friendly.' },
          ]);
          const greetingMessage = {
            id: `msg-${Date.now()}`,
            agentId,
            role: 'assistant' as const,
            content: mockGreeting,
            timestamp: new Date().toISOString(),
          };
          await addChatMessage(greetingMessage);
          await handlePlayAudio(greetingMessage.id, mockGreeting);
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      }
    }
  };

  const handleEndCall = async () => {
    await elevenLabsService.stopAudio();
    setPlayingAudio(false);
    setCallingAI(false);
    setShowCallModal(false);
    setCallStatus('ended');
  };

  const getAgentEmoji = () => {
    if (!agent) return '🤖';
    if (agent.id === 'familyguardian-ai') return '🛡️';
    if (agent.id === 'cyberguardian-ai') return '🔒';
    if (agent.id === 'wifi-expert-ai') return '📶';
    return '🤖';
  };

  const handleStartListening = async () => {
    if (!SpeechRecognition || !speechRecognitionAvailable) {
      alert('Speech recognition is not available on this device.');
      return;
    }

    try {
      // Request permission if not granted
      if (speechPermission !== 'granted') {
        const { status } = await SpeechRecognition.requestPermissionsAsync();
        setSpeechPermission(status);
        if (status !== 'granted') {
          alert('Microphone permission is required to use speech recognition.');
          return;
        }
      }

      setIsListening(true);
      await SpeechRecognition.startAsync({
        language: 'en-US',
        onResult: (result: any) => {
          if (result.transcript) {
            setInputText(result.transcript);
          }
          if (result.isFinal && result.transcript.trim()) {
            setIsListening(false);
            const transcript = result.transcript.trim();
            setInputText(transcript);
            
            // If call is active, auto-send the message and continue conversation
            if (showCallModal && callStatus !== 'ended') {
              // Create user message and send it
              const userMessage = {
                id: `msg-${Date.now()}`,
                agentId,
                role: 'user' as const,
                content: transcript,
                timestamp: new Date().toISOString(),
              };
              
              addChatMessage(userMessage).then(() => {
                setInputText('');
                setLoading(true);
                
                // Get AI response
                const conversationHistory = [...messages, userMessage].map((msg) => ({
                  role: msg.role,
                  content: msg.content,
                }));
                
                openAIService.chatCompletion(agent!, conversationHistory)
                  .then((response) => {
                    const assistantMessage = {
                      id: `msg-${Date.now() + 1}`,
                      agentId,
                      role: 'assistant' as const,
                      content: response,
                      timestamp: new Date().toISOString(),
                    };
                    return addChatMessage(assistantMessage).then(() => {
                      // Play the AI response
                      return handlePlayAudio(assistantMessage.id, response);
                    });
                  })
                  .catch((error) => {
                    console.error('Chat error during call:', error);
                  })
                  .finally(() => {
                    setLoading(false);
                  });
              });
            }
          } else if (result.isFinal) {
            setIsListening(false);
          }
        },
        onError: (error: any) => {
          console.error('Speech recognition error:', error);
          setIsListening(false);
          alert('Speech recognition failed. Please try again.');
        },
      });
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsListening(false);
      alert('Failed to start speech recognition. Please try again.');
    }
  };

  const handleStopListening = async () => {
    if (!SpeechRecognition || !speechRecognitionAvailable) {
      setIsListening(false);
      return;
    }

    try {
      await SpeechRecognition.stopAsync();
      setIsListening(false);
    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
      setIsListening(false);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isUser = item.role === 'user';
    const isAssistant = item.role === 'assistant';

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.assistantMessage,
        ]}
      >
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>
          {item.content}
        </Text>
        {isAssistant && (
          <TouchableOpacity
            style={styles.audioButton}
            onPress={() => handlePlayAudio(item.id, item.content)}
            disabled={playingAudio}
            activeOpacity={0.7}
          >
            <Text style={styles.audioIcon}>
              {playingAudio ? '⏸️' : '🔊'}
            </Text>
          </TouchableOpacity>
        )}
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  if (!agent) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Assistant not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.messagesList,
          { paddingTop: Math.max(insets.top, 20) + 8 },
          messages.length === 0 && styles.emptyMessagesList
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.welcomeContainer}>
            <View style={styles.welcomeAvatar}>
              <Text style={styles.welcomeAvatarEmoji}>
                {agent.id === 'familyguardian-ai' ? '🛡️' : 
                 agent.id === 'cyberguardian-ai' ? '🔒' : 
                 agent.id === 'wifi-expert-ai' ? '📶' : '🤖'}
              </Text>
            </View>
            <Text style={styles.welcomeTitle}>Welcome to {agent.name.replace(' AI', '')}</Text>
            <Text style={styles.welcomeDescription}>
              {agent.id === 'familyguardian-ai' 
                ? 'I\'m here to help keep your family safe online. Ask me about parental controls, privacy settings, or any online safety concerns.'
                : agent.id === 'cyberguardian-ai'
                ? 'I\'m your cybersecurity expert. I can help you identify threats, secure your devices, and protect your digital life. What would you like to know?'
                : agent.id === 'wifi-expert-ai'
                ? 'I\'m your WiFi optimization specialist. I can help you improve your network performance, troubleshoot issues, or analyze speed test results. How can I help?'
                : 'I\'m here to help! Ask me anything and I\'ll do my best to assist you.'}
            </Text>
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Try asking:</Text>
              {agent.id === 'familyguardian-ai' ? (
                <>
                  <Text style={styles.suggestion}>• "How do I set up parental controls?"</Text>
                  <Text style={styles.suggestion}>• "What privacy settings should I enable?"</Text>
                  <Text style={styles.suggestion}>• "How can I keep my kids safe online?"</Text>
                </>
              ) : agent.id === 'cyberguardian-ai' ? (
                <>
                  <Text style={styles.suggestion}>• "How do I protect against phishing?"</Text>
                  <Text style={styles.suggestion}>• "What are the best password practices?"</Text>
                  <Text style={styles.suggestion}>• "How can I secure my home network?"</Text>
                </>
              ) : agent.id === 'wifi-expert-ai' ? (
                <>
                  <Text style={styles.suggestion}>• "How can I improve my WiFi speed?"</Text>
                  <Text style={styles.suggestion}>• "Where should I place my router?"</Text>
                  <Text style={styles.suggestion}>• "Help me troubleshoot connection issues"</Text>
                </>
              ) : (
                <>
                  <Text style={styles.suggestion}>• "How can you help me?"</Text>
                  <Text style={styles.suggestion}>• "What can you do?"</Text>
                </>
              )}
            </View>
          </View>
        }
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4CAF50" />
          <Text style={styles.loadingText}>AI is thinking...</Text>
        </View>
      )}

      <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={[styles.callButton, (callingAI || loading || playingAudio) && styles.callButtonDisabled]}
          onPress={handleCallAI}
          disabled={callingAI || loading || playingAudio}
        >
          <Text style={styles.callButtonIcon}>{callingAI || playingAudio ? '📞' : '📞'}</Text>
          <Text style={styles.callButtonText}>
            {callingAI ? 'Calling...' : playingAudio ? 'Speaking...' : 'Call'}
          </Text>
        </TouchableOpacity>
        {speechRecognitionAvailable && (
          <TouchableOpacity
            style={[styles.micButton, isListening && styles.micButtonActive]}
            onPress={isListening ? handleStopListening : handleStartListening}
            disabled={loading || callingAI}
          >
            <Text style={styles.micButtonIcon}>{isListening ? '🛑' : '🎤'}</Text>
          </TouchableOpacity>
        )}
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={(text) => {
            setInputText(text);
            // Scroll to end when user types
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }}
          placeholder={isListening ? "Listening..." : "Type your message..."}
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={1000}
          onFocus={() => {
            // Scroll to end when input is focused
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 300);
          }}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || loading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      {/* Call Modal */}
      <CallModal
        visible={showCallModal}
        agentName={agent?.name || 'AI Assistant'}
        agentEmoji={getAgentEmoji()}
        callStatus={callStatus}
        onEndCall={handleEndCall}
        inputText={inputText}
        onInputChange={setInputText}
        onSend={handleSend}
        speechRecognitionAvailable={speechRecognitionAvailable}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  emptyMessagesList: {
    justifyContent: 'flex-start',
    paddingTop: 0,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  welcomeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.border,
  },
  welcomeAvatarEmoji: {
    fontSize: 40,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  welcomeDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  suggestionsContainer: {
    width: '100%',
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  suggestion: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.accentBlue,
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.cardBackground,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  userMessageText: {
    color: colors.textPrimary,
  },
  audioButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  audioIcon: {
    fontSize: 18,
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 6,
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    gap: 8,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentBlue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 70,
    gap: 6,
  },
  callButtonDisabled: {
    opacity: 0.5,
  },
  callButtonIcon: {
    fontSize: 16,
  },
  callButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: colors.cardBackground,
    color: colors.textPrimary,
  },
  sendButton: {
    backgroundColor: colors.accentBlue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: colors.background,
  },
  loadingText: {
    marginLeft: 8,
    color: colors.textSecondary,
    fontSize: 14,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 40,
    color: colors.textSecondary,
  },
});


