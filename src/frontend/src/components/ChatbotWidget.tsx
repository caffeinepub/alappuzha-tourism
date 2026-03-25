import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bot,
  Calculator,
  MapPin,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Page } from "../App";

const GEMINI_API_KEY = "AIzaSyDVkr9yIxvVYeEzhzf8YGCY1kIX5AqWwAA";
// Use stable v1 endpoint with current model names
const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
];
const SYSTEM_INSTRUCTION = `You are a highly intelligent AI travel assistant for Alappuzha (Alleppey), Kerala, India — designed to be as helpful and natural as ChatGPT.

Capabilities:
- Natural, human-like conversation with full context awareness
- Provide detailed, logical, and accurate answers about Alappuzha
- Solve travel planning problems step-by-step
- Generate creative content (captions, itineraries, packing lists, travel stories)
- Assist with budgeting, booking tips, local culture, food, transport, houseboats, and nearby attractions

Tone & Style:
- Friendly, conversational, and professional
- Adapt tone based on the user (formal or informal)
- Keep explanations simple but meaningful

Rules:
- Never provide harmful or illegal content
- If unsure about something, say so honestly — do not hallucinate facts
- Be concise but thorough — avoid unnecessary filler

Output Formatting:
- Use bullet points when listing multiple items
- Use bold text (**like this**) for key terms and headings
- Use examples when helpful
- Structure longer answers with clear sections
- For itineraries or step-by-step plans, use numbered lists

Focus areas: places to visit, houseboat bookings, local food, transport options, weather and best time to visit, festivals, budget planning, safety tips, nearby day trips, and authentic local experiences in Alappuzha.`;

async function callGeminiAPI(
  model: string,
  contents: { role: string; parts: { text: string }[] }[],
): Promise<string> {
  // Use stable v1 endpoint
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  const body = {
    system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    contents,
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.7,
    },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Gemini model ${model} error ${res.status}:`, errText);
      throw new Error(`Gemini API error: ${res.status}`);
    }

    const data = await res.json();
    const candidate = data?.candidates?.[0];

    if (
      candidate?.finishReason &&
      candidate.finishReason !== "STOP" &&
      !candidate.content?.parts?.[0]?.text
    ) {
      throw new Error(
        `Gemini response blocked. Finish reason: ${candidate.finishReason}`,
      );
    }

    const text = candidate?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty Gemini response");
    return text;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

async function getGeminiResponse(
  userText: string,
  history: { role: "user" | "bot"; text: string }[],
): Promise<string> {
  // Build strictly alternating user/model history (Gemini requirement)
  const recentHistory = history.slice(-8);
  const alternating: { role: "user" | "bot"; text: string }[] = [];
  let lastRole: string | null = null;
  for (const m of recentHistory) {
    const role = m.role === "user" ? "user" : "model";
    if (role !== lastRole) {
      alternating.push(m);
      lastRole = role;
    }
  }
  // Gemini requires conversation to start with "user"
  const trimmed =
    alternating.length > 0 && alternating[0].role !== "user"
      ? alternating.slice(1)
      : alternating;

  const contents = [
    ...trimmed.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    })),
    { role: "user", parts: [{ text: userText }] },
  ];

  let lastErr: Error | null = null;
  for (const model of GEMINI_MODELS) {
    try {
      console.log(`Trying Gemini model: ${model}`);
      const result = await callGeminiAPI(model, contents);
      console.log(`Success with model: ${model}`);
      return result;
    } catch (err) {
      console.warn(`Gemini model ${model} failed:`, err);
      lastErr = err as Error;
    }
  }
  throw lastErr;
}

const GENERIC_SUGGESTIONS = [
  "Houseboat tips",
  "Best places to visit",
  "Plan my itinerary",
  "Budget tips",
];

interface ChatbotWidgetProps {
  navigate: (page: Page) => void;
}

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  suggestions?: string[];
  navAction?: Page;
  estimatorResult?: EstimatorResult;
}

type EstimatorStep =
  | null
  | "days"
  | "accommodation"
  | "transport"
  | "food"
  | "activities"
  | "result";

interface EstimatorState {
  active: boolean;
  step: EstimatorStep;
  days?: number;
  accommodation?: string;
  transport?: string;
  food?: string;
  activities?: string;
}

interface EstimatorResult {
  days: number;
  accommodation: string;
  transport: string;
  food: string;
  activities: string;
  accCost: number;
  transportCost: number;
  foodCost: number;
  actCost: number;
  total: number;
  totalMax: number;
}

const ACC_RATES: Record<string, number> = {
  "Budget homestay": 700,
  "Mid-range hotel": 3000,
  "Luxury resort": 8000,
  Houseboat: 12000,
};
const TRANSPORT_RATES: Record<string, number> = {
  "Public transport": 200,
  "Auto-rickshaw / taxi": 500,
  "Rented vehicle": 800,
};
const FOOD_RATES: Record<string, number> = {
  "Street food / local eateries": 250,
  "Mid-range restaurants": 600,
  "Fine dining": 1200,
};
const ACTIVITY_RATES: Record<string, number> = {
  "Free / budget activities": 100,
  "Mix of paid & free": 500,
  "Houseboat + tours": 1500,
};

const ESTIMATOR_STEPS: Record<
  NonNullable<EstimatorStep>,
  { question: string; chips: string[] }
> = {
  days: {
    question: "🗓️ **How many days** is your trip?",
    chips: ["1", "2", "3", "4", "5", "6", "7"],
  },
  accommodation: {
    question: "🏡 What type of **accommodation** do you prefer?",
    chips: ["Budget homestay", "Mid-range hotel", "Luxury resort", "Houseboat"],
  },
  transport: {
    question: "🚌 What's your **transport preference**?",
    chips: ["Public transport", "Auto-rickshaw / taxi", "Rented vehicle"],
  },
  food: {
    question: "🍛 What's your **food preference**?",
    chips: [
      "Street food / local eateries",
      "Mid-range restaurants",
      "Fine dining",
    ],
  },
  activities: {
    question: "🎯 What kind of **activities** are you planning?",
    chips: [
      "Free / budget activities",
      "Mix of paid & free",
      "Houseboat + tours",
    ],
  },
  result: { question: "", chips: [] },
};

const STEP_ORDER: EstimatorStep[] = [
  "days",
  "accommodation",
  "transport",
  "food",
  "activities",
  "result",
];

function computeEstimate(state: EstimatorState): EstimatorResult {
  const days = state.days ?? 1;
  const accRate = ACC_RATES[state.accommodation ?? "Budget homestay"] ?? 700;
  const transRate =
    TRANSPORT_RATES[state.transport ?? "Public transport"] ?? 200;
  const foodRate =
    FOOD_RATES[state.food ?? "Street food / local eateries"] ?? 250;
  const actRate =
    ACTIVITY_RATES[state.activities ?? "Free / budget activities"] ?? 100;

  const nights = days;
  const accCost = accRate * nights;
  const transportCost = transRate * days;
  const foodCost = foodRate * days;
  const actCost = actRate * days;
  const total = accCost + transportCost + foodCost + actCost;
  const totalMax = Math.round(total * 1.2);

  return {
    days,
    accommodation: state.accommodation ?? "Budget homestay",
    transport: state.transport ?? "Public transport",
    food: state.food ?? "Street food / local eateries",
    activities: state.activities ?? "Free / budget activities",
    accCost,
    transportCost,
    foodCost,
    actCost,
    total,
    totalMax,
  };
}

function detectEstimatorTrigger(text: string): boolean {
  return /estimate.*cost|cost.*estimat|trip.*budget|budget.*trip|how much.*trip|trip.*cost|cost.*calculator|estimat.*trip|start.*estimat/.test(
    text,
  );
}

const INITIAL_QUICK_REPLIES = [
  "Best places to visit",
  "Best time to visit",
  "Food to try",
  "Houseboat tips",
  "Getting there",
  "Nearby attractions",
  "Trip cost estimator",
];

interface BotResult {
  text: string;
  suggestions?: string[];
  navAction?: Page;
}

function fmt(n: number) {
  return n.toLocaleString("en-IN");
}

function EstimatorCard({ result }: { result: EstimatorResult }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden text-sm mt-1">
      <div className="bg-primary/10 px-3.5 py-2.5 flex items-center gap-2">
        <Calculator className="w-4 h-4 text-primary" />
        <span className="font-semibold text-foreground">
          Trip Estimate · {result.days} day{result.days > 1 ? "s" : ""}
        </span>
      </div>
      <div className="px-3.5 py-2.5 space-y-1.5">
        <div className="flex justify-between">
          <span className="text-muted-foreground">🏡 Accommodation</span>
          <span className="font-medium">₹{fmt(result.accCost)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">🚌 Transport</span>
          <span className="font-medium">₹{fmt(result.transportCost)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">🍛 Food</span>
          <span className="font-medium">₹{fmt(result.foodCost)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">🎯 Activities</span>
          <span className="font-medium">₹{fmt(result.actCost)}</span>
        </div>
        <div className="border-t border-border pt-1.5 mt-1 flex justify-between">
          <span className="font-semibold text-foreground">💰 Total</span>
          <span className="font-bold text-primary">
            ₹{fmt(result.total)} – ₹{fmt(result.totalMax)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ChatbotWidget({
  navigate: _navigate,
}: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text: "👋 Welcome! I'm your **Alappuzha AI Travel Guide**. I can help you plan your trip, discover local food, book stays, and more!\n\nWhat would you like to explore?",
      suggestions: INITIAL_QUICK_REPLIES,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [estimator, setEstimator] = useState<EstimatorState>({
    active: false,
    step: null,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageCount = messages.length;

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally using messageCount and isTyping to trigger scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageCount, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const pushBotMessage = (msg: Omit<Message, "id" | "role">) => {
    setMessages((prev) => [
      ...prev,
      { ...msg, id: `bot-${Date.now()}-${Math.random()}`, role: "bot" },
    ]);
  };

  const advanceEstimator = (choice: string) => {
    const current = estimator.step;
    const currentIdx = STEP_ORDER.indexOf(current);
    const nextStep = STEP_ORDER[currentIdx + 1] ?? "result";

    const next: EstimatorState = { ...estimator };
    if (current === "days") next.days = Number.parseInt(choice, 10);
    else if (current === "accommodation") next.accommodation = choice;
    else if (current === "transport") next.transport = choice;
    else if (current === "food") next.food = choice;
    else if (current === "activities") next.activities = choice;

    if (nextStep === "result") {
      next.active = false;
      next.step = null;
      const result = computeEstimate(next);
      setEstimator(next);
      setIsTyping(false);
      pushBotMessage({
        text: "Here's your personalised trip estimate! 🎉",
        estimatorResult: result,
        suggestions: [
          "Open Budget Calculator",
          "Plan my itinerary",
          "Book a stay",
          "Start over",
        ],
      });
    } else {
      next.step = nextStep;
      setEstimator(next);
      const stepInfo = ESTIMATOR_STEPS[nextStep as NonNullable<EstimatorStep>];
      setIsTyping(false);
      pushBotMessage({
        text: stepInfo.question,
        suggestions: stepInfo.chips,
      });
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    if (estimator.active) {
      const currentChips =
        ESTIMATOR_STEPS[estimator.step as NonNullable<EstimatorStep>]?.chips ??
        [];
      const isValidChip = currentChips.includes(text.trim());
      if (!isValidChip) {
        setEstimator({ active: false, step: null });
      } else {
        const userMsg: Message = {
          id: `user-${Date.now()}`,
          role: "user",
          text: text.trim(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInputValue("");
        setIsTyping(true);
        setTimeout(() => advanceEstimator(text.trim()), 400);
        return;
      }
    }

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text: text.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    if (
      detectEstimatorTrigger(text.toLowerCase()) ||
      text.toLowerCase() === "trip cost estimator" ||
      text.toLowerCase() === "start over"
    ) {
      const newEst: EstimatorState = { active: true, step: "days" };
      setEstimator(newEst);
      setTimeout(() => {
        setIsTyping(false);
        pushBotMessage({
          text: `🧮 **Trip Cost Estimator**\nLet me help you estimate your trip costs! I'll ask you a few quick questions.\n\n${ESTIMATOR_STEPS.days.question}`,
          suggestions: ESTIMATOR_STEPS.days.chips,
        });
      }, 500);
      return;
    }

    // Build conversation history for Gemini (exclude welcome and estimator messages)
    const history = messages
      .filter((m) => m.id !== "welcome" && !m.estimatorResult)
      .map((m) => ({ role: m.role, text: m.text }));

    try {
      const responseText = await getGeminiResponse(text.trim(), history);
      setIsTyping(false);
      pushBotMessage({
        text: responseText,
        suggestions: GENERIC_SUGGESTIONS,
      });
    } catch (err) {
      console.error("Gemini error (all models failed):", err);
      setIsTyping(false);
      pushBotMessage({
        text: "Sorry, I couldn't connect to the AI right now. Please check your internet connection and try again.",
        suggestions: GENERIC_SUGGESTIONS,
      });
    }
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

  // Suppress unused import warning — BotResult used as return type reference only
  type _BotResult = BotResult;

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
            className="fixed bottom-6 right-6 z-50 w-[390px] max-w-[calc(100vw-1.5rem)] flex flex-col rounded-2xl shadow-2xl border border-border overflow-hidden bg-card"
            style={{ maxHeight: "calc(100vh - 5rem)", height: "600px" }}
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground px-4 py-3.5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-foreground/15 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-display font-semibold text-sm leading-tight">
                    Alappuzha AI Guide
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs opacity-70">
                      Powered by Gemini AI
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  data-ocid="chatbot.secondary_button"
                  type="button"
                  onClick={() => {
                    setEstimator({ active: false, step: null });
                    sendMessage("trip cost estimator");
                  }}
                  className="w-8 h-8 rounded-full hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
                  aria-label="Open trip cost estimator"
                  title="Trip cost estimator"
                >
                  <Calculator className="w-4 h-4" />
                </button>
                <button
                  data-ocid="chatbot.toggle"
                  type="button"
                  onClick={() => sendMessage("Nearby attractions")}
                  className="w-8 h-8 rounded-full hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
                  aria-label="Ask about nearby places"
                  title="Nearby places"
                >
                  <MapPin className="w-4 h-4" />
                </button>
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
            </div>

            {/* Estimator step pill */}
            <AnimatePresence>
              {estimator.active && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-primary/8 border-b border-primary/15 px-4 py-2 flex items-center justify-between flex-shrink-0"
                >
                  <div className="flex items-center gap-2">
                    <Calculator className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-primary">
                      Cost Estimator — Step{" "}
                      {STEP_ORDER.indexOf(estimator.step) + 1} of{" "}
                      {STEP_ORDER.length - 1}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEstimator({ active: false, step: null });
                      pushBotMessage({
                        text: "Estimator cancelled. What else can I help you with?",
                        suggestions: INITIAL_QUICK_REPLIES.slice(0, 4),
                      });
                    }}
                    className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Cancel
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id}>
                  <motion.div
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
                      {msg.estimatorResult && (
                        <EstimatorCard result={msg.estimatorResult} />
                      )}
                    </div>
                  </motion.div>

                  {/* Inline suggestions after bot messages */}
                  {msg.role === "bot" &&
                    msg.suggestions &&
                    msg.suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.2 }}
                        className="flex flex-wrap gap-1.5 mt-2 ml-9"
                      >
                        {msg.suggestions.map((s, idx) => (
                          <button
                            key={`${msg.id}-s${idx}`}
                            data-ocid={`chatbot.suggestion.${idx + 1}`}
                            type="button"
                            onClick={() => sendMessage(s)}
                            disabled={isTyping}
                            className="text-xs px-2.5 py-1 rounded-full border border-primary/25 text-primary hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-primary/5 font-medium"
                          >
                            {s}
                          </button>
                        ))}
                      </motion.div>
                    )}
                </div>
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

            {/* Input */}
            <div className="border-t border-border p-3 flex-shrink-0">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  ref={inputRef}
                  data-ocid="chatbot.input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    estimator.active
                      ? "Select an option above or type to cancel…"
                      : "Ask about places, costs, nearby…"
                  }
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
              <p className="text-[10px] text-muted-foreground text-center mt-2 opacity-60">
                AI-powered travel guide for Alappuzha
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
