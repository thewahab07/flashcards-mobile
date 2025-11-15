import { WordItem } from "@/types";
import axios from "axios";
import Constants from "expo-constants";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";
const geminiApiKey = Constants.expoConfig?.extra?.geminiApiKey;

export const generateDefinition = async (word: string, words: WordItem[]) => {
  const allWordsString = words
    .map((item) => `${item.word}:${item.definition}`)
    .join(", ");
  const defaultPropmt = `Provide a **really short description or meaning** for the word(s) "${word}". Do **not** add any explanations, examples, or extra text. Only output the word(s) meaning/description.`;
  const customPrompt = `You are a professional linguist and educator. Your task is to provide a **concise definition for ${word} ** in **1 to 3 words maximum**. The description should be clear, precise, and natural-sounding, as if coming from a human. Do not add examples, explanations, or extra commentary — only the short word or phrase that captures the meaning. The tone should be friendly, human-like, and professional.


Here are some examples of how you are supposed to answer: ${allWordsString}`;
  try {
    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [
          {
            parts: [
              {
                text: words.length > 0 ? customPrompt : defaultPropmt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiApiKey,
        },
      }
    );

    // Extract clean text response
    const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return result;
  } catch (error: any) {
    console.error("Gemini API error:", error.response?.data || error.message);
    return "Error generating definition";
  }
};
