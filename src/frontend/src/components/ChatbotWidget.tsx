import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bot,
  Check,
  ChevronDown,
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

// ─── Gemini API ───────────────────────────────────────────────────────────────

const GEMINI_API_KEY = "AIzaSyAsrVCwCFsVmniTLlOtX-8qARmE8H-qVgE";
const GEMINI_MODELS = ["gemini-1.5-flash", "gemini-1.5-flash-8b"];

const SYSTEM_PROMPT = `You are an expert AI travel assistant for Alappuzha (Alleppey), Kerala, India.
You have deep knowledge of tourist places, houseboats, backwaters, food, accommodation, transport, festivals, and budget planning for Alappuzha.
You also handle general queries (coding, academics, casual chat) helpfully.
Be concise but comprehensive. Use bullet points and structure. Be friendly and professional.
Avoid harmful or illegal content. If unsure, say so honestly.`;

interface GeminiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

async function askGemini(
  userText: string,
  history: { role: "user" | "bot"; text: string }[],
): Promise<string> {
  // Build conversation contents (must alternate user/model, start with user)
  const contents: GeminiMessage[] = [];
  for (const m of history.slice(-10)) {
    const role = m.role === "user" ? "user" : "model";
    // Skip consecutive same-role messages
    if (contents.length > 0 && contents[contents.length - 1].role === role)
      continue;
    if (m.text.trim()) contents.push({ role, parts: [{ text: m.text }] });
  }
  // Ensure starts with user
  if (contents.length > 0 && contents[0].role !== "user") contents.shift();
  contents.push({ role: "user", parts: [{ text: userText }] });

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
  };

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(25000),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`[Gemini] ${model} HTTP ${res.status}:`, errText);
        continue;
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
      console.warn(`[Gemini] ${model} empty response:`, JSON.stringify(data));
    } catch (err) {
      console.error(`[Gemini] ${model} error:`, err);
    }
  }

  throw new Error("All Gemini models failed");
}

// ─── Predefined Quick Q&A ─────────────────────────────────────────────────────

const QUICK_QA: { q: string; a: string }[] = [
  {
    q: "What is Alappuzha famous for?",
    a: "Alappuzha (Alleppey) is famous for:\n- **Backwaters & Houseboats**: Kerala's most iconic houseboat cruises\n- **Nehru Trophy Boat Race**: Legendary snake boat race held every August\n- **Alappuzha Beach**: One of Kerala's most popular beaches\n- **Coir Industry**: Traditional coconut fiber products\n- **Kuttanad**: The 'Rice Bowl of Kerala', fields below sea level",
  },
  {
    q: "Best time to visit?",
    a: "**Best time: October to March** (cool weather 22–32°C, all spots open)\n- **August**: Nehru Trophy Boat Race\n- **Monsoon (June–Sept)**: Lush scenery, lower prices\n- **Avoid April–May**: Very hot and humid",
  },
  {
    q: "Houseboat prices?",
    a: "**Houseboat Pricing:**\n- Budget (1 BHK): ₹5,000–₹8,000/night\n- Standard (2 BHK): ₹8,000–₹12,000/night\n- Luxury: ₹12,000–₹20,000+/night\n\nIncludes accommodation, all meals, AC, crew. Typical 22-hour package.",
  },
  {
    q: "How to reach Alappuzha?",
    a: "**By Train**: Alappuzha Railway Station — from Kochi (~1.5 hrs), Trivandrum (~2.5 hrs)\n**By Road**: 85 km from Kochi via NH66\n**By Air**: Cochin International Airport (85 km)\n**By Ferry**: Scenic routes from Kottayam and Kollam",
  },
  {
    q: "Must-try foods?",
    a: "**Must-try in Alappuzha:**\n- Karimeen Pollichathu (Pearl Spot Fish) — signature dish\n- Prawn Curry with coconut milk\n- Appam & Stew\n- Kerala Sadya (feast on banana leaf)\n- Puttu & Kadala Curry",
  },
];

// ─── Topic & Follow-up ────────────────────────────────────────────────────────

const TOPIC_KEYWORDS: Record<string, string[]> = {
  houseboats: ["houseboat", "backwater", "cruise", "boat"],
  food: ["food", "eat", "restaurant", "cuisine", "fish", "seafood"],
  budget: ["budget", "cost", "price", "cheap", "rupee", "₹"],
  transport: ["train", "bus", "auto", "taxi", "ferry", "reach"],
  stays: ["hotel", "resort", "homestay", "stay", "accommodation"],
  itinerary: ["itinerary", "plan", "days", "trip", "tour"],
  beaches: ["beach", "sea", "coast"],
};

const FOLLOWUP_MAP: Record<string, string[]> = {
  houseboats: [
    "Book a houseboat?",
    "Best houseboat routes?",
    "Houseboat cost?",
  ],
  food: ["Best restaurants?", "Must-try dishes?", "Vegetarian options?"],
  budget: ["Budget breakdown?", "Cheap stays?", "Free attractions?"],
  transport: ["Local transport options?", "Auto fare?", "Ferry routes?"],
  stays: ["Best hotels?", "Homestay recommendations?", "Beach resorts?"],
  itinerary: ["2-day plan?", "Family-friendly spots?", "Adventure options?"],
  beaches: ["Beach activities?", "Sunset viewpoints?", "Nearest beach?"],
};

function detectTopic(text: string): string {
  const lower = text.toLowerCase();
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return topic;
  }
  return "";
}

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

function InlineText({ text }: { text: string }): ReactElement {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          // biome-ignore lint/suspicious/noArrayIndexKey: static inline split
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          // biome-ignore lint/suspicious/noArrayIndexKey: static inline split
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        // biome-ignore lint/suspicious/noArrayIndexKey: static inline split
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function renderMarkdown(text: string): ReactElement {
  const lines = text.split("\n");
  const elements: ReactElement[] = [];
  let listItems: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      const items = [...listItems];
      elements.push(
        <ul
          key={`ul-${key++}`}
          className="list-disc list-inside space-y-0.5 my-1.5 pl-1"
        >
          {items.map((item) => (
            <li key={item.slice(0, 40)} className="text-sm leading-relaxed">
              <InlineText text={item} />
            </li>
          ))}
        </ul>,
      );
      listItems = [];
    }
  };

  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      flushList();
      elements.push(<div key={`sp-${key++}`} className="h-1" />);
      continue;
    }
    if (t.startsWith("## ")) {
      flushList();
      elements.push(
        <p key={`h2-${key++}`} className="font-bold text-sm mt-2 mb-0.5">
          <InlineText text={t.slice(3)} />
        </p>,
      );
    } else if (t.startsWith("# ")) {
      flushList();
      elements.push(
        <p key={`h1-${key++}`} className="font-bold text-base mt-2 mb-1">
          <InlineText text={t.slice(2)} />
        </p>,
      );
    } else if (t.match(/^[-•*] /)) {
      listItems.push(t.replace(/^[-•*] /, ""));
    } else {
      flushList();
      elements.push(
        <p key={`p-${key++}`} className="text-sm leading-relaxed">
          <InlineText text={t} />
        </p>,
      );
    }
  }
  flushList();
  return <div className="space-y-0.5">{elements}</div>;
}

// ─── Category Tabs ────────────────────────────────────────────────────────────

const CATEGORIES = [
  { label: "Places", prompt: "Best places to visit in Alappuzha?", emoji: "🏛️" },
  {
    label: "Food",
    prompt: "Must-try foods and restaurants in Alappuzha?",
    emoji: "🍛",
  },
  {
    label: "Stays",
    prompt: "Best accommodation options in Alappuzha?",
    emoji: "🏨",
  },
  {
    label: "Transport",
    prompt: "How to reach Alappuzha and local transport options?",
    emoji: "🚢",
  },
  {
    label: "Itinerary",
    prompt: "Create a 3-day itinerary for Alappuzha",
    emoji: "📅",
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
}

// ─── Bot Message ──────────────────────────────────────────────────────────────

function BotMessage({
  msg,
  isLast,
  onFollowup,
}: { msg: Message; isLast: boolean; onFollowup: (t: string) => void }) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const followups = isLast ? getFollowups(msg.text) : [];
  const copy = () => {
    navigator.clipboard.writeText(msg.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const ts = msg.timestamp.toLocaleTimeString([], {
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
          <div className="bg-muted text-foreground rounded-2xl rounded-tl-sm px-3.5 py-2.5 relative max-w-[90%]">
            {renderMarkdown(msg.text)}
            <AnimatePresence>
              {hovered && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={copy}
                  className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-background border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-muted transition-colors"
                  aria-label="Copy"
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
          <p className="text-[10px] text-muted-foreground mt-0.5 ml-1">{ts}</p>
        </div>
      </div>
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

// ─── Widget ───────────────────────────────────────────────────────────────────

const WELCOME: Message = {
  id: "welcome",
  role: "bot",
  text: "👋 Hi! I'm your **Alappuzha AI Travel Guide**, powered by Gemini AI.\n\nAsk me anything about Alappuzha — places, food, houseboats, itineraries, budget tips, and more!",
  timestamp: new Date(),
};

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHome, setShowHome] = useState(true);
  const [contextTopic, setContextTopic] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    setSpeechSupported(!!SR);
  }, []);

  const msgCount = messages.length;
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new messages
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

      const topic = detectTopic(trimmed);
      if (topic) setContextTopic(topic);
      setShowHome(false);

      const userMsg: Message = {
        id: `u${Date.now()}`,
        role: "user",
        text: trimmed,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      // Check quick Q&A first
      const quickMatch = QUICK_QA.find(
        (qa) =>
          qa.q.toLowerCase() === trimmed.toLowerCase() ||
          trimmed.toLowerCase().includes(qa.q.toLowerCase().replace("?", "")),
      );

      const history = messages
        .filter((m) => m.id !== "welcome" && m.text.trim())
        .map((m) => ({ role: m.role, text: m.text }));

      let responseText = "";
      try {
        if (quickMatch) {
          responseText = quickMatch.a;
        } else {
          responseText = await askGemini(trimmed, history);
        }
      } catch (err) {
        console.error("[Chatbot] Error:", err);
        responseText =
          "Sorry, I'm having trouble connecting to Gemini. Please check your internet connection and try again.";
      }

      const botMsg: Message = {
        id: `b${Date.now()}`,
        role: "bot",
        text: responseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setLoading(false);
    },
    [loading, messages],
  );

  const clearChat = () => {
    setMessages([{ ...WELCOME, timestamp: new Date() }]);
    setShowHome(true);
    setContextTopic("");
    setInput("");
    setLoading(false);
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
    const rec: any = new SR();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      setInput(e.results[0][0].transcript);
      setIsListening(false);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  };

  const panelHeight = expanded ? "min(85vh, 700px)" : "520px";

  return (
    <>
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
                  aria-label={expanded ? "Collapse" : "Expand"}
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
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {showHome && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 mb-1"
                >
                  <div className="flex flex-wrap gap-1.5">
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
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      ⚡ Quick Questions
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_QA.map((qa, idx) => (
                        <button
                          key={qa.q}
                          type="button"
                          data-ocid={`chatbot.button.${idx + 1}`}
                          onClick={() => sendMessage(qa.q)}
                          disabled={loading}
                          className="text-[11px] px-2.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all font-medium disabled:opacity-40 text-left leading-snug"
                        >
                          {qa.q}
                        </button>
                      ))}
                    </div>
                  </div>
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

            {/* Input */}
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
                    aria-label={isListening ? "Stop" : "Voice input"}
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
