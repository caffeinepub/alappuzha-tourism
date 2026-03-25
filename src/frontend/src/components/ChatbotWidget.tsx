import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bot,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Maximize2,
  MessageCircle,
  Mic,
  MicOff,
  Minimize2,
  RefreshCw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  type ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

// ─── Gemini API Setup ────────────────────────────────────────────────────────

const GEMINI_API_KEY = "AIzaSyDVkr9yIxvVYeEzhzf8YGCY1kIX5AqWwAA";
const GEMINI_MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-1.5-pro",
];

const BASE_SYSTEM_INSTRUCTION = `You are an expert AI travel assistant for Alappuzha (Alleppey), Kerala, India. You have deep knowledge of:
- Tourist places: backwaters, beaches, temples, museums, festivals (Nehru Trophy Boat Race, Onam)
- Houseboats: types, pricing (₹5,000–₹20,000/night), booking tips, best routes
- Accommodation: hotels, resorts, homestays, budget guesthouses
- Food: Kerala cuisine, seafood, local restaurants, must-try dishes (fish curry, karimeen, appam)
- Transport: trains (Alappuzha railway station), buses, autos, boat services, ferries
- Budget planning: budget/mid-range/luxury options with INR estimates
- Itinerary planning: 1-day to 7-day detailed schedules
- Best time: October–March (peak season), monsoon charm June–September
- Nearby attractions: Kochi (85km), Kollam, Kumarakom

You also handle general queries (coding, academics, casual chat) with a helpful ChatGPT-like tone.

Rules:
- Be concise but comprehensive. Use bullet points and structure.
- Always give practical, actionable advice.
- For bookings, suggest Booking.com or MakeMyTrip.
- Avoid harmful/illegal content.
- If unsure, say so honestly.`;

interface GeminiContent {
  role: "user" | "model";
  parts: { text: string }[];
}

async function callGemini(
  model: string,
  contents: GeminiContent[],
  systemInstruction: string,
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
      }),
    });
    clearTimeout(timer);
    if (!res.ok) {
      const err = await res.text();
      console.error(`[Gemini] ${model} → ${res.status}:`, err);
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty response");
    return text;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function getAIResponse(
  userText: string,
  history: { role: "user" | "bot"; text: string }[],
  contextTopic: string,
): Promise<string> {
  const systemInstruction = contextTopic
    ? `${BASE_SYSTEM_INSTRUCTION}\n\nContext: The user has been asking about [${contextTopic}]. Tailor your response accordingly.`
    : BASE_SYSTEM_INSTRUCTION;

  const contents: GeminiContent[] = [];
  for (const m of history.slice(-10)) {
    const role = m.role === "user" ? "user" : "model";
    if (contents.length > 0 && contents[contents.length - 1].role === role)
      continue;
    contents.push({ role, parts: [{ text: m.text }] });
  }
  if (contents.length > 0 && contents[0].role !== "user") contents.shift();
  contents.push({ role: "user", parts: [{ text: userText }] });

  for (const model of GEMINI_MODELS) {
    try {
      const result = await callGemini(model, contents, systemInstruction);
      return result;
    } catch (err) {
      console.warn(`[Gemini] ${model} failed:`, err);
    }
  }
  throw new Error("All Gemini models failed");
}

// ─── Topic Detection ──────────────────────────────────────────────────────────

const TOPIC_KEYWORDS: Record<string, string[]> = {
  houseboats: ["houseboat", "backwater", "cruise", "boat", "kettuvallam"],
  food: [
    "food",
    "eat",
    "restaurant",
    "cuisine",
    "dish",
    "karimeen",
    "appam",
    "fish",
    "seafood",
    "meal",
  ],
  temples: ["temple", "church", "mosque", "shrine", "puja", "festival"],
  budget: [
    "budget",
    "cost",
    "price",
    "cheap",
    "expensive",
    "money",
    "rupee",
    "₹",
  ],
  transport: [
    "train",
    "bus",
    "auto",
    "taxi",
    "ferry",
    "reach",
    "travel",
    "transport",
  ],
  stays: [
    "hotel",
    "resort",
    "homestay",
    "stay",
    "accommodation",
    "room",
    "book",
  ],
  itinerary: ["itinerary", "plan", "schedule", "days", "trip", "tour"],
  beaches: ["beach", "sea", "coast", "shore", "alappuzha beach"],
};

function detectTopic(text: string): string {
  const lower = text.toLowerCase();
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return topic;
  }
  return "";
}

// ─── Follow-up Suggestions ────────────────────────────────────────────────────

const FOLLOWUP_MAP: Record<string, string[]> = {
  houseboats: [
    "Book a houseboat?",
    "Houseboat cost?",
    "Best houseboat routes?",
  ],
  food: ["Best restaurants?", "Must-try dishes?", "Vegetarian options?"],
  temples: ["Temple timings?", "Dress code?", "Other religious sites?"],
  budget: ["Budget breakdown?", "Cheap stays?", "Free attractions?"],
  transport: ["How to reach?", "Local transport options?", "Auto fare?"],
  stays: ["Best hotels?", "Homestay recommendations?", "Beach resorts?"],
  itinerary: ["2-day plan?", "Family-friendly spots?", "Adventure options?"],
  beaches: ["Beach activities?", "Nearest beach?", "Sunset viewpoint?"],
};

function getFollowups(botText: string): string[] {
  const lower = botText.toLowerCase();
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return FOLLOWUP_MAP[topic] || [];
    }
  }
  return ["Tell me more?", "Any tips?", "What's nearby?"];
}

// ─── Markdown Renderer ────────────────────────────────────────────────────────

function renderMarkdown(text: string): ReactElement {
  const lines = text.split("\n");
  const elements: ReactElement[] = [];
  let listItems: string[] = [];
  let orderedItems: string[] = [];
  let keyCounter = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul
          key={`ul-${keyCounter++}`}
          className="list-disc list-inside space-y-0.5 my-1.5 pl-1"
        >
          {listItems.map((item, i) => (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: markdown list items have no stable id
              key={i}
              className="text-sm leading-relaxed"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: safe formatted text
              dangerouslySetInnerHTML={{ __html: inlineFormat(item) }}
            />
          ))}
        </ul>,
      );
      listItems = [];
    }
    if (orderedItems.length > 0) {
      elements.push(
        <ol
          key={`ol-${keyCounter++}`}
          className="list-decimal list-inside space-y-0.5 my-1.5 pl-1"
        >
          {orderedItems.map((item, i) => (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: markdown list items have no stable id
              key={i}
              className="text-sm leading-relaxed"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: safe formatted text
              dangerouslySetInnerHTML={{ __html: inlineFormat(item) }}
            />
          ))}
        </ol>,
      );
      orderedItems = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      elements.push(<div key={`sp-${keyCounter++}`} className="h-1" />);
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <p
          key={`h3-${keyCounter++}`}
          className="font-semibold text-sm mt-2 mb-0.5"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: safe formatted text
          dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed.slice(4)) }}
        />,
      );
    } else if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <p
          key={`h2-${keyCounter++}`}
          className="font-bold text-sm mt-2 mb-0.5"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: safe formatted text
          dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed.slice(3)) }}
        />,
      );
    } else if (trimmed.startsWith("# ")) {
      flushList();
      elements.push(
        <p
          key={`h1-${keyCounter++}`}
          className="font-bold text-base mt-2 mb-1"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: safe formatted text
          dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed.slice(2)) }}
        />,
      );
    } else if (trimmed.match(/^[-•*] /)) {
      if (orderedItems.length > 0) flushList();
      listItems.push(trimmed.replace(/^[-•*] /, ""));
    } else if (trimmed.match(/^\d+\. /)) {
      if (listItems.length > 0) flushList();
      orderedItems.push(trimmed.replace(/^\d+\. /, ""));
    } else {
      flushList();
      elements.push(
        <p
          key={`p-${keyCounter++}`}
          className="text-sm leading-relaxed"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: safe formatted text
          dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed) }}
        />,
      );
    }
  }
  flushList();
  return <div className="space-y-0.5">{elements}</div>;
}

function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(
      /`(.+?)`/g,
      '<code class="bg-black/10 rounded px-1 text-xs font-mono">$1</code>',
    );
}

// ─── Category Tabs ────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    label: "Places",
    prompt: "Tell me the best places to visit in Alappuzha",
    emoji: "🏛️",
  },
  {
    label: "Food",
    prompt: "What are the must-try foods and restaurants in Alappuzha?",
    emoji: "🍛",
  },
  {
    label: "Stays",
    prompt: "What are the best accommodation options in Alappuzha?",
    emoji: "🏨",
  },
  {
    label: "Transport",
    prompt: "How to reach Alappuzha and what are local transport options?",
    emoji: "🚢",
  },
  {
    label: "Itinerary",
    prompt: "Create a 3-day itinerary for Alappuzha",
    emoji: "📅",
  },
];

// ─── Typing Animation Hook ────────────────────────────────────────────────────

function useTypingAnimation(fullText: string, active: boolean) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active || !fullText) {
      setDisplayed(fullText);
      setDone(true);
      return;
    }
    setDisplayed("");
    setDone(false);
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setDisplayed(fullText.slice(0, idx));
      if (idx >= fullText.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, 12);
    return () => clearInterval(interval);
  }, [fullText, active]);

  return { displayed, done };
}

// ─── Message Types ────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
  animate?: boolean;
}

// ─── Bot Message Component ────────────────────────────────────────────────────

function BotMessage({
  msg,
  isLast,
  onFollowup,
}: {
  msg: Message;
  isLast: boolean;
  onFollowup: (text: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { displayed, done } = useTypingAnimation(msg.text, !!msg.animate);
  const followups = isLast && done ? getFollowups(msg.text) : [];

  const copy = () => {
    navigator.clipboard.writeText(msg.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const timestamp = msg.timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col gap-1">
      <div
        className="flex items-start gap-2"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-muted text-foreground rounded-2xl rounded-tl-sm px-3.5 py-2.5 relative group max-w-[90%]">
            {renderMarkdown(displayed)}
            <AnimatePresence>
              {hovered && done && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={copy}
                  className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-background border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-muted transition-colors"
                  aria-label="Copy message"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3 text-muted-foreground" />
                  )}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 ml-1">
            {timestamp}
          </p>
        </div>
      </div>

      {/* Follow-up chips */}
      <AnimatePresence>
        {followups.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-wrap gap-1.5 ml-9"
          >
            {followups.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onFollowup(f)}
                className="text-[11px] px-2.5 py-1 rounded-full border border-primary/25 text-primary hover:bg-primary hover:text-primary-foreground transition-colors bg-primary/5 font-medium"
              >
                {f}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Widget ──────────────────────────────────────────────────────────────

const WELCOME: Message = {
  id: "welcome",
  role: "bot",
  text: "👋 Hi! I'm your **Alappuzha AI Travel Guide**, powered by Gemini AI.\n\nAsk me anything about Alappuzha — places to visit, food, houseboats, itineraries, budget tips, and more!",
  timestamp: new Date(),
};

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const [contextTopic, setContextTopic] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Check speech support
  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    setSpeechSupported(!!SR);
  }, []);

  const msgCount = messages.length;
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when messages or loading changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgCount, loading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setShowCategories(false);
      const topic = detectTopic(trimmed);
      if (topic) setContextTopic(topic);

      const userMsg: Message = {
        id: `u${Date.now()}`,
        role: "user",
        text: trimmed,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      try {
        const history = messages
          .filter((m) => m.id !== "welcome")
          .map((m) => ({ role: m.role, text: m.text }));
        const reply = await getAIResponse(trimmed, history, contextTopic);
        setMessages((prev) => [
          ...prev,
          {
            id: `b${Date.now()}`,
            role: "bot",
            text: reply,
            timestamp: new Date(),
            animate: true,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `b${Date.now()}`,
            role: "bot",
            text: "Sorry, I'm having trouble connecting. Please check your internet and try again.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, contextTopic],
  );

  const clearChat = () => {
    setMessages([{ ...WELCOME, timestamp: new Date() }]);
    setShowCategories(true);
    setContextTopic("");
    setInput("");
  };

  const toggleVoice = () => {
    if (!speechSupported) return;
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition: any = new SR();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const panelHeight = expanded ? "min(85vh, 700px)" : "520px";

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            type="button"
            data-ocid="chatbot.open_modal_button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            aria-label="Open AI chat"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            data-ocid="chatbot.dialog"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-1.5rem)] flex flex-col rounded-2xl shadow-2xl border border-border bg-card overflow-hidden"
            style={{
              height: panelHeight,
              maxHeight: "calc(100vh - 5rem)",
              transition: "height 0.3s ease",
            }}
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm leading-tight">
                    Alappuzha AI Guide
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs opacity-70">
                      Powered by Gemini AI
                    </span>
                    {contextTopic && (
                      <span className="text-[10px] opacity-60 bg-white/10 rounded-full px-1.5 py-px">
                        #{contextTopic}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  data-ocid="chatbot.secondary_button"
                  onClick={clearChat}
                  className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Clear chat"
                  title="Clear chat"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label={expanded ? "Collapse chat" : "Expand chat"}
                  title={expanded ? "Collapse" : "Expand"}
                >
                  {expanded ? (
                    <Minimize2 className="w-3.5 h-3.5" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  data-ocid="chatbot.close_button"
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Category tabs (shown before first user msg) */}
              {showCategories && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-1.5 mb-1"
                >
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.label}
                      type="button"
                      data-ocid="chatbot.tab"
                      onClick={() => sendMessage(cat.prompt)}
                      disabled={loading}
                      className="text-xs px-2.5 py-1.5 rounded-full border border-border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all font-medium disabled:opacity-40 flex items-center gap-1"
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}

              {messages.map((msg, idx) => {
                const isLast = idx === messages.length - 1;
                if (msg.role === "user") {
                  const ts = msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex justify-end"
                    >
                      <div className="flex flex-col items-end gap-0.5">
                        <div className="max-w-[80%] rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-sm leading-relaxed bg-primary text-primary-foreground">
                          {msg.text}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {ts}
                        </p>
                      </div>
                    </motion.div>
                  );
                }
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <BotMessage
                      msg={msg}
                      isLast={isLast}
                      onFollowup={sendMessage}
                    />
                  </motion.div>
                );
              })}

              {/* Typing indicator */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                    data-ocid="chatbot.loading_state"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                      {[0, 150, 300].map((delay) => (
                        <span
                          key={delay}
                          className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            {/* Voice listening indicator */}
            <AnimatePresence>
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-primary/10 border-t border-primary/20 px-4 py-2 flex items-center gap-2 text-primary text-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Listening...
                  <ChevronDown className="w-3 h-3 ml-auto opacity-50" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input area */}
            <div className="border-t border-border p-3 flex-shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                }}
                className="flex gap-2"
              >
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    isListening
                      ? "Listening..."
                      : "Ask anything about Alappuzha…"
                  }
                  disabled={loading}
                  data-ocid="chatbot.input"
                  className="flex-1 text-sm rounded-xl border-primary/20 focus:border-primary"
                />
                {speechSupported && (
                  <Button
                    type="button"
                    size="icon"
                    variant={isListening ? "destructive" : "outline"}
                    onClick={toggleVoice}
                    disabled={loading}
                    className="rounded-xl w-9 h-9 flex-shrink-0"
                    aria-label={isListening ? "Stop listening" : "Voice input"}
                  >
                    {isListening ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </Button>
                )}
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || loading}
                  data-ocid="chatbot.submit_button"
                  className="bg-primary hover:bg-primary/90 rounded-xl w-9 h-9 flex-shrink-0"
                  aria-label="Send"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <p className="text-[10px] text-muted-foreground text-center mt-2 opacity-60">
                Gemini AI • Alappuzha Tourism Guide
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
