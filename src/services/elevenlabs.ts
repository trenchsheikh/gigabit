import { ENV } from '../config/env';
import * as FileSystem from 'expo-file-system/legacy';
import { Audio } from 'expo-av';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel - default voice

interface ElevenLabsErrorResponse {
  detail?: {
    message?: string;
  };
}

export class ElevenLabsError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ElevenLabsError';
  }
}

let sound: Audio.Sound | null = null;

export const elevenLabsService = {
  async synthesizeSpeech(
    text: string,
    voiceId: string = DEFAULT_VOICE_ID
  ): Promise<string> {
    const trimmedKey = ENV.ELEVENLABS_API_KEY?.trim() || '';
    
    // If no API key, skip TTS but don't throw error (chat will still work)
    if (!trimmedKey) {
      if (__DEV__) {
        console.warn('⚠️ ElevenLabs API key not configured. Text-to-speech will be skipped.');
      }
      // Return a dummy URI - audio playback will be skipped
      return '';
    }

    try {
      const response = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': ENV.ELEVENLABS_API_KEY.trim(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!response.ok) {
        const errorData: ElevenLabsErrorResponse = await response.json().catch(() => ({}));
        throw new ElevenLabsError(
          errorData.detail?.message || `API request failed: ${response.statusText}`,
          response.status
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioUri = `${FileSystem.cacheDirectory}tts_${Date.now()}.mp3`;
      
      // Convert array buffer to base64 and write file
      const base64 = this.arrayBufferToBase64(arrayBuffer);
      
      // Write file with Base64 encoding using legacy API
      await FileSystem.writeAsStringAsync(audioUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return audioUri;
    } catch (error) {
      if (error instanceof ElevenLabsError) {
        throw error;
      }
      throw new ElevenLabsError(
        error instanceof Error ? error.message : 'Network error occurred',
        0
      );
    }
  },

  async playAudio(audioUri: string, onPlaybackStatusUpdate?: (status: any) => void): Promise<void> {
    // If no audio URI (mock mode), skip playback
    if (!audioUri) {
      if (__DEV__) {
        console.log('ℹ️ Skipping audio playback (no API key configured)');
      }
      // Call callback to indicate playback finished (for mock mode)
      if (onPlaybackStatusUpdate) {
        setTimeout(() => {
          onPlaybackStatusUpdate({ isLoaded: true, didJustFinish: true });
        }, 2000);
      }
      return;
    }

    try {
      // Stop any currently playing audio
      if (sound) {
        await sound.unloadAsync();
        sound = null;
      }

      // Load and play new audio
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );
      sound = newSound;

      // Clean up when finished and notify callback
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (onPlaybackStatusUpdate) {
          onPlaybackStatusUpdate(status);
        }
        if (status.isLoaded && status.didJustFinish) {
          newSound.unloadAsync();
          sound = null;
        }
      });
    } catch (error) {
      throw new ElevenLabsError(
        error instanceof Error ? error.message : 'Failed to play audio',
        0
      );
    }
  },

  async stopAudio(): Promise<void> {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      sound = null;
    }
  },

  arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;
    
    while (i < bytes.length) {
      const a = bytes[i++];
      const b = i < bytes.length ? bytes[i++] : 0;
      const c = i < bytes.length ? bytes[i++] : 0;
      
      const bitmap = (a << 16) | (b << 8) | c;
      
      result += chars.charAt((bitmap >> 18) & 63);
      result += chars.charAt((bitmap >> 12) & 63);
      result += i - 2 < bytes.length ? chars.charAt((bitmap >> 6) & 63) : '=';
      result += i - 1 < bytes.length ? chars.charAt(bitmap & 63) : '=';
    }
    
    return result;
  },
};

