import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ItineraryDayLabel,
  TouristPlace,
  UserRole,
} from "../backend.d.ts";
import { useActor } from "./useActor";

export type { TouristPlace, ItineraryDayLabel, UserRole };

// ── Tourist Places ─────────────────────────────────────────────────────────

export function useAllTouristPlaces() {
  const { actor, isFetching } = useActor();
  return useQuery<TouristPlace[]>({
    queryKey: ["touristPlaces"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTouristPlaces();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlacesByCategory(category: string) {
  const { actor, isFetching } = useActor();
  return useQuery<TouristPlace[]>({
    queryKey: ["touristPlaces", "category", category],
    queryFn: async () => {
      if (!actor) return [];
      if (category === "All") return actor.getAllTouristPlaces();
      return actor.getPlacesByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTouristPlace() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (place: TouristPlace) => {
      if (!actor) throw new Error("Not connected");
      return actor.addTouristPlace(place);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["touristPlaces"] });
    },
  });
}

export function useUpdateTouristPlace() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (place: TouristPlace) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateTouristPlace(place);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["touristPlaces"] });
    },
  });
}

export function useDeleteTouristPlace() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteTouristPlace(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["touristPlaces"] });
    },
  });
}

// ── User Role ──────────────────────────────────────────────────────────────

export function useCallerRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) return "guest" as UserRole;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Itinerary ──────────────────────────────────────────────────────────────

export function useMyItinerary() {
  const { actor, isFetching } = useActor();
  return useQuery<ItineraryDayLabel[][]>({
    queryKey: ["myItinerary"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyItinerary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveItinerary() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itinerary: ItineraryDayLabel[][]) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveMyItinerary(itinerary);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myItinerary"] });
    },
  });
}

export function useClearItinerary() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.clearMyItinerary();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myItinerary"] });
    },
  });
}
