"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Bring in centralized Task 2 translations dynamically!
import { Language, translations } from "@/lib/chatbot/translations";
import { getBotResponse } from "@/lib/chatbot/chatEngine";
import { getToken } from "@/lib/authClient";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<Language>("en");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", sender: "bot", text: translations.greetings["en"] }
  ]);
  const [userCrops, setUserCrops] = useState<any[]>([]);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Fetch crops passively on initialize
  useEffect(() => {
    async function loadCrops() {
      try {
        const token = getToken() || "dummy-token";
        const res = await fetch("/api/crops", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) setUserCrops(data.crops);
        }
      } catch (err) {
        console.error("Failed loading chat crop data", err);
      }
    }
    loadCrops();
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle Language Swap (Reset Chat)
  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    setMessages([{ id: Date.now().toString(), sender: "bot", text: translations.greetings[newLang] }]);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    // Add User Message
    const textMsg = input.trim();
    const newUserMsg: Message = { id: Date.now().toString(), sender: "user", text: textMsg };
    setMessages(prev => [...prev, newUserMsg]);
    setInput("");

    // Process Rule-based Response mapped from chatEngine
    setTimeout(() => {
      const matchedResponse = getBotResponse(textMsg, lang, userCrops);
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: "bot", text: matchedResponse }]);
    }, 600);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-[#1e293b] border border-white/10 rounded-2xl w-80 sm:w-96 shadow-2xl mb-4 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-accent-green/20 backdrop-blur-md p-4 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="bg-accent-green p-1.5 rounded-full text-black">
                    <Bot size={18} />
                  </div>
                  <h3 className="font-bold text-white tracking-tight">{translations.botTitle[lang]}</h3>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="text-white/60 hover:text-white transition-colors p-1"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Language Selector Toolbar */}
              <div className="bg-white/[0.02] px-4 py-2 flex items-center justify-between text-xs border-b border-white/5">
                <span className="text-text-secondary">Language:</span>
                <select 
                  className="bg-black/20 border border-white/10 rounded text-white px-2 py-1 outline-none focus:border-accent-green/50"
                  value={lang}
                  onChange={(e) => handleLanguageChange(e.target.value as Language)}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="bn">বাংলা (Bengali)</option>
                </select>
              </div>

              {/* Chat Canvas */}
              <div className="h-72 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm ${
                      msg.sender === "user" 
                        ? "bg-accent-green text-black rounded-br-sm font-medium" 
                        : "bg-white/10 text-white rounded-bl-sm"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={endOfMessagesRef} />
              </div>

              {/* Input Footer */}
              <div className="p-3 bg-white/[0.03] border-t border-white/10 flex items-center gap-2">
                <input 
                  type="text"
                  placeholder={translations.placeholder[lang]}
                  className="flex-1 bg-black/20 border border-white/10 text-white text-sm rounded-lg px-4 py-2.5 outline-none focus:border-accent-green/50 transition-colors"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button 
                  onClick={handleSend}
                  className="bg-accent-green hover:bg-emerald-500 text-black p-2.5 rounded-lg transition-colors flex flex-shrink-0 items-center justify-center"
                >
                  <Send size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="bg-accent-green hover:bg-emerald-400 text-black rounded-full p-4 shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all flex items-center gap-2 group"
        >
          {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
          {!isOpen && <span className="font-bold text-sm hidden sm:block pr-2 overflow-hidden whitespace-nowrap">Chat Assistant</span>}
        </motion.button>
      </div>
    </>
  );
}
