import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Page = "home" | "places" | "itinerary" | "admin" | "budget";

interface ChatbotWidgetProps {
  navigate: (page: Page) => void;
}

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
}

const QUICK_REPLIES = [
  {
    label: "Best places to visit",
    query: "What are the best places to visit?",
  },
  { label: "Best time to visit", query: "When is the best time to visit?" },
  { label: "Food to try", query: "What food should I try?" },
  { label: "Houseboat tips", query: "Any houseboat tips?" },
  { label: "Getting there", query: "How do I get to Alappuzha?" },
  { label: "Festivals", query: "What festivals are there?" },
];

function getBotResponse(input: string): string {
  const text = input.toLowerCase();

  if (/places|visit|top|must.?see/.test(text)) {
    return "\ud83d\uddfa\ufe0f **Top 5 Places in Alappuzha:**\n1. Backwaters \u2014 iconic canal network\n2. Alappuzha Beach \u2014 137-year-old pier\n3. Punnamada Lake \u2014 Nehru Trophy venue\n4. Pathiramanal Island \u2014 rare migratory birds\n5. Arthunkal Church \u2014 450-year-old Portuguese basilica";
  }

  if (/time|when|season|best month/.test(text)) {
    return "\ud83c\udf24\ufe0f **Best Time to Visit:** October to March is ideal with pleasant weather. Avoid June\u2013August (heavy monsoon). The Nehru Trophy Boat Race is held on the 2nd Saturday of August \u2014 a spectacular event if you enjoy crowds!";
  }

  if (/food|eat|cuisine|fish|meal/.test(text)) {
    return "\ud83c\udf7d\ufe0f **Must-Try Food in Alappuzha:**\n\u2022 Karimeen Pollichathu (pearl spot fish)\n\u2022 Appam with coconut stew\n\u2022 Kappa & Meen Curry (tapioca + fish)\n\u2022 Fresh toddy & coconut water\n\u2022 Prawn curry with Kerala spices";
  }

  if (/houseboat|boat|cruise|backwater/.test(text)) {
    return "\ud83d\udea2 **Houseboat Tips:**\n\u2022 Book in advance at Punnamada Lake\n\u2022 Overnight stays: \u20b98,000\u201325,000 (entire boat)\n\u2022 Government-approved operators are safer\n\u2022 Includes meals & AC cabin\n\u2022 Best experience: Nov\u2013Feb for calm waters";
  }

  if (/getting|reach|travel|transport|how.?to/.test(text)) {
    return "\ud83d\ude8c **Getting to Alappuzha:**\n\u2022 From Kochi airport: 85km away\n\u2022 KSRTC bus: ~\u20b960, 1.5\u20132 hrs\n\u2022 Taxi: ~\u20b91,200, 1.5 hrs\n\u2022 Train: Direct trains to Alappuzha station\n\u2022 Auto-rickshaws for local travel";
  }

  if (/festival|event|boat race|nehru/.test(text)) {
    return "\ud83c\udf89 **Festivals & Events:**\n\u2022 Nehru Trophy Boat Race: 2nd Sat, August\n\u2022 Champakulam Moolam Boat Race: June/July\n\u2022 Alappuzha Beach Festival: December\n\u2022 Onam celebrations: August/September\n\u2022 Arthunkal Perunnal: January";
  }

  if (/budget|cost|price|cheap|expensive/.test(text)) {
    return "\ud83d\udcb0 **Budget Guide:**\n\u2022 Budget trip: \u20b91,500\u20132,000/day/person\n\u2022 Mid-range: \u20b93,500\u20135,000/day/person\n\u2022 Luxury: \u20b98,000+/day/person\n\nUse our **Budget Calculator** for a detailed estimate tailored to your trip! \ud83e\uddee";
  }

  if (/stay|hotel|resort|accommodation/.test(text)) {
    return "\ud83c\udfe8 **Accommodation Options:**\n\u2022 Budget homestays: from \u20b9800/night\n\u2022 Mid-range hotels: \u20b92,500\u20134,000/night\n\u2022 Luxury resorts: \u20b97,000+/night\n\u2022 Floating cottages on backwaters (unique!)\n\u2022 Houseboat overnight: \u20b98,000\u201325,000";
  }

  return "\ud83d\udc4b Hi! I can help with:\n\u2022 Places to visit\n\u2022 Best time to travel\n\u2022 Food recommendations\n\u2022 Houseboat booking tips\n\u2022 Getting to Alappuzha\n\u2022 Festivals & events\n\u2022 Budget planning\n\nWhat would you like to know?";
}

export default function ChatbotWidget({ navigate }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text: "\ud83d\udc4b Welcome! I'm your Alappuzha Travel Guide. Ask me anything about places, food, houseboats, festivals, or trip planning!",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageCount = messages.length;

  // Scroll to bottom when message count or typing state changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally using messageCount and isTyping to trigger scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageCount, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    const delay = 600 + Math.random() * 300;
    setTimeout(() => {
      const response = getBotResponse(text);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "bot",
        text: response,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);

      // Navigate to budget page if response mentions Budget Calculator
      if (response.includes("Budget Calculator")) {
        setTimeout(() => navigate("budget"), 1800);
      }
    }, delay);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  // Format bot text with basic markdown-like rendering
  const renderText = (text: string) => {
    return text.split("\n").map((line, i) => {
      const key = `line-${i}-${line.slice(0, 8)}`;
      const boldFormatted = line.replace(
        /\*\*(.+?)\*\*/g,
        "<strong>$1</strong>",
      );
      return (
        <span key={key}>
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: safe formatted text */}
          <span dangerouslySetInnerHTML={{ __html: boldFormatted }} />
          {i < text.split("\n").length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            data-ocid="chatbot.open_modal_button"
            type="button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            aria-label="Open travel guide chat"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-1.5rem)] flex flex-col rounded-2xl shadow-2xl border border-border overflow-hidden bg-card"
            style={{ maxHeight: "calc(100vh - 5rem)", height: "520px" }}
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground px-4 py-3.5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-foreground/15 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-display font-semibold text-sm leading-tight">
                    Alappuzha Travel Guide
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs opacity-70">
                      Online \u00b7 Ask me anything
                    </span>
                  </div>
                </div>
              </div>
              <button
                data-ocid="chatbot.close_button"
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "bot" && (
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    }`}
                  >
                    {renderText(msg.text)}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-start items-center gap-2"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-3 pb-2 flex gap-1.5 flex-wrap flex-shrink-0">
              {QUICK_REPLIES.map((qr, idx) => (
                <button
                  key={qr.label}
                  data-ocid={`chatbot.suggestion.${idx + 1}`}
                  type="button"
                  onClick={() => sendMessage(qr.query)}
                  disabled={isTyping}
                  className="text-xs px-2.5 py-1 rounded-full border border-primary/25 text-primary hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-primary/5 font-medium"
                >
                  {qr.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-border p-3 flex-shrink-0">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  ref={inputRef}
                  data-ocid="chatbot.input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about Alappuzha\u2026"
                  disabled={isTyping}
                  className="flex-1 text-sm rounded-xl border-primary/20 focus:border-primary"
                />
                <Button
                  data-ocid="chatbot.submit_button"
                  type="submit"
                  size="icon"
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-primary hover:bg-primary/90 rounded-xl w-9 h-9 flex-shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
