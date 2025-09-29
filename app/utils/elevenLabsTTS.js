import axios from 'axios';
import { encode } from 'base64-arraybuffer';

const ELEVEN_LABS_API_KEY = process.env.EXPO_PUBLIC_ELEVEN_LABS_API_KEY || 'YOUR_ELEVEN_LABS_API_KEY';
const VOICE_ID = process.env.EXPO_PUBLIC_ELEVEN_LABS_VOICE_ID || 'YOUR_ELEVEN_LABS_VOICE_ID'; // Default voice placeholder

export async function getSpeechFromText(text) {
  try {
    const response = await axios({
      method: 'POST',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      headers: {
        'xi-api-key': ELEVEN_LABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      data: {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      },
      responseType: 'arraybuffer',
    });
    // Convert arraybuffer to base64 audio using base64-arraybuffer
    const audioBase64 = `data:audio/mpeg;base64,${encode(response.data)}`;
    return audioBase64;
  } catch (error) {
    console.error('Error calling Eleven Labs TTS:', error);
    throw error;
  }
} 