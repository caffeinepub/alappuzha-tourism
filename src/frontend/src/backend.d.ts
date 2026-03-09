import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TouristPlace {
    id: bigint;
    mapsUrl: string;
    name: string;
    description: string;
    imageUrl: string;
    category: string;
}
export interface ItineraryDayLabel {
    day: bigint;
    places: Array<bigint>;
    dayLabel: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addTouristPlace(place: TouristPlace): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearMyItinerary(): Promise<void>;
    deleteTouristPlace(id: bigint): Promise<void>;
    getAllTouristPlaces(): Promise<Array<TouristPlace>>;
    getCallerUserRole(): Promise<UserRole>;
    getMyItinerary(): Promise<Array<Array<ItineraryDayLabel>>>;
    getPlacesByCategory(category: string): Promise<Array<TouristPlace>>;
    getTouristPlace(id: bigint): Promise<TouristPlace>;
    initialize(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveMyItinerary(itinerary: Array<Array<ItineraryDayLabel>>): Promise<void>;
    updateTouristPlace(place: TouristPlace): Promise<void>;
}
