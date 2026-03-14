import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  CalendarDays,
  Clock,
  Download,
  Loader2,
  LogIn,
  MapPin,
  RefreshCw,
  Sparkles,
  Star,
  Wand2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAllTouristPlaces } from "../hooks/useQueries";
import { SAMPLE_PLACES } from "./HomePage";

const INTEREST_OPTIONS = [
  { label: "Backwaters", icon: "🚤", category: "Backwaters" },
  { label: "Beaches", icon: "🏖️", category: "Beach" },
  { label: "Heritage", icon: "🏛️", category: "Heritage" },
  { label: "Nature", icon: "🌿", category: "Nature" },
  { label: "Culture", icon: "🎭", category: "Culture" },
  { label: "Temples", icon: "🛕", category: "Temple" },
  { label: "Islands", icon: "🏝️", category: "Island" },
];

const PACE_OPTIONS = [
  {
    value: "relaxed",
    label: "Relaxed",
    desc: "2-3 places/day",
    placesPerDay: 2,
  },
  {
    value: "balanced",
    label: "Balanced",
    desc: "3-4 places/day",
    placesPerDay: 3,
  },
  { value: "packed", label: "Packed", desc: "4-5 places/day", placesPerDay: 5 },
];

const TIME_SLOTS = ["Morning", "Afternoon", "Evening"];

interface GeneratedDay {
  day: number;
  label: string;
  places: Array<{
    id: bigint;
    name: string;
    category: string;
    description: string;
    timeSlot: string;
  }>;
}

function generateItinerary(
  days: number,
  interests: string[],
  pace: string,
  sourcePlaces: typeof SAMPLE_PLACES,
): GeneratedDay[] {
  const paceOption =
    PACE_OPTIONS.find((p) => p.value === pace) ?? PACE_OPTIONS[1];
  const placesPerDay = paceOption.placesPerDay;

  // Filter by interests, fallback to all if none selected
  const filtered =
    interests.length === 0
      ? [...sourcePlaces]
      : sourcePlaces.filter((p) => interests.includes(p.category));

  // If filtered is empty, use all
  const pool = filtered.length > 0 ? [...filtered] : [...sourcePlaces];

  // Shuffle pool for variety
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const dayLabels = [
    "Arrival & Backwaters",
    "Beaches & Heritage",
    "Nature & Culture",
    "Temple Trails",
    "Island Escape",
    "Hidden Gems",
    "Farewell Day",
  ];

  const result: GeneratedDay[] = [];
  let poolIndex = 0;

  for (let d = 0; d < days; d++) {
    const dayPlaces: GeneratedDay["places"] = [];
    const slots = TIME_SLOTS.slice(0, placesPerDay > 3 ? 3 : placesPerDay);

    for (let s = 0; s < Math.min(placesPerDay, pool.length); s++) {
      const place = pool[poolIndex % pool.length];
      poolIndex++;
      dayPlaces.push({
        id: place.id,
        name: place.name,
        category: place.category,
        description: place.description,
        timeSlot: slots[s % slots.length],
      });
    }

    result.push({
      day: d + 1,
      label:
        d === 0
          ? "Arrival & First Impressions"
          : d === days - 1
            ? "Final Day & Departure"
            : dayLabels[d % dayLabels.length],
      places: dayPlaces,
    });
  }

  return result;
}

const CATEGORY_COLORS: Record<string, string> = {
  Backwaters: "bg-blue-100 text-blue-700",
  Beach: "bg-yellow-100 text-yellow-700",
  Heritage: "bg-orange-100 text-orange-700",
  Nature: "bg-green-100 text-green-700",
  Culture: "bg-purple-100 text-purple-700",
  Temple: "bg-red-100 text-red-700",
  Island: "bg-teal-100 text-teal-700",
};

const TIME_ICONS: Record<string, string> = {
  Morning: "🌅",
  Afternoon: "☀️",
  Evening: "🌇",
};

export default function ItineraryPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isLoggedIn = !!identity;

  const { data: places } = useAllTouristPlaces();
  const sourcePlaces = places && places.length > 0 ? places : SAMPLE_PLACES;

  const [numDays, setNumDays] = useState(3);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedPace, setSelectedPace] = useState("balanced");
  const [generatedItinerary, setGeneratedItinerary] = useState<
    GeneratedDay[] | null
  >(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleInterest = (category: string) => {
    setSelectedInterests((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setGeneratedItinerary(null);
    // Small delay for animation effect
    setTimeout(() => {
      const result = generateItinerary(
        numDays,
        selectedInterests,
        selectedPace,
        sourcePlaces,
      );
      setGeneratedItinerary(result);
      setIsGenerating(false);
      toast.success(`${numDays}-day itinerary generated!`);
    }, 800);
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    setGeneratedItinerary(null);
    setTimeout(() => {
      const result = generateItinerary(
        numDays,
        selectedInterests,
        selectedPace,
        sourcePlaces,
      );
      setGeneratedItinerary(result);
      setIsGenerating(false);
      toast.success("New itinerary generated!");
    }, 600);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isLoggedIn) {
    return (
      <div className="bg-water-mesh min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Wand2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground mb-3">
            Itinerary Generator
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Sign in to generate a personalised day-by-day itinerary for your
            Alappuzha adventure automatically.
          </p>
          <Button
            data-ocid="itinerary.login_button"
            onClick={login}
            disabled={isLoggingIn}
            size="lg"
            className="bg-primary hover:bg-primary/90 gap-2"
          >
            {isLoggingIn ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            Sign In to Continue
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-water-mesh min-h-screen">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-medium tracking-widest uppercase text-primary-foreground/60 mb-2 block">
              Smart Planning
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-2 flex items-center gap-3">
              <Wand2 className="w-9 h-9" />
              Itinerary Generator
            </h1>
            <p className="text-primary-foreground/75 text-lg">
              Tell us your preferences and we'll build your perfect Kerala trip.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Setup Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-border shadow-sm mb-8">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Customize Your Trip
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Duration */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="font-medium text-foreground flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    Trip Duration
                  </div>
                  <span className="font-display text-xl font-bold text-primary">
                    {numDays} {numDays === 1 ? "Day" : "Days"}
                  </span>
                </div>
                <Slider
                  data-ocid="itinerary.days_slider"
                  min={1}
                  max={7}
                  step={1}
                  value={[numDays]}
                  onValueChange={([v]) => setNumDays(v)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1 day</span>
                  <span>7 days</span>
                </div>
              </div>

              {/* Interests */}
              <div>
                <div className="font-medium text-foreground flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-primary" />
                  Interests
                  <span className="text-xs text-muted-foreground font-normal">
                    (optional — select all that apply)
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((opt) => (
                    <button
                      key={opt.category}
                      type="button"
                      data-ocid="itinerary.interest.toggle"
                      onClick={() => toggleInterest(opt.category)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                        selectedInterests.includes(opt.category)
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      <span>{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pace */}
              <div>
                <div className="font-medium text-foreground flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-primary" />
                  Travel Pace
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {PACE_OPTIONS.map((pace) => (
                    <button
                      key={pace.value}
                      type="button"
                      data-ocid="itinerary.pace.toggle"
                      onClick={() => setSelectedPace(pace.value)}
                      className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                        selectedPace === pace.value
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-card text-foreground border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="font-semibold text-sm">{pace.label}</div>
                      <div
                        className={`text-xs mt-0.5 ${
                          selectedPace === pace.value
                            ? "text-primary-foreground/75"
                            : "text-muted-foreground"
                        }`}
                      >
                        {pace.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                data-ocid="itinerary.generate_button"
                onClick={handleGenerate}
                disabled={isGenerating}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 gap-2 text-base font-semibold"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating your itinerary…
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Generate My Itinerary
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loading */}
        {isGenerating && (
          <div
            data-ocid="itinerary.loading_state"
            className="text-center py-16 space-y-3"
          >
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">
              Crafting your perfect itinerary…
            </p>
          </div>
        )}

        {/* Generated Itinerary */}
        <AnimatePresence>
          {generatedItinerary && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Action bar */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Your {numDays}-Day Alappuzha Trip
                </h2>
                <div className="flex gap-2">
                  <Button
                    data-ocid="itinerary.regenerate_button"
                    onClick={handleRegenerate}
                    variant="outline"
                    size="sm"
                    className="gap-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </Button>
                  <Button
                    data-ocid="itinerary.download_button"
                    onClick={handlePrint}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Print
                  </Button>
                </div>
              </div>

              <div className="space-y-5">
                {generatedItinerary.map((day, i) => (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                  >
                    <Card className="border-border shadow-sm overflow-hidden">
                      <div className="bg-primary/5 border-b border-border px-5 py-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-bold text-sm flex-shrink-0">
                          {day.day}
                        </div>
                        <div>
                          <div className="font-display font-semibold text-foreground text-sm">
                            Day {day.day}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {day.label}
                          </div>
                        </div>
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {day.places.length} stops
                        </Badge>
                      </div>
                      <CardContent className="p-0">
                        {day.places.map((place, pi) => (
                          <div
                            key={`${day.day}-${place.id.toString()}`}
                            className={`flex items-start gap-4 px-5 py-4 ${
                              pi < day.places.length - 1
                                ? "border-b border-border/60"
                                : ""
                            }`}
                          >
                            <div className="w-8 text-center flex-shrink-0 pt-0.5">
                              <span className="text-lg">
                                {TIME_ICONS[place.timeSlot] ?? "📍"}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-foreground text-sm">
                                  {place.name}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    CATEGORY_COLORS[place.category] ??
                                    "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {place.category}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {place.description}
                              </p>
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {place.timeSlot}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Summary */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 p-5 bg-card rounded-xl border border-border"
              >
                <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  Trip Summary
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="font-display text-2xl font-bold text-primary">
                      {numDays}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Days
                    </div>
                  </div>
                  <div>
                    <div className="font-display text-2xl font-bold text-primary">
                      {generatedItinerary.reduce(
                        (sum, d) => sum + d.places.length,
                        0,
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Destinations
                    </div>
                  </div>
                  <div>
                    <div className="font-display text-2xl font-bold text-primary">
                      {
                        new Set(
                          generatedItinerary.flatMap((d) =>
                            d.places.map((p) => p.category),
                          ),
                        ).size
                      }
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Categories
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
