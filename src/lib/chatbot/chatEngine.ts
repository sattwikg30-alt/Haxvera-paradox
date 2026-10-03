import { responses, translations, Language } from "./translations";

export function getBotResponse(message: string, language: Language, userCrops: any[] = []): string {
  // Convert message to lowercase to standardize checking
  const lowerMessage = message.toLowerCase();

  // Task 6: Dynamic Context checks
  if (lowerMessage.includes("risk")) {
    if (userCrops.length > 0) {
      // Find the most recent crop or matching crop 
      const mentionedCrop = userCrops.find(c => lowerMessage.includes((c.cropType || "").toLowerCase()));
      const activeCrop = mentionedCrop || userCrops[0];
      const risk = activeCrop.riskLevel || 'Low';

      // Custom localized template literals
      if (language === "hi") return `📊 आपकी ${activeCrop.cropType} फसल में वर्तमान में ${risk} जोखिम है।`;
      if (language === "bn") return `📊 আপনার ${activeCrop.cropType} ফসলে বর্তমানে ${risk} ঝুঁকি রয়েছে।`;
      return `📊 Your ${activeCrop.cropType} crop currently has ${risk} risk.`;
    } else {
        // Fallback if they have no crops loaded
        if (language === "hi") return "🤷‍♂️ मुझे आपके खाते में कोई सहेजी गई फसल नहीं मिली।";
        if (language === "bn") return "🤷‍♂️ আমি আপনার অ্যাকাউন্টে কোনো সংরক্ষিত ফসল খুঁজে পাইনি।";
        return "🤷‍♂️ I couldn't find any saved crops in your account to check the risk for!";
    }
  }

  // Keyword Checks
  if (lowerMessage.includes("rain") || lowerMessage.includes("rainfall") || lowerMessage.includes("weather")) {
    return responses.rainfall_advice[language];
  }

  if (lowerMessage.includes("yield") || lowerMessage.includes("low")) {
    return responses.yield_advice[language];
  }

  if (lowerMessage.includes("irrigate") || lowerMessage.includes("irrigation") || lowerMessage.includes("water")) {
    return responses.irrigation_advice[language];
  }

  if (lowerMessage.includes("pest") || lowerMessage.includes("insect")) {
    return responses.pest_advice[language];
  }

  // Fallback returned dynamically from Language Translations map
  return translations.fallback[language];
}
