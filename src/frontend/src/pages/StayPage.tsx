import { Button } from "@/components/ui/button";
import {
  BedDouble,
  Bike,
  Car,
  ChefHat,
  Eye,
  Fish,
  Leaf,
  Ship,
  Star,
  Sun,
  TreePine,
  Utensils,
  Waves,
  Wifi,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { StayItem } from "../hooks/useStaysData";
import { useStaysData } from "../hooks/useStaysData";

type Category = "All" | "Houseboat" | "Resort" | "Homestay" | "Hotel";

const CATEGORY_COLORS: Record<StayItem["category"], string> = {
  Houseboat: "bg-primary/10 text-primary border-primary/20",
  Resort: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Homestay: "bg-amber-100 text-amber-700 border-amber-200",
  Hotel: "bg-purple-100 text-purple-700 border-purple-200",
};

const STAR_INDICES = [0, 1, 2, 3, 4];

function amenityIcon(amenity: string) {
  const a = amenity.toLowerCase();
  if (a.includes("wi-fi") || a.includes("wifi"))
    return <Wifi className="w-3.5 h-3.5" />;
  if (
    a.includes("meal") ||
    a.includes("food") ||
    a.includes("chef") ||
    a.includes("dining") ||
    a.includes("kitchen") ||
    a.includes("organic")
  )
    return <Utensils className="w-3.5 h-3.5" />;
  if (
    a.includes("beach") ||
    a.includes("pool") ||
    a.includes("kayak") ||
    a.includes("water") ||
    a.includes("lake") ||
    a.includes("deck") ||
    a.includes("sundeck")
  )
    return <Waves className="w-3.5 h-3.5" />;
  if (
    a.includes("garden") ||
    a.includes("eco") ||
    a.includes("nature") ||
    a.includes("tree") ||
    a.includes("bird")
  )
    return <TreePine className="w-3.5 h-3.5" />;
  if (a.includes("car") || a.includes("tour") || a.includes("desk"))
    return <Car className="w-3.5 h-3.5" />;
  if (a.includes("fish")) return <Fish className="w-3.5 h-3.5" />;
  if (a.includes("spa") || a.includes("ayur"))
    return <Leaf className="w-3.5 h-3.5" />;
  if (a.includes("view") || a.includes("sea"))
    return <Eye className="w-3.5 h-3.5" />;
  if (a.includes("bicycle") || a.includes("bike"))
    return <Bike className="w-3.5 h-3.5" />;
  if (a.includes("class") || a.includes("cooking"))
    return <ChefHat className="w-3.5 h-3.5" />;
  if (
    a.includes("bedroom") ||
    a.includes("room") ||
    a.includes("bungalow") ||
    a.includes("heritage")
  )
    return <BedDouble className="w-3.5 h-3.5" />;
  if (a.includes("restaurant") || a.includes("caf"))
    return <Utensils className="w-3.5 h-3.5" />;
  if (a.includes("ship") || a.includes("cruise"))
    return <Ship className="w-3.5 h-3.5" />;
  return <Sun className="w-3.5 h-3.5" />;
}

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex gap-0.5">
      {STAR_INDICES.map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < stars
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

const FILTERS: Category[] = ["All", "Houseboat", "Resort", "Homestay", "Hotel"];

export default function StayPage() {
  const { items: STAYS } = useStaysData();
  const [activeFilter, setActiveFilter] = useState<Category>("All");

  const filtered =
    activeFilter === "All"
      ? STAYS
      : STAYS.filter((s) => s.category === activeFilter);

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
              <BedDouble className="w-7 h-7 text-amber-300" />
              <span className="text-xs font-medium tracking-widest uppercase text-amber-300">
                Accommodation
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
              Places to Stay
            </h1>
            <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">
              Houseboats, resorts, homestays and hotels in Alappuzha
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
                data-ocid="stay.filter.tab"
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
            {filtered.map((stay, i) => {
              const globalIdx = STAYS.indexOf(stay) + 1;
              const bookingUrl = `https://www.booking.com/search.html?ss=${encodeURIComponent(`${stay.name} Alappuzha Kerala`)}`;
              return (
                <motion.article
                  key={stay.name}
                  data-ocid={`stay.item.${globalIdx}`}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-border group"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={stay.imageUrl}
                      alt={stay.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${CATEGORY_COLORS[stay.category]}`}
                      >
                        {stay.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
                      <StarRating stars={stay.stars} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col gap-3">
                    <div>
                      <h3 className="font-display font-semibold text-lg text-foreground leading-snug mb-1">
                        {stay.name}
                      </h3>
                      <p className="text-primary font-bold text-sm">
                        {stay.price}
                      </p>
                    </div>

                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                      {stay.description}
                    </p>

                    {/* Amenities */}
                    <div className="flex flex-wrap gap-2">
                      {stay.amenities.map((amenity) => (
                        <span
                          key={amenity}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground"
                        >
                          {amenityIcon(amenity)}
                          {amenity}
                        </span>
                      ))}
                    </div>

                    <a
                      href={bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-ocid="stay.book_button"
                    >
                      <Button className="w-full bg-primary hover:bg-primary/90 gap-2">
                        <BedDouble className="w-4 h-4" />
                        Book Now
                      </Button>
                    </a>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
