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
import { Anchor, Bike, Bus, Car, CheckCircle, Ship, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useTransportData } from "../hooks/useTransportData";
import type { TransportItem } from "../hooks/useTransportData";

type TransportCategory = "All" | "Boat" | "Road" | "Cycle";

interface TransportOption extends TransportItem {
  icon: React.ReactNode;
}

function getIcon(type: string, category: string): React.ReactNode {
  const t = type.toLowerCase();
  if (t.includes("houseboat") || t.includes("ferry"))
    return <Ship className="w-5 h-5" />;
  if (t.includes("shikara") || t.includes("boat"))
    return <Anchor className="w-5 h-5" />;
  if (t.includes("motor")) return <Zap className="w-5 h-5" />;
  if (t.includes("taxi") || t.includes("cab"))
    return <Car className="w-5 h-5" />;
  if (t.includes("bicycle") || t.includes("bike") || t.includes("cycle"))
    return <Bike className="w-5 h-5" />;
  if (category === "Boat") return <Ship className="w-5 h-5" />;
  if (category === "Road") return <Bus className="w-5 h-5" />;
  return <Bike className="w-5 h-5" />;
}

const CATEGORY_COLORS: Record<Exclude<TransportCategory, "All">, string> = {
  Boat: "bg-blue-100 text-blue-700 border-blue-200",
  Road: "bg-amber-100 text-amber-700 border-amber-200",
  Cycle: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const FILTERS: TransportCategory[] = ["All", "Boat", "Road", "Cycle"];

interface BookingForm {
  name: string;
  date: string;
  passengers: string;
  duration: string;
  phone: string;
}

const DEFAULT_FORM: BookingForm = {
  name: "",
  date: "",
  passengers: "2",
  duration: "",
  phone: "",
};

export default function TransportPage() {
  const { items } = useTransportData();
  const [activeFilter, setActiveFilter] = useState<TransportCategory>("All");
  const [bookingFor, setBookingFor] = useState<TransportOption | null>(null);
  const [form, setForm] = useState<BookingForm>(DEFAULT_FORM);
  const [submitted, setSubmitted] = useState(false);

  const allOptions: TransportOption[] = items.map((item) => ({
    ...item,
    icon: getIcon(item.type, item.category),
  }));

  const filtered =
    activeFilter === "All"
      ? allOptions
      : allOptions.filter((t) => t.category === activeFilter);

  const openBooking = (t: TransportOption) => {
    setBookingFor(t);
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
              <Anchor className="w-7 h-7 text-amber-300" />
              <span className="text-xs font-medium tracking-widest uppercase text-amber-300">
                Getting Around
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
              Transportation
            </h1>
            <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">
              Houseboats, shikaras, ferries, taxis, and cycles — explore
              Alappuzha your way
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
                data-ocid="transport.filter.tab"
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
            {filtered.map((transport, i) => {
              const globalIdx = allOptions.indexOf(transport) + 1;
              return (
                <motion.article
                  key={transport.name}
                  data-ocid={`transport.item.${globalIdx}`}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-border group flex flex-col"
                >
                  {/* Colored top band */}
                  <div className="h-3 bg-primary" />

                  <div className="p-5 flex flex-col gap-3 flex-1">
                    {/* Icon + Category */}
                    <div className="flex items-start justify-between">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        {transport.icon}
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${CATEGORY_COLORS[transport.category]}`}
                      >
                        {transport.category}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display font-semibold text-lg text-foreground leading-snug mb-0.5">
                        {transport.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {transport.type}
                      </p>
                      <p className="text-primary font-bold text-sm mt-1">
                        {transport.priceRange}
                      </p>
                    </div>

                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 flex-1">
                      {transport.description}
                    </p>

                    <p className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
                      👥 Capacity: {transport.capacity}
                    </p>

                    <Button
                      data-ocid={`transport.book_button.${globalIdx}`}
                      className="w-full bg-primary hover:bg-primary/90 gap-2 mt-auto"
                      onClick={() => openBooking(transport)}
                    >
                      <Anchor className="w-4 h-4" />
                      Book Now
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
          data-ocid="transport.booking.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {submitted ? "Booking Confirmed!" : `Book — ${bookingFor?.name}`}
            </DialogTitle>
          </DialogHeader>

          {submitted ? (
            <motion.div
              data-ocid="transport.booking.success_state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 py-6 text-center"
            >
              <CheckCircle className="w-16 h-16 text-emerald-500" />
              <div>
                <p className="font-semibold text-lg text-foreground">
                  You're All Set!
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Your <strong>{bookingFor?.name}</strong> has been booked. Our
                  team will call you to confirm the details.
                </p>
              </div>
              <Button
                data-ocid="transport.booking.close_button"
                onClick={closeBooking}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Done
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="t-name">Your Name</Label>
                <Input
                  id="t-name"
                  data-ocid="transport.booking.input"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="t-date">Date</Label>
                <Input
                  id="t-date"
                  type="date"
                  data-ocid="transport.booking.input"
                  value={form.date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, date: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="t-passengers">Number of Passengers</Label>
                <Input
                  id="t-passengers"
                  type="number"
                  min="1"
                  max="50"
                  data-ocid="transport.booking.input"
                  value={form.passengers}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, passengers: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="t-duration">Duration</Label>
                <Select
                  value={form.duration}
                  onValueChange={(v) => setForm((p) => ({ ...p, duration: v }))}
                  required
                >
                  <SelectTrigger
                    id="t-duration"
                    data-ocid="transport.booking.select"
                  >
                    <SelectValue placeholder="Choose duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1hr">1 Hour</SelectItem>
                    <SelectItem value="2hr">2 Hours</SelectItem>
                    <SelectItem value="4hr">4 Hours</SelectItem>
                    <SelectItem value="halfday">Half Day (6 hrs)</SelectItem>
                    <SelectItem value="fullday">Full Day (12 hrs)</SelectItem>
                    <SelectItem value="overnight">Overnight</SelectItem>
                    <SelectItem value="2days">2 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="t-phone">Phone Number</Label>
                <Input
                  id="t-phone"
                  type="tel"
                  data-ocid="transport.booking.input"
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
                  data-ocid="transport.booking.cancel_button"
                  className="flex-1"
                  onClick={closeBooking}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  data-ocid="transport.booking.submit_button"
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
