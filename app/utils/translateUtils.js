import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI("AIzaSyCprjN2lJrgxliZJzYxMgBrriFvRi1Gx8E");

export const translateText = async (text, targetLanguage) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `Translate the following English text to ${targetLanguage}. Maintain the same tone and style, and keep any special formatting or line breaks. Only return the translated text without any additional explanations or notes:

${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text();
    
    return translatedText;
  } catch (error) {
    console.error('Error translating text:', error);
    throw new Error('Failed to translate text');
  }
}; 