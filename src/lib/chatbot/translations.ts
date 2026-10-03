// Defines supported Languages
export type Language = "en" | "hi" | "bn";

// Contains all hardcoded string translations mapping
export const translations = {
  greetings: {
    en: "👋 Hello! How can I help you today?",
    hi: "👋 नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ?",
    bn: "👋 নমস্কার! আমি কীভাবে সাহায্য করতে পারি?"
  },
  botTitle: {
    en: "Farmer Assistant",
    hi: "किसान सहायक",
    bn: "কৃষি সহায়ক"
  },
  fallback: {
    en: "🤔 I didn't catch that. Ask about yield, rain, or pests.",
    hi: "🤔 मैं समझ नहीं पाया। पैदावार, बारिश या कीटों के बारे में पूछें।",
    bn: "🤔 আমি বুঝতে পারিনি। ফলন, বৃষ্টি বা পোকামাকড় সম্পর্কে জিজ্ঞাসা করুন।"
  },
  placeholder: {
    en: "Type your question...",
    hi: "अपना प्रश्न टाइप करें...",
    bn: "আপনার প্রশ্ন লিখুন..."
  }
};

// Responses dictated by Task 5 and Task 7 guidelines
export const responses: Record<string, Record<Language, string>> = {
  irrigation_advice: {
    en: "💧 Increase irrigation.",
    hi: "💧 सिंचाई बढ़ाएं।",
    bn: "💧 সেচ বাড়ান।"
  },
  yield_advice: {
    en: "📉 Check for low rain, poor soil, or pests.",
    hi: "📉 कम बारिश, खराब मिट्टी या कीटों की जांच करें।",
    bn: "📉 কম বৃষ্টি, দুর্বল মাটি বা পোকামাকড় পরীক্ষা করুন।"
  },
  pest_advice: {
    en: "⚠ Monitor pest activity.",
    hi: "⚠ कीट गतिविधि की निगरानी करें।",
    bn: "⚠ পোকামাকড় নিরীক্ষণ করুন।"
  },
  rainfall_advice: {
    en: "🌧 Rain expected tomorrow.",
    hi: "🌧 कल बारिश की उम्मीद है।",
    bn: "🌧 আগামীকাল বৃষ্টির সম্ভাবনা আছে।"
  }
};
