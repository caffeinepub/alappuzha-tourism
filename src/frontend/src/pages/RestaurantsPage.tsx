import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Star, UtensilsCrossed } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Restaurant } from "../hooks/useRestaurantsData";
import {
  getRestaurantImage,
  useRestaurantsData,
} from "../hooks/useRestaurantsData";

type Cuisine =
  | "All"
  | "Seafood"
  | "Kerala"
  | "Vegetarian"
  | "Multi-cuisine"
  | "Café";

const PRICE_COLORS: Record<Restaurant["priceRange"], string> = {
  Budget: "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Mid-range": "bg-amber-100 text-amber-700 border-amber-200",
  Premium: "bg-rose-100 text-rose-700 border-rose-200",
};

const CUISINE_COLORS: Record<Exclude<Cuisine, "All">, string> = {
  Seafood: "bg-blue-100 text-blue-700 border-blue-200",
  Kerala: "bg-primary/10 text-primary border-primary/20",
  Vegetarian: "bg-green-100 text-green-700 border-green-200",
  "Multi-cuisine": "bg-purple-100 text-purple-700 border-purple-200",
  Café: "bg-orange-100 text-orange-700 border-orange-200",
};

const FILTERS: Cuisine[] = [
  "All",
  "Seafood",
  "Kerala",
  "Vegetarian",
  "Multi-cuisine",
  "Café",
];
const STAR_INDICES = [0, 1, 2, 3, 4];

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex gap-0.5">
      {STAR_INDICES.map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < stars ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

interface BookingForm {
  name: string;
  date: string;
  time: string;
  guests: string;
  phone: string;
}

const DEFAULT_FORM: BookingForm = {
  name: "",
  date: "",
  time: "",
  guests: "2",
  phone: "",
};

export default function RestaurantsPage() {
  const { items: RESTAURANTS } = useRestaurantsData();
  const [activeFilter, setActiveFilter] = useState<Cuisine>("All");
  const [bookingFor, setBookingFor] = useState<Restaurant | null>(null);
  const [form, setForm] = useState<BookingForm>(DEFAULT_FORM);
  const [submitted, setSubmitted] = useState(false);

  const filtered =
    activeFilter === "All"
      ? RESTAURANTS
      : RESTAURANTS.filter((r) => r.cuisine === activeFilter);

  const openBooking = (r: Restaurant) => {
    setBookingFor(r);
    setForm(DEFAULT_FORM);
    setSubmitted(false);
  };

  const closeBooking = () => {
    setBookingFor(null);
    setSubmitted(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      {/* Header Banner */}
      <section className="bg-primary text-primary-foreground py-14">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <UtensilsCrossed className="w-7 h-7 text-amber-300" />
              <span className="text-xs font-medium tracking-widest uppercase text-amber-300">
                Dining
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
              Restaurants
            </h1>
            <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">
              Fresh seafood, Kerala cuisine, and waterfront dining in Alappuzha
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="sticky top-16 z-40 bg-card/95 backdrop-blur-md border-b border-border shadow-xs">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 py-3 overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                data-ocid="restaurant.filter.tab"
                onClick={() => setActiveFilter(f)}
                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeFilter === f
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 bg-water-mesh">
        <div className="container mx-auto px-4">
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((restaurant, i) => {
              const globalIdx = RESTAURANTS.indexOf(restaurant) + 1;
              const imgSrc = getRestaurantImage(restaurant);
              return (
                <motion.article
                  key={restaurant.name}
                  data-ocid={`restaurant.item.${globalIdx}`}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-border group flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={imgSrc}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${CUISINE_COLORS[restaurant.cuisine]}`}
                      >
                        {restaurant.cuisine}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${PRICE_COLORS[restaurant.priceRange]}`}
                      >
                        {restaurant.priceRange}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <div>
                      <h3 className="font-display font-semibold text-lg text-foreground leading-snug mb-1">
                        {restaurant.name}
                      </h3>
                      <p className="text-primary font-medium text-sm">
                        {restaurant.specialty}
                      </p>
                    </div>

                    <StarRating stars={restaurant.rating} />

                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 flex-1">
                      {restaurant.description}
                    </p>

                    <Button
                      data-ocid={`restaurant.book_button.${globalIdx}`}
                      className="w-full bg-primary hover:bg-primary/90 gap-2 mt-auto"
                      onClick={() => openBooking(restaurant)}
                    >
                      <UtensilsCrossed className="w-4 h-4" />
                      Book a Table
                    </Button>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Booking Dialog */}
      <Dialog
        open={!!bookingFor}
        onOpenChange={(open) => {
          if (!open) closeBooking();
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          data-ocid="restaurant.booking.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {submitted
                ? "Booking Confirmed!"
                : `Book a Table — ${bookingFor?.name}`}
            </DialogTitle>
          </DialogHeader>

          {submitted ? (
            <motion.div
              data-ocid="restaurant.booking.success_state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 py-6 text-center"
            >
              <CheckCircle className="w-16 h-16 text-emerald-500" />
              <div>
                <p className="font-semibold text-lg text-foreground">
                  Table Reserved!
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Your table at <strong>{bookingFor?.name}</strong> has been
                  booked. We'll confirm via your phone number shortly.
                </p>
              </div>
              <Button
                data-ocid="restaurant.booking.close_button"
                onClick={closeBooking}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Done
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="r-name">Your Name</Label>
                <Input
                  id="r-name"
                  data-ocid="restaurant.booking.name_input"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="r-date">Date</Label>
                <Input
                  id="r-date"
                  type="date"
                  data-ocid="restaurant.booking.date_input"
                  value={form.date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, date: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="r-time">Time Slot</Label>
                <Select
                  value={form.time}
                  onValueChange={(v) => setForm((p) => ({ ...p, time: v }))}
                  required
                >
                  <SelectTrigger
                    id="r-time"
                    data-ocid="restaurant.booking.time_select"
                  >
                    <SelectValue placeholder="Choose a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12:00">Lunch — 12:00 PM</SelectItem>
                    <SelectItem value="12:30">Lunch — 12:30 PM</SelectItem>
                    <SelectItem value="13:00">Lunch — 1:00 PM</SelectItem>
                    <SelectItem value="13:30">Lunch — 1:30 PM</SelectItem>
                    <SelectItem value="14:00">Lunch — 2:00 PM</SelectItem>
                    <SelectItem value="14:30">Lunch — 2:30 PM</SelectItem>
                    <SelectItem value="19:00">Dinner — 7:00 PM</SelectItem>
                    <SelectItem value="19:30">Dinner — 7:30 PM</SelectItem>
                    <SelectItem value="20:00">Dinner — 8:00 PM</SelectItem>
                    <SelectItem value="20:30">Dinner — 8:30 PM</SelectItem>
                    <SelectItem value="21:00">Dinner — 9:00 PM</SelectItem>
                    <SelectItem value="21:30">Dinner — 9:30 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="r-guests">Number of Guests</Label>
                <Input
                  id="r-guests"
                  type="number"
                  min="1"
                  max="10"
                  data-ocid="restaurant.booking.guests_input"
                  value={form.guests}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, guests: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="r-phone">Phone Number</Label>
                <Input
                  id="r-phone"
                  type="tel"
                  data-ocid="restaurant.booking.phone_input"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="restaurant.booking.close_button"
                  className="flex-1"
                  onClick={closeBooking}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  data-ocid="restaurant.booking.submit_button"
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Confirm Booking
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
