import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Anchor,
  Binoculars,
  Bird,
  Bus,
  Car,
  Check,
  Church,
  DollarSign,
  Home,
  Minus,
  Plus,
  Ship,
  Star,
  TrendingUp,
  UtensilsCrossed,
  Waves,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type AccommodationType = "budget" | "midrange" | "premium";
type FoodType = "local" | "restaurant" | "finedining";
type TransportType = "bus" | "taxi" | "houseboat_rental";

interface ActivityState {
  houseboat_cruise: boolean;
  beach_activities: boolean;
  heritage_tours: boolean;
  boat_race: boolean;
  bird_watching: boolean;
}

const ACCOMMODATION_OPTIONS = [
  {
    id: "budget" as AccommodationType,
    label: "Budget Guesthouse",
    pricePerNightPerPerson: 800,
    icon: Home,
  },
  {
    id: "midrange" as AccommodationType,
    label: "Mid-range Hotel",
    pricePerNightPerPerson: 2500,
    icon: Star,
  },
  {
    id: "premium" as AccommodationType,
    label: "Premium Resort",
    pricePerNightPerPerson: 7000,
    icon: Anchor,
  },
];

const FOOD_OPTIONS = [
  {
    id: "local" as FoodType,
    label: "Local Meals",
    pricePerDayPerPerson: 300,
    desc: "Street food & local eateries",
  },
  {
    id: "restaurant" as FoodType,
    label: "Restaurant Dining",
    pricePerDayPerPerson: 700,
    desc: "Mid-range restaurants",
  },
  {
    id: "finedining" as FoodType,
    label: "Fine Dining",
    pricePerDayPerPerson: 1500,
    desc: "Premium cuisine experiences",
  },
];

const ACTIVITY_OPTIONS = [
  {
    key: "houseboat_cruise" as keyof ActivityState,
    label: "Backwater Houseboat Cruise",
    cost: (days: number, _: number) => 3500 * days,
    costLabel: "\u20b93,500/day (group)",
    icon: Waves,
  },
  {
    key: "beach_activities" as keyof ActivityState,
    label: "Beach Activities",
    cost: (days: number, people: number) => 500 * days * people,
    costLabel: "\u20b9500/person/day",
    icon: Ship,
  },
  {
    key: "heritage_tours" as keyof ActivityState,
    label: "Heritage Temple Tours",
    cost: (days: number, people: number) => 200 * days * people,
    costLabel: "\u20b9200/person/day",
    icon: Church,
  },
  {
    key: "boat_race" as keyof ActivityState,
    label: "Boat Race Viewing",
    cost: (_: number, people: number) => 1000 * people,
    costLabel: "\u20b91,000/person (one-time)",
    icon: Anchor,
  },
  {
    key: "bird_watching" as keyof ActivityState,
    label: "Bird Watching (Pathiramanal)",
    cost: (days: number, people: number) => 400 * days * people,
    costLabel: "\u20b9400/person/day",
    icon: Bird,
  },
];

const TRANSPORT_OPTIONS = [
  {
    id: "bus" as TransportType,
    label: "Local Bus",
    icon: Bus,
    cost: (days: number, people: number) => 50 * days * people,
    costLabel: "\u20b950/person/day",
  },
  {
    id: "taxi" as TransportType,
    label: "Taxi",
    icon: Car,
    cost: (days: number, _: number) => 1200 * days,
    costLabel: "\u20b91,200/day",
  },
  {
    id: "houseboat_rental" as TransportType,
    label: "Houseboat Rental",
    icon: Waves,
    cost: (days: number, _: number) => 12000 * days,
    costLabel: "\u20b912,000/night",
  },
];

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function CostBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="font-semibold text-foreground">
          {formatINR(value)}
        </span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <div className="text-right text-xs text-muted-foreground">{pct}%</div>
    </div>
  );
}

export default function BudgetPage() {
  const [days, setDays] = useState(3);
  const [groupSize, setGroupSize] = useState(2);
  const [accommodation, setAccommodation] =
    useState<AccommodationType>("midrange");
  const [food, setFood] = useState<FoodType>("restaurant");
  const [activities, setActivities] = useState<ActivityState>({
    houseboat_cruise: true,
    beach_activities: true,
    heritage_tours: false,
    boat_race: false,
    bird_watching: false,
  });
  const [transport, setTransport] = useState<TransportType>("taxi");

  // Calculate costs
  const accommodationCost =
    (ACCOMMODATION_OPTIONS.find((o) => o.id === accommodation)
      ?.pricePerNightPerPerson ?? 0) *
    days *
    groupSize;

  const foodCost =
    (FOOD_OPTIONS.find((o) => o.id === food)?.pricePerDayPerPerson ?? 0) *
    days *
    groupSize;

  const activitiesCost = ACTIVITY_OPTIONS.filter(
    (a) => activities[a.key],
  ).reduce((sum, a) => sum + a.cost(days, groupSize), 0);

  const transportCost =
    TRANSPORT_OPTIONS.find((t) => t.id === transport)?.cost(days, groupSize) ??
    0;

  const grandTotal =
    accommodationCost + foodCost + activitiesCost + transportCost;
  const perPerson = groupSize > 0 ? Math.round(grandTotal / groupSize) : 0;

  const toggleActivity = (key: keyof ActivityState) => {
    setActivities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-water-mesh min-h-screen">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-14">
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
              Budget Calculator
            </h1>
            <p className="text-primary-foreground/75 text-lg">
              Estimate your Alappuzha trip cost instantly.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Controls */}
          <div className="lg:col-span-3 space-y-6">
            {/* Days & Group Size */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Trip Basics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Days */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">
                        Number of Days
                      </Label>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => setDays((d) => Math.max(1, d - 1))}
                          disabled={days <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span
                          data-ocid="budget.days_input"
                          className="font-display text-2xl font-bold text-primary w-8 text-center"
                        >
                          {days}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => setDays((d) => Math.min(14, d + 1))}
                          disabled={days >= 14}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <Slider
                      value={[days]}
                      onValueChange={([val]) => setDays(val)}
                      min={1}
                      max={14}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1 day</span>
                      <span>14 days</span>
                    </div>
                  </div>

                  {/* Group Size */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">
                        Group Size
                      </Label>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() =>
                            setGroupSize((g) => Math.max(1, g - 1))
                          }
                          disabled={groupSize <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span
                          data-ocid="budget.group_size_input"
                          className="font-display text-2xl font-bold text-primary w-8 text-center"
                        >
                          {groupSize}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() =>
                            setGroupSize((g) => Math.min(10, g + 1))
                          }
                          disabled={groupSize >= 10}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <Slider
                      value={[groupSize]}
                      onValueChange={([val]) => setGroupSize(val)}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1 person</span>
                      <span>10 people</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Accommodation */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <Home className="w-5 h-5 text-primary" />
                    Accommodation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    data-ocid="budget.accommodation_select"
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                  >
                    {ACCOMMODATION_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = accommodation === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setAccommodation(opt.id)}
                          aria-pressed={isSelected}
                          className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border hover:border-primary/40 hover:bg-muted/30"
                          }`}
                        >
                          {opt.id === "midrange" && (
                            <span className="absolute -top-2.5 left-3 text-xs font-semibold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full">
                              Popular
                            </span>
                          )}
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="font-semibold text-sm text-foreground">
                            {opt.label}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            \u20b9
                            {opt.pricePerNightPerPerson.toLocaleString("en-IN")}
                            /night/person
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Food */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-primary" />
                    Food & Dining
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    data-ocid="budget.food_select"
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                  >
                    {FOOD_OPTIONS.map((opt) => {
                      const isSelected = food === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setFood(opt.id)}
                          aria-pressed={isSelected}
                          className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border hover:border-primary/40 hover:bg-muted/30"
                          }`}
                        >
                          <div className="font-semibold text-sm text-foreground">
                            {opt.label}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {opt.desc}
                          </div>
                          <div
                            className={`text-sm font-bold mt-2 ${
                              isSelected ? "text-primary" : "text-foreground/70"
                            }`}
                          >
                            \u20b9{opt.pricePerDayPerPerson}/day/person
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Activities */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <Binoculars className="w-5 h-5 text-primary" />
                    Activities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ACTIVITY_OPTIONS.map((opt, idx) => {
                    const Icon = opt.icon;
                    const isChecked = activities[opt.key];
                    const activityCost = isChecked
                      ? opt.cost(days, groupSize)
                      : 0;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        data-ocid={`budget.activities_checkbox.${idx + 1}`}
                        aria-pressed={isChecked}
                        onClick={() => toggleActivity(opt.key)}
                        className={`w-full flex items-center gap-4 p-3.5 rounded-xl border-2 text-left transition-all duration-200 ${
                          isChecked
                            ? "border-primary/50 bg-primary/5"
                            : "border-border hover:border-primary/30 hover:bg-muted/20"
                        }`}
                      >
                        {/* Visual checkbox indicator */}
                        <span
                          className={`w-4.5 h-4.5 rounded flex items-center justify-center flex-shrink-0 border-2 ${
                            isChecked
                              ? "bg-primary border-primary"
                              : "border-muted-foreground/40 bg-background"
                          }`}
                          style={{ width: "1.125rem", height: "1.125rem" }}
                          aria-hidden="true"
                        >
                          {isChecked && (
                            <Check
                              className="w-3 h-3 text-primary-foreground"
                              strokeWidth={3}
                            />
                          )}
                        </span>
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isChecked
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground">
                            {opt.label}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {opt.costLabel}
                          </div>
                        </div>
                        <AnimatePresence>
                          {isChecked && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="text-sm font-bold text-primary flex-shrink-0"
                            >
                              +{formatINR(activityCost)}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>

            {/* Transport */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <Car className="w-5 h-5 text-primary" />
                    Transport
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    data-ocid="budget.transport_select"
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                  >
                    {TRANSPORT_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = transport === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setTransport(opt.id)}
                          aria-pressed={isSelected}
                          className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border hover:border-primary/40 hover:bg-muted/30"
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="font-semibold text-sm text-foreground">
                            {opt.label}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {opt.costLabel}
                          </div>
                          <div
                            className={`text-sm font-bold mt-2 ${
                              isSelected ? "text-primary" : "text-foreground/70"
                            }`}
                          >
                            {formatINR(opt.cost(days, groupSize))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right: Live Cost Summary (sticky) */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              <motion.div
                data-ocid="budget.total_card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="border-primary/20 shadow-lg overflow-hidden">
                  {/* Total header */}
                  <div className="bg-primary text-primary-foreground p-6">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium opacity-80">
                        Estimated Total
                      </span>
                      <Badge className="bg-amber-400 text-amber-950 border-0 text-xs">
                        {days} day{days !== 1 ? "s" : ""} \u00b7 {groupSize}{" "}
                        {groupSize !== 1 ? "people" : "person"}
                      </Badge>
                    </div>
                    <motion.div
                      key={grandTotal}
                      initial={{ scale: 0.97, opacity: 0.7 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.25 }}
                      className="font-display text-4xl font-bold mt-1"
                    >
                      {formatINR(grandTotal)}
                    </motion.div>
                    <div className="text-sm opacity-70 mt-1">
                      {formatINR(perPerson)}{" "}
                      <span className="opacity-80">per person</span>
                    </div>
                  </div>

                  <CardContent className="p-6 space-y-5">
                    {/* Category breakdown bars */}
                    <div className="space-y-4">
                      <h4 className="font-display font-semibold text-sm text-foreground">
                        Cost Breakdown
                      </h4>
                      <CostBar
                        label="Accommodation"
                        value={accommodationCost}
                        total={grandTotal}
                        color="bg-primary"
                      />
                      <CostBar
                        label="Food & Dining"
                        value={foodCost}
                        total={grandTotal}
                        color="bg-amber-400"
                      />
                      <CostBar
                        label="Activities"
                        value={activitiesCost}
                        total={grandTotal}
                        color="bg-emerald-500"
                      />
                      <CostBar
                        label="Transport"
                        value={transportCost}
                        total={grandTotal}
                        color="bg-sky-500"
                      />
                    </div>

                    {/* Itemized */}
                    <div className="border-t border-border pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Accommodation
                        </span>
                        <span className="font-medium">
                          {formatINR(accommodationCost)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Food</span>
                        <span className="font-medium">
                          {formatINR(foodCost)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Activities
                        </span>
                        <span className="font-medium">
                          {formatINR(activitiesCost)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Transport</span>
                        <span className="font-medium">
                          {formatINR(transportCost)}
                        </span>
                      </div>
                      <div className="border-t border-border pt-3 flex justify-between font-display font-bold text-base">
                        <span>Grand Total</span>
                        <span className="text-primary">
                          {formatINR(grandTotal)}
                        </span>
                      </div>
                    </div>

                    {/* Visual proportion bar */}
                    <div className="bg-muted/40 rounded-xl p-4">
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Budget Proportion
                      </h5>
                      <div className="flex h-6 rounded-full overflow-hidden gap-0.5">
                        {[
                          { val: accommodationCost, color: "bg-primary" },
                          { val: foodCost, color: "bg-amber-400" },
                          { val: activitiesCost, color: "bg-emerald-500" },
                          { val: transportCost, color: "bg-sky-500" },
                        ]
                          .filter((s) => s.val > 0)
                          .map((segment, i) => (
                            <motion.div
                              // biome-ignore lint/suspicious/noArrayIndexKey: stacked bar segments, position-based identity
                              key={i}
                              className={`${segment.color} h-full`}
                              initial={{ flex: 0 }}
                              animate={{
                                flex:
                                  grandTotal > 0 ? segment.val / grandTotal : 0,
                              }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                            />
                          ))}
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 mt-3">
                        {[
                          { label: "Accommodation", color: "bg-primary" },
                          { label: "Food", color: "bg-amber-400" },
                          { label: "Activities", color: "bg-emerald-500" },
                          { label: "Transport", color: "bg-sky-500" },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="flex items-center gap-1.5"
                          >
                            <div
                              className={`w-2.5 h-2.5 rounded-full ${item.color} flex-shrink-0`}
                            />
                            <span className="text-xs text-muted-foreground">
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-start gap-2">
                        <DollarSign className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-amber-800 mb-1">
                            Money Saving Tips
                          </p>
                          <p className="text-xs text-amber-700 leading-relaxed">
                            Book houseboats in advance for 20-30% discounts.
                            Travel off-peak (Apr-May, Sep) for lower hotel
                            rates. Local buses save significantly on transport.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
