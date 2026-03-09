import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import PlaceCard, { PlaceCardSkeleton } from "../components/PlaceCard";
import { useAllTouristPlaces } from "../hooks/useQueries";
import { SAMPLE_PLACES } from "./HomePage";

const ALL_CATEGORIES = [
  "All",
  "Backwaters",
  "Beach",
  "Heritage",
  "Nature",
  "Culture",
  "Temple",
  "Island",
];

export default function PlacesPage() {
  const { data: places, isLoading } = useAllTouristPlaces();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Use backend data or fallback to sample
  const sourcePlaces = places && places.length > 0 ? places : SAMPLE_PLACES;

  const filteredPlaces = sourcePlaces.filter((place) => {
    const matchesCategory =
      activeCategory === "All" || place.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Gather categories that exist in data
  const availableCategories = [
    "All",
    ...new Set(sourcePlaces.map((p) => p.category)),
  ];
  const displayCategories = ALL_CATEGORIES.filter((c) =>
    availableCategories.includes(c),
  );

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
              Explore
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
              Tourist Places
            </h1>
            <p className="text-primary-foreground/75 text-lg max-w-xl">
              From serene backwaters to golden beaches — discover the best of
              Alappuzha.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Search + Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-ocid="places.search_input"
              placeholder="Search destinations…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {displayCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                data-ocid="places.filter.tab"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton list, no meaningful key
              <PlaceCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredPlaces.length === 0 ? (
          <motion.div
            data-ocid="places.empty_state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No places found
            </h3>
            <p className="text-muted-foreground">
              Try a different category or search term.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setActiveCategory("All");
                setSearchQuery("");
              }}
            >
              Clear filters
            </Button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`${activeCategory}-${searchQuery}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredPlaces.map((place, i) => (
                <motion.div
                  key={place.id.toString()}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <PlaceCard place={place} index={i} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        <p className="text-center text-sm text-muted-foreground mt-8">
          Showing {filteredPlaces.length} destination
          {filteredPlaces.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
