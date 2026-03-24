import { Button } from "@/components/ui/button";
import { Anchor, ArrowRight, MapPin, Star, Waves } from "lucide-react";
import { motion } from "motion/react";
import type { Page } from "../App";
import PlaceCard, { PlaceCardSkeleton } from "../components/PlaceCard";
import { useAllTouristPlaces } from "../hooks/useQueries";

interface HomePageProps {
  navigate: (page: Page) => void;
}

const STATS = [
  { icon: Waves, value: "900km", label: "Backwater Network" },
  { icon: Anchor, value: "38+", label: "Tourist Destinations" },
  { icon: MapPin, value: "1888", label: "Municipality Est." },
  { icon: Star, value: "Top 3", label: "Kerala Tourism Spot" },
];

export default function HomePage({ navigate }: HomePageProps) {
  const { data: places, isLoading } = useAllTouristPlaces();
  const featuredPlaces = places?.slice(0, 4) ?? [];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[88vh] min-h-[560px] overflow-hidden">
        <img
          src="/assets/generated/alappuzha-hero.dim_1600x900.jpg"
          alt="Alappuzha Backwaters"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="bg-hero-gradient absolute inset-0" />

        {/* Hero content */}
        <div className="relative h-full flex items-end pb-20 md:pb-28">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <span className="inline-block text-xs font-body font-medium tracking-widest uppercase text-amber-300 mb-4 px-3 py-1 border border-amber-300/30 rounded-full bg-amber-300/10">
                God's Own Country
              </span>
              <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-4">
                Discover
                <br />
                <span className="text-amber-300">Alappuzha</span>
              </h1>
              <p className="text-lg text-white/80 font-body mb-8 leading-relaxed max-w-lg">
                The Venice of the East — where emerald backwaters meet golden
                beaches, ancient temples, and living heritage.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => navigate("places")}
                  size="lg"
                  className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-semibold gap-2 shadow-lg"
                >
                  Explore Places
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => navigate("itinerary")}
                  variant="outline"
                  size="lg"
                  className="border-white/40 text-white hover:bg-white/10 backdrop-blur-sm"
                >
                  Plan Itinerary
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-md border-t border-white/10"
        >
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STATS.map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-white leading-none">
                      {value}
                    </div>
                    <div className="text-xs text-white/60 mt-0.5">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Featured Places */}
      <section className="bg-water-mesh py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10"
          >
            <div>
              <span className="text-xs font-medium tracking-widest uppercase text-primary/70 mb-2 block">
                Must-Visit
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Featured Destinations
              </h2>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("places")}
              className="gap-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground self-start md:self-auto"
            >
              View All Places
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton list, no meaningful key
                <PlaceCardSkeleton key={i} />
              ))}
            </div>
          ) : featuredPlaces.length > 0 ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {featuredPlaces.map((place, i) => (
                <motion.div
                  key={place.id.toString()}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5 },
                    },
                  }}
                >
                  <PlaceCard place={place} index={i} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* Fallback sample content */
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {SAMPLE_PLACES.slice(0, 4).map((place, i) => (
                <motion.div
                  key={place.id.toString()}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5 },
                    },
                  }}
                >
                  <PlaceCard place={place} index={i} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Plan Your Perfect Kerala Trip
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
              Build a day-by-day itinerary, discover hidden gems, and make
              memories that last forever.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => navigate("itinerary")}
                size="lg"
                className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-semibold shadow-lg gap-2"
              >
                Start Planning
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => navigate("stay")}
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10"
              >
                Browse Stays
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// Sample places for first-load experience
export const SAMPLE_PLACES = [
  {
    id: BigInt(1),
    name: "Alappuzha Backwaters",
    description:
      "Cruise through the legendary network of canals, lagoons, and lakes on a traditional houseboat. A UNESCO-listed experience unlike any other.",
    category: "Backwaters",
    mapsUrl: "https://maps.google.com/?q=Alappuzha+Backwaters+Kerala",
    imageUrl: "/assets/generated/place-houseboat.dim_600x400.jpg",
  },
  {
    id: BigInt(2),
    name: "Alappuzha Beach",
    description:
      "A stunning coastal stretch with the iconic 137-year-old pier, golden sands, gentle waves, and spectacular sunsets.",
    category: "Beach",
    mapsUrl: "https://maps.google.com/?q=Alappuzha+Beach+Kerala",
    imageUrl: "/assets/generated/place-beach.dim_600x400.jpg",
  },
  {
    id: BigInt(3),
    name: "Punnamada Lake",
    description:
      "The venue of the famous Nehru Trophy Boat Race, where snake boats race across sparkling waters every August.",
    category: "Backwaters",
    mapsUrl: "https://maps.google.com/?q=Punnamada+Lake+Kerala",
    imageUrl: "/assets/generated/place-culture.dim_600x400.jpg",
  },
  {
    id: BigInt(4),
    name: "Pathiramanal Island",
    description:
      "A tiny jewel island accessible only by boat, home to over 50 species of rare migratory birds amidst lush tropical vegetation.",
    category: "Island",
    mapsUrl: "https://maps.google.com/?q=Pathiramanal+Island+Alappuzha",
    imageUrl: "/assets/generated/place-island.dim_600x400.jpg",
  },
  {
    id: BigInt(5),
    name: "Marari Beach",
    description:
      "A quiet, unspoiled stretch of beach lined with coconut palms, perfect for swimming, sunbathing, and beach walks.",
    category: "Beach",
    mapsUrl: "https://maps.google.com/?q=Marari+Beach+Kerala",
    imageUrl: "/assets/generated/place-marari.dim_600x400.jpg",
  },
  {
    id: BigInt(6),
    name: "Arthunkal Church",
    description:
      "The 450-year-old St. Andrew's Basilica, a Portuguese-era colonial masterpiece and important pilgrimage site on the Arabian Sea coast.",
    category: "Heritage",
    mapsUrl: "https://maps.google.com/?q=Arthunkal+Church+Kerala",
    imageUrl: "/assets/generated/place-church.dim_600x400.jpg",
  },
  {
    id: BigInt(7),
    name: "Vembanad Lake",
    description:
      "The longest lake in India stretching across three districts, offering serene boat rides, bird watching, and stunning sunrises over misty waters.",
    category: "Backwaters",
    mapsUrl: "https://maps.google.com/?q=Vembanad+Lake+Kerala",
    imageUrl: "/assets/generated/place-punnamada.dim_600x400.jpg",
  },
  {
    id: BigInt(8),
    name: "Kuttanad Paddy Fields",
    description:
      "The rice bowl of Kerala — vast emerald paddy fields cultivated below sea level, creating a surreal landscape unique in Asia.",
    category: "Nature",
    mapsUrl: "https://maps.google.com/?q=Kuttanad+Kerala",
    imageUrl: "/assets/generated/place-paddy.dim_600x400.jpg",
  },
  {
    id: BigInt(9),
    name: "Ambalappuzha Sri Krishna Temple",
    description:
      "A 14th-century temple famous for its mythical palpayasam (sweet rice porridge) and magnificent Dravidian architecture.",
    category: "Temple",
    mapsUrl: "https://maps.google.com/?q=Ambalappuzha+Sri+Krishna+Temple",
    imageUrl: "/assets/generated/place-temple.dim_600x400.jpg",
  },
  {
    id: BigInt(10),
    name: "Krishnapuram Palace",
    description:
      "An 18th-century Kerala-style palace museum housing rare murals, sculptures, and antiques. Home to the famous Gajendra Moksham mural.",
    category: "Heritage",
    mapsUrl: "https://maps.google.com/?q=Krishnapuram+Palace+Kerala",
    imageUrl: "/assets/generated/place-palace.dim_600x400.jpg",
  },
  {
    id: BigInt(11),
    name: "Champakulam",
    description:
      "A picturesque village known for its magnificent water processions, snake boat races, and the oldest Christian church in Kerala.",
    category: "Culture",
    mapsUrl: "https://maps.google.com/?q=Champakulam+Kerala",
    imageUrl: "/assets/generated/place-culture.dim_600x400.jpg",
  },
  {
    id: BigInt(12),
    name: "Mannarasala Nagaraja Temple",
    description:
      "A unique forest temple dedicated to serpent gods, surrounded by a dense grove of ancient trees and over 30,000 serpent idols.",
    category: "Temple",
    mapsUrl: "https://maps.google.com/?q=Mannarasala+Temple+Kerala",
    imageUrl: "/assets/generated/place-temple.dim_600x400.jpg",
  },
  {
    id: BigInt(13),
    name: "Kumarakom Bird Sanctuary",
    description:
      "A cluster of small islands on Vembanad Lake, famous as a bird sanctuary hosting migratory birds like Siberian cranes and egrets.",
    category: "Nature",
    mapsUrl: "https://maps.google.com/?q=Kumarakom+Bird+Sanctuary+Kerala",
    imageUrl: "/assets/generated/place-island.dim_600x400.jpg",
  },
  {
    id: BigInt(14),
    name: "Revi Karunakaran Museum",
    description:
      "A world-class private museum displaying rare glass artifacts, antique European furniture, Venetian glass, and priceless ivory carvings.",
    category: "Heritage",
    mapsUrl: "https://maps.google.com/?q=Revi+Karunakaran+Museum+Alappuzha",
    imageUrl: "/assets/generated/place-palace.dim_600x400.jpg",
  },
];
