import OpenAI from "openai";

const HARMFUL_KEYWORDS = [
  'sex', 'sexual', 'nude', 'violence', 'kill', 'murder', 'drugs', 'abuse', 'suicide', 'blood', 'weapon', 'rape'
];

// OpenAI API key for Expo (provided by user)
const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true, // Required for Expo/React Native
});

export function isContentSafe(prompt) {
  const lower = prompt.toLowerCase();
  return !HARMFUL_KEYWORDS.some(word => lower.includes(word));
}

export function buildStoryPrompt({ mainIdea, charNames, charDetails, setting, storyType, storyLength }) {
  const chars = charNames.map((name, i) => {
    const d = charDetails[i];
    return `${name} (a ${d.profession}, ${d.relation})`;
  }).join(', ');
  return `Write a ${storyType} story for kids. The main idea is: "${mainIdea}". Characters: ${chars}. Setting: ${setting}. Length: ${storyLength}. Make it fun, engaging, and age-appropriate. Do not include any introductory text like "Here is the story" or similar phrases.`;
}

export function buildDialoguePrompt({ about, charNames, charDetails, length, creativity }) {
  const chars = charNames.map((name, i) => {
    const d = charDetails[i];
    return `${name} (age ${d.age}, ${d.profession})`;
  }).join(', ');
  return `Write a creative dialogue for kids about: "${about}". Characters: ${chars}. Length: ${length}. Creativity: ${creativity}. Make it fun, engaging, and safe for children. Do not include any introductory text like "Here is the dialogue" or similar phrases.`;
}

// System prompt to ensure safe, child-appropriate content
export const SYSTEM_PROMPT = `
You are a helpful assistant for children. Only generate stories and dialogues that are safe, age-appropriate, and suitable for kids. Do not include any 18+ content, violence, harm, killing, or any inappropriate material. Always keep the content fun, positive, and safe for children.`;

export async function callGeminiAPI(prompt) {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey;
  // Prepend the system prompt to the user prompt
  const fullPrompt = `${SYSTEM_PROMPT}\n\n${prompt}`;
  const body = {
    contents: [{ parts: [{ text: fullPrompt }] }]
  };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    console.log('Gemini API response:', data); // Log the full response
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }
    if (data?.error) {
      return `Error: ${data.error.message || JSON.stringify(data.error)}`;
    }
    return 'No valid response from Gemini.';
  } catch (err) {
    console.error('Gemini API fetch error:', err);
    return `Fetch error: ${err.message}`;
  }
}

/**
 * Generate image prompts from a story using Gemini.
 * Always returns exactly 8 prompts, one for each page of the story.
 */
export async function generateImagePromptsFromStory(story) {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey;
  
  // Updated system prompt for simpler, more focused image prompts
  const systemPrompt = `You are an assistant that creates simple, child-friendly image prompts for children's stories. For the given story, break it into exactly 8 equal parts and write a short, focused prompt for each part. Follow these rules:
1. Each prompt should focus on ONE main subject or action
2. Keep descriptions simple and clear
3. Use child-friendly language
4. Avoid complex scenes with multiple characters
5. Focus on the most important visual element of that part
6. Use bright, cheerful colors in descriptions
7. Keep prompts under 20 words
8. Do not include any text or speech bubbles
9. Do not include any 18+ content, violence, harm, or killing
Only output a JSON array of exactly 8 prompts.`;

  const fullPrompt = `${systemPrompt}\n\nStory:\n${story}`;
  const body = {
    contents: [{ parts: [{ text: fullPrompt }] }]
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    // Try to extract the JSON array from the response
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const match = text.match(/\[.*\]/s);
    if (match) {
      const prompts = JSON.parse(match[0]);
      // Ensure we have exactly 8 prompts
      if (prompts.length < 8) {
        // If we have fewer than 8 prompts, duplicate the last one
        while (prompts.length < 8) {
          prompts.push(prompts[prompts.length - 1]);
        }
      } else if (prompts.length > 8) {
        // If we have more than 8 prompts, take only the first 8
        prompts.length = 8;
      }
      return prompts;
    }
    // fallback: create 8 generic prompts if JSON parsing fails
    return Array(8).fill('A bright and cheerful scene from a children\'s story with friendly characters');
  } catch (err) {
    console.error('Image prompt generation error:', err);
    return Array(8).fill('A bright and cheerful scene from a children\'s story with friendly characters');
  }
}

/**
 * Generate an image from a prompt using OpenAI DALL-E 3.
 * Returns the image URL.
 */
export async function generateImageFromPromptOpenAI(prompt) {
  if (!prompt) {
    console.error('No prompt provided for image generation');
    return null;
  }

  try {
    console.log('Generating image with prompt:', prompt);
    const result = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a bright, cheerful, child-friendly illustration for a children's story book. The scene should be simple and clear: ${prompt}. Use vibrant colors and a friendly, cartoon-like style.`,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });
    
    if (!result?.data?.[0]?.url) {
      console.error('Invalid response from OpenAI:', result);
      return null;
    }
    
    console.log('Image generation result:', result);
    return result.data[0].url;
  } catch (err) {
    console.error('OpenAI image generation error:', err);
    return null;
  }
} 