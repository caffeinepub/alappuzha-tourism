import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, MapPin } from "lucide-react";
import type { TouristPlace } from "../hooks/useQueries";

interface PlaceCardProps {
  place: TouristPlace;
  index: number;
}

const categoryColors: Record<string, string> = {
  Backwaters: "bg-primary/10 text-primary border-primary/20",
  Beach: "bg-amber-100 text-amber-800 border-amber-200",
  Heritage: "bg-stone-100 text-stone-700 border-stone-200",
  Nature: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Culture: "bg-purple-100 text-purple-800 border-purple-200",
  Temple: "bg-orange-100 text-orange-800 border-orange-200",
  Island: "bg-cyan-100 text-cyan-800 border-cyan-200",
  Lake: "bg-blue-100 text-blue-800 border-blue-200",
  Sanctuary: "bg-green-100 text-green-800 border-green-200",
  Palace: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

const categoryImages: Record<string, string> = {
  Backwaters: "/assets/generated/place-houseboat.dim_600x400.jpg",
  Lake: "/assets/generated/place-punnamada.dim_600x400.jpg",
  Beach: "/assets/generated/place-beach.dim_600x400.jpg",
  Heritage: "/assets/generated/place-church.dim_600x400.jpg",
  Palace: "/assets/generated/place-palace.dim_600x400.jpg",
  Temple: "/assets/generated/place-temple.dim_600x400.jpg",
  Nature: "/assets/generated/place-paddy.dim_600x400.jpg",
  Culture: "/assets/generated/place-culture.dim_600x400.jpg",
  Island: "/assets/generated/place-island.dim_600x400.jpg",
  Sanctuary: "/assets/generated/place-island.dim_600x400.jpg",
};

const DEFAULT_IMAGE = "/assets/generated/alappuzha-hero.dim_1600x900.jpg";

function getImageUrl(imageUrl: string | undefined, category: string): string {
  if (imageUrl?.startsWith("/assets")) {
    return imageUrl;
  }
  return categoryImages[category] ?? DEFAULT_IMAGE;
}

function getCategoryStyle(category: string) {
  return (
    categoryColors[category] ?? "bg-muted text-muted-foreground border-border"
  );
}

export default function PlaceCard({ place, index }: PlaceCardProps) {
  const ocidIndex = index + 1;
  const imageUrl = getImageUrl(place.imageUrl, place.category);

  return (
    <Card
      data-ocid={`places.item.${ocidIndex}`}
      className="overflow-hidden card-hover border-border group"
    >
      <div className="relative overflow-hidden h-48">
        <img
          src={imageUrl}
          alt={place.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              categoryImages[place.category] ?? DEFAULT_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-3 left-3">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getCategoryStyle(place.category)}`}
          >
            {place.category}
          </span>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start gap-2 mb-2">
          <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <h3 className="font-display font-semibold text-foreground leading-tight">
            {place.name}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
          {place.description}
        </p>
        <a
          href={
            place.mapsUrl ||
            `https://maps.google.com/?q=${encodeURIComponent(`${place.name} Alappuzha Kerala`)}`
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            data-ocid="places.map_button"
            variant="outline"
            size="sm"
            className="w-full gap-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View on Map
          </Button>
        </a>
      </CardContent>
    </Card>
  );
}

export function PlaceCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-48 bg-muted animate-pulse" />
      <CardContent className="p-4 space-y-3">
        <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-3 bg-muted animate-pulse rounded" />
          <div className="h-3 bg-muted animate-pulse rounded w-5/6" />
          <div className="h-3 bg-muted animate-pulse rounded w-4/6" />
        </div>
        <div className="h-9 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}
