import Constants from 'expo-constants';

const getEnvVar = (key: string): string => {
  // Try multiple sources for environment variables
  let value = 
    Constants.expoConfig?.extra?.[key] || 
    process.env[key] ||
    (typeof window !== 'undefined' && (window as any).__ENV__?.[key]) ||
    '';
  
  // Trim whitespace and remove any quotes
  if (value) {
    value = value.trim().replace(/^["']|["']$/g, '');
  }
  
  if (!value && __DEV__) {
    console.warn(`Environment variable ${key} is not set. Please check your .env file.`);
  } else if (value && __DEV__) {
    // Log that the key is loaded (but not the actual key)
    const keyPreview = value.length > 10 
      ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}` 
      : '***';
    console.log(`✓ ${key} loaded: ${keyPreview}`);
  }
  
  return value;
};

export const ENV = {
  OPENAI_API_KEY: getEnvVar('OPENAI_API_KEY'),
  ELEVENLABS_API_KEY: getEnvVar('ELEVENLABS_API_KEY'),
} as const;

// Validate API keys format
if (__DEV__) {
  if (ENV.OPENAI_API_KEY && !ENV.OPENAI_API_KEY.startsWith('sk-')) {
    console.warn('⚠️ OpenAI API key should start with "sk-"');
  }
  if (ENV.ELEVENLABS_API_KEY && ENV.ELEVENLABS_API_KEY.length < 20) {
    console.warn('⚠️ ElevenLabs API key seems too short');
  }
}


