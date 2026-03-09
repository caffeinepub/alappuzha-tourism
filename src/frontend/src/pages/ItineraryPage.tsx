import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  Loader2,
  LogIn,
  MapPin,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllTouristPlaces,
  useClearItinerary,
  useMyItinerary,
  useSaveItinerary,
} from "../hooks/useQueries";
import type { ItineraryDayLabel } from "../hooks/useQueries";
import { SAMPLE_PLACES } from "./HomePage";

interface DayPlan {
  day: number;
  dayLabel: string;
  placeIds: bigint[];
}

export default function ItineraryPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isLoggedIn = !!identity;

  const { data: places } = useAllTouristPlaces();
  const { data: savedItinerary, isLoading: isLoadingItinerary } =
    useMyItinerary();
  const saveItinerary = useSaveItinerary();
  const clearItinerary = useClearItinerary();

  const sourcePlaces = places && places.length > 0 ? places : SAMPLE_PLACES;

  const [days, setDays] = useState<DayPlan[]>([
    { day: 1, dayLabel: "Day 1 — Arrival & Backwaters", placeIds: [] },
  ]);

  // Load saved itinerary into local state
  useEffect(() => {
    if (
      savedItinerary &&
      savedItinerary.length > 0 &&
      savedItinerary[0]?.length > 0
    ) {
      const loaded = savedItinerary[0].map((d: ItineraryDayLabel) => ({
        day: Number(d.day),
        dayLabel: d.dayLabel,
        placeIds: d.places,
      }));
      setDays(loaded);
    }
  }, [savedItinerary]);

  const addDay = () => {
    const nextDay = days.length + 1;
    setDays((prev) => [
      ...prev,
      {
        day: nextDay,
        dayLabel: `Day ${nextDay}`,
        placeIds: [],
      },
    ]);
  };

  const removeDay = (dayIndex: number) => {
    setDays((prev) =>
      prev
        .filter((_, i) => i !== dayIndex)
        .map((d, i) => ({ ...d, day: i + 1 })),
    );
  };

  const updateDayLabel = (dayIndex: number, label: string) => {
    setDays((prev) =>
      prev.map((d, i) => (i === dayIndex ? { ...d, dayLabel: label } : d)),
    );
  };

  const addPlaceToDay = (dayIndex: number, placeId: string) => {
    const id = BigInt(placeId);
    setDays((prev) =>
      prev.map((d, i) => {
        if (i !== dayIndex) return d;
        if (d.placeIds.includes(id)) return d;
        return { ...d, placeIds: [...d.placeIds, id] };
      }),
    );
  };

  const removePlaceFromDay = (dayIndex: number, placeId: bigint) => {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? { ...d, placeIds: d.placeIds.filter((id) => id !== placeId) }
          : d,
      ),
    );
  };

  const getPlaceName = (id: bigint) => {
    return (
      sourcePlaces.find((p) => p.id === id)?.name ?? `Place #${id.toString()}`
    );
  };

  const handleSave = async () => {
    try {
      const itinerary: ItineraryDayLabel[][] = [
        days.map((d) => ({
          day: BigInt(d.day),
          dayLabel: d.dayLabel,
          places: d.placeIds,
        })),
      ];
      await saveItinerary.mutateAsync(itinerary);
      toast.success("Itinerary saved successfully!");
    } catch {
      toast.error("Failed to save itinerary. Please try again.");
    }
  };

  const handleClear = async () => {
    try {
      await clearItinerary.mutateAsync();
      setDays([{ day: 1, dayLabel: "Day 1", placeIds: [] }]);
      toast.success("Itinerary cleared.");
    } catch {
      toast.error("Failed to clear itinerary.");
    }
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
            <CalendarDays className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground mb-3">
            Plan Your Trip
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Sign in to create and save a personalised day-by-day itinerary for
            your Alappuzha adventure.
          </p>
          <Button
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

  if (isLoadingItinerary) {
    return (
      <div className="bg-water-mesh min-h-screen flex items-center justify-center">
        <div
          data-ocid="itinerary.loading_state"
          className="text-center space-y-3"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading your itinerary…</p>
        </div>
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
              Trip Planning
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">
              Itinerary Planner
            </h1>
            <p className="text-primary-foreground/75 text-lg">
              Build your perfect day-by-day Kerala adventure.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button
            data-ocid="itinerary.add_day_button"
            onClick={addDay}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Add Day
          </Button>
          <Button
            data-ocid="itinerary.save_button"
            onClick={handleSave}
            disabled={saveItinerary.isPending}
            variant="outline"
            className="gap-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
          >
            {saveItinerary.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Itinerary
          </Button>
          <Button
            data-ocid="itinerary.clear_button"
            onClick={handleClear}
            disabled={clearItinerary.isPending}
            variant="outline"
            className="gap-2 text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground"
          >
            {clearItinerary.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            Clear All
          </Button>
        </div>

        {/* Days */}
        <AnimatePresence>
          {days.length === 0 ? (
            <motion.div
              data-ocid="itinerary.empty_state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 text-muted-foreground"
            >
              <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No days added yet. Click "Add Day" to start planning.</p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {days.map((day, dayIndex) => (
                <motion.div
                  key={`day-${day.day}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-border shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold font-display flex-shrink-0">
                          {day.day}
                        </div>
                        <Input
                          data-ocid="itinerary.day.input"
                          value={day.dayLabel}
                          onChange={(e) =>
                            updateDayLabel(dayIndex, e.target.value)
                          }
                          placeholder={`Day ${day.day} label`}
                          className="font-medium flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDay(dayIndex)}
                          className="text-muted-foreground hover:text-destructive flex-shrink-0"
                          aria-label={`Remove day ${day.day}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Place selector */}
                      <div className="mb-4">
                        <Select
                          onValueChange={(val) => addPlaceToDay(dayIndex, val)}
                        >
                          <SelectTrigger
                            data-ocid="itinerary.day.select"
                            className="w-full"
                          >
                            <SelectValue placeholder="Add a destination…" />
                          </SelectTrigger>
                          <SelectContent>
                            {sourcePlaces.map((place) => (
                              <SelectItem
                                key={place.id.toString()}
                                value={place.id.toString()}
                                disabled={day.placeIds.includes(place.id)}
                              >
                                <span className="flex items-center gap-2">
                                  <MapPin className="w-3.5 h-3.5 text-primary" />
                                  {place.name}
                                  <span className="text-xs text-muted-foreground">
                                    ({place.category})
                                  </span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Added places */}
                      {day.placeIds.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
                          No destinations added yet
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {day.placeIds.map((placeId) => (
                            <Badge
                              key={placeId.toString()}
                              variant="secondary"
                              className="gap-1.5 pr-1.5 pl-3 py-1 text-sm"
                            >
                              <MapPin className="w-3 h-3 text-primary" />
                              {getPlaceName(placeId)}
                              <button
                                type="button"
                                onClick={() =>
                                  removePlaceFromDay(dayIndex, placeId)
                                }
                                className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors"
                                aria-label={`Remove ${getPlaceName(placeId)}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Summary */}
        {days.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-5 bg-card rounded-xl border border-border"
          >
            <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              Trip Summary
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="font-display text-2xl font-bold text-primary">
                  {days.length}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">Days</div>
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-primary">
                  {days.reduce((sum, d) => sum + d.placeIds.length, 0)}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Destinations
                </div>
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-primary">
                  {
                    new Set(
                      days.flatMap((d) =>
                        d.placeIds.map(
                          (id) =>
                            sourcePlaces.find((p) => p.id === id)?.category ??
                            "Other",
                        ),
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
        )}
      </div>
    </div>
  );
}
