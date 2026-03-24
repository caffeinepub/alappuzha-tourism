import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  BedDouble,
  Bus,
  CheckCircle,
  Edit,
  Loader2,
  MapPin,
  Plus,
  ShieldCheck,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import {
  useAddTouristPlace,
  useAllTouristPlaces,
  useDeleteTouristPlace,
  useUpdateTouristPlace,
} from "../hooks/useQueries";
import type { TouristPlace } from "../hooks/useQueries";
import type { Restaurant } from "../hooks/useRestaurantsData";
import { useRestaurantsData } from "../hooks/useRestaurantsData";
import type { StayItem } from "../hooks/useStaysData";
import { useStaysData } from "../hooks/useStaysData";
import type { TransportItem } from "../hooks/useTransportData";
import { useTransportData } from "../hooks/useTransportData";

type PlaceFormState = {
  id: string;
  name: string;
  description: string;
  category: string;
  mapsUrl: string;
  imageUrl: string;
};

const EMPTY_PLACE_FORM: PlaceFormState = {
  id: "",
  name: "",
  description: "",
  category: "",
  mapsUrl: "",
  imageUrl: "",
};

type RestaurantFormState = {
  name: string;
  cuisine: Restaurant["cuisine"] | "";
  priceRange: Restaurant["priceRange"] | "";
  rating: string;
  specialty: string;
  description: string;
};

const EMPTY_RESTAURANT_FORM: RestaurantFormState = {
  name: "",
  cuisine: "",
  priceRange: "",
  rating: "4",
  specialty: "",
  description: "",
};

type StayFormState = {
  name: string;
  category: StayItem["category"] | "";
  stars: string;
  price: string;
  description: string;
  amenities: string;
  imageUrl: string;
};

const EMPTY_STAY_FORM: StayFormState = {
  name: "",
  category: "",
  stars: "4",
  price: "",
  description: "",
  amenities: "",
  imageUrl: "",
};

type TransportFormState = {
  name: string;
  type: string;
  category: TransportItem["category"] | "";
  priceRange: string;
  description: string;
  capacity: string;
};

const EMPTY_TRANSPORT_FORM: TransportFormState = {
  name: "",
  type: "",
  category: "",
  priceRange: "",
  description: "",
  capacity: "",
};

export default function AdminPage() {
  const [passwordUnlocked, setPasswordUnlocked] = useState(
    () => sessionStorage.getItem("adminAuth") === "ok",
  );
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { data: places, isLoading: loadingPlaces } = useAllTouristPlaces();
  const addPlace = useAddTouristPlace();
  const updatePlace = useUpdateTouristPlace();
  const deletePlace = useDeleteTouristPlace();

  const restaurantsStore = useRestaurantsData();
  const staysStore = useStaysData();
  const transportStore = useTransportData();

  // Places state
  const [showPlaceForm, setShowPlaceForm] = useState(false);
  const [editingPlace, setEditingPlace] = useState<TouristPlace | null>(null);
  const [placeForm, setPlaceForm] = useState<PlaceFormState>(EMPTY_PLACE_FORM);
  const [confirmDeletePlace, setConfirmDeletePlace] = useState<bigint | null>(
    null,
  );
  const [placeFormSuccess, setPlaceFormSuccess] = useState(false);
  const [placeFormError, setPlaceFormError] = useState("");

  // Restaurant state
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(
    null,
  );
  const [restaurantForm, setRestaurantForm] = useState<RestaurantFormState>(
    EMPTY_RESTAURANT_FORM,
  );
  const [confirmDeleteRestaurant, setConfirmDeleteRestaurant] = useState<
    string | null
  >(null);
  const [restaurantFormSuccess, setRestaurantFormSuccess] = useState(false);
  const [restaurantFormError, setRestaurantFormError] = useState("");

  // Stay state
  const [showStayForm, setShowStayForm] = useState(false);
  const [editingStay, setEditingStay] = useState<StayItem | null>(null);
  const [stayForm, setStayForm] = useState<StayFormState>(EMPTY_STAY_FORM);
  const [confirmDeleteStay, setConfirmDeleteStay] = useState<string | null>(
    null,
  );
  const [stayFormSuccess, setStayFormSuccess] = useState(false);
  const [stayFormError, setStayFormError] = useState("");

  // Transport state
  const [showTransportForm, setShowTransportForm] = useState(false);
  const [editingTransport, setEditingTransport] =
    useState<TransportItem | null>(null);
  const [transportForm, setTransportForm] =
    useState<TransportFormState>(EMPTY_TRANSPORT_FORM);
  const [confirmDeleteTransport, setConfirmDeleteTransport] = useState<
    string | null
  >(null);
  const [transportFormSuccess, setTransportFormSuccess] = useState(false);
  const [transportFormError, setTransportFormError] = useState("");

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (passwordInput === "joshua") {
      sessionStorage.setItem("adminAuth", "ok");
      setPasswordUnlocked(true);
      setPasswordError("");
    } else {
      setPasswordError("Incorrect password. Please try again.");
      setPasswordInput("");
    }
  };

  if (!passwordUnlocked) {
    return (
      <div className="min-h-screen bg-water-mesh flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card border border-border rounded-2xl shadow-lg p-10 max-w-sm w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Admin Access
          </h2>
          <p className="text-muted-foreground text-sm mb-7">
            Enter the admin password to continue.
          </p>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              data-ocid="admin.password.input"
              type="password"
              placeholder="Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="text-center"
              autoFocus
            />
            {passwordError && (
              <p
                data-ocid="admin.password.error_state"
                className="text-destructive text-sm"
              >
                {passwordError}
              </p>
            )}
            <Button
              data-ocid="admin.password.submit_button"
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              Enter
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ---- Place handlers ----
  const openAddPlaceForm = () => {
    setEditingPlace(null);
    setPlaceForm(EMPTY_PLACE_FORM);
    setPlaceFormError("");
    setPlaceFormSuccess(false);
    setShowPlaceForm(true);
  };

  const openEditPlaceForm = (place: TouristPlace) => {
    setEditingPlace(place);
    setPlaceForm({
      id: place.id.toString(),
      name: place.name,
      description: place.description,
      category: place.category,
      mapsUrl: place.mapsUrl,
      imageUrl: place.imageUrl,
    });
    setPlaceFormError("");
    setPlaceFormSuccess(false);
    setShowPlaceForm(true);
  };

  const closePlaceForm = () => {
    setShowPlaceForm(false);
    setEditingPlace(null);
    setPlaceForm(EMPTY_PLACE_FORM);
    setPlaceFormError("");
    setPlaceFormSuccess(false);
  };

  const handlePlaceSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPlaceFormError("");
    setPlaceFormSuccess(false);

    if (
      !placeForm.name.trim() ||
      !placeForm.description.trim() ||
      !placeForm.category.trim() ||
      !placeForm.mapsUrl.trim()
    ) {
      setPlaceFormError("Please fill in all required fields.");
      return;
    }

    const place: TouristPlace = {
      id: editingPlace ? editingPlace.id : BigInt(Date.now()),
      name: placeForm.name.trim(),
      description: placeForm.description.trim(),
      category: placeForm.category.trim(),
      mapsUrl: placeForm.mapsUrl.trim(),
      imageUrl: placeForm.imageUrl.trim(),
    };

    try {
      if (editingPlace) {
        await updatePlace.mutateAsync(place);
        toast.success("Place updated successfully!");
      } else {
        await addPlace.mutateAsync(place);
        toast.success("Place added successfully!");
      }
      setPlaceFormSuccess(true);
      setTimeout(closePlaceForm, 1200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setPlaceFormError(msg);
      toast.error(`Operation failed: ${msg}`);
    }
  };

  const handlePlaceDelete = async (id: bigint) => {
    try {
      await deletePlace.mutateAsync(id);
      toast.success("Place deleted.");
      setConfirmDeletePlace(null);
    } catch {
      toast.error("Failed to delete place.");
      setConfirmDeletePlace(null);
    }
  };

  // ---- Restaurant handlers ----
  const openAddRestaurantForm = () => {
    setEditingRestaurant(null);
    setRestaurantForm(EMPTY_RESTAURANT_FORM);
    setRestaurantFormError("");
    setRestaurantFormSuccess(false);
    setShowRestaurantForm(true);
  };

  const openEditRestaurantForm = (r: Restaurant) => {
    setEditingRestaurant(r);
    setRestaurantForm({
      name: r.name,
      cuisine: r.cuisine,
      priceRange: r.priceRange,
      rating: r.rating.toString(),
      specialty: r.specialty,
      description: r.description,
    });
    setRestaurantFormError("");
    setRestaurantFormSuccess(false);
    setShowRestaurantForm(true);
  };

  const closeRestaurantForm = () => {
    setShowRestaurantForm(false);
    setEditingRestaurant(null);
    setRestaurantForm(EMPTY_RESTAURANT_FORM);
    setRestaurantFormError("");
    setRestaurantFormSuccess(false);
  };

  const handleRestaurantSubmit = (e: FormEvent) => {
    e.preventDefault();
    setRestaurantFormError("");
    setRestaurantFormSuccess(false);

    if (
      !restaurantForm.name.trim() ||
      !restaurantForm.cuisine ||
      !restaurantForm.priceRange ||
      !restaurantForm.specialty.trim() ||
      !restaurantForm.description.trim()
    ) {
      setRestaurantFormError("Please fill in all required fields.");
      return;
    }

    const r: Restaurant = {
      name: restaurantForm.name.trim(),
      cuisine: restaurantForm.cuisine as Restaurant["cuisine"],
      priceRange: restaurantForm.priceRange as Restaurant["priceRange"],
      rating: Number(restaurantForm.rating),
      specialty: restaurantForm.specialty.trim(),
      description: restaurantForm.description.trim(),
    };

    if (editingRestaurant) {
      restaurantsStore.update(r);
      toast.success("Restaurant updated!");
    } else {
      restaurantsStore.add(r);
      toast.success("Restaurant added!");
    }
    setRestaurantFormSuccess(true);
    setTimeout(closeRestaurantForm, 1000);
  };

  // ---- Stay handlers ----
  const openAddStayForm = () => {
    setEditingStay(null);
    setStayForm(EMPTY_STAY_FORM);
    setStayFormError("");
    setStayFormSuccess(false);
    setShowStayForm(true);
  };

  const openEditStayForm = (s: StayItem) => {
    setEditingStay(s);
    setStayForm({
      name: s.name,
      category: s.category,
      stars: s.stars.toString(),
      price: s.price,
      description: s.description,
      amenities: s.amenities.join(", "),
      imageUrl: s.imageUrl,
    });
    setStayFormError("");
    setStayFormSuccess(false);
    setShowStayForm(true);
  };

  const closeStayForm = () => {
    setShowStayForm(false);
    setEditingStay(null);
    setStayForm(EMPTY_STAY_FORM);
    setStayFormError("");
    setStayFormSuccess(false);
  };

  const handleStaySubmit = (e: FormEvent) => {
    e.preventDefault();
    setStayFormError("");
    setStayFormSuccess(false);

    if (
      !stayForm.name.trim() ||
      !stayForm.category ||
      !stayForm.price.trim() ||
      !stayForm.description.trim() ||
      !stayForm.amenities.trim()
    ) {
      setStayFormError("Please fill in all required fields.");
      return;
    }

    const s: StayItem = {
      name: stayForm.name.trim(),
      category: stayForm.category as StayItem["category"],
      stars: Number(stayForm.stars),
      price: stayForm.price.trim(),
      description: stayForm.description.trim(),
      amenities: stayForm.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      imageUrl: stayForm.imageUrl.trim(),
    };

    if (editingStay) {
      staysStore.update(s);
      toast.success("Stay updated!");
    } else {
      staysStore.add(s);
      toast.success("Stay added!");
    }
    setStayFormSuccess(true);
    setTimeout(closeStayForm, 1000);
  };

  // ---- Transport handlers ----
  const openAddTransportForm = () => {
    setEditingTransport(null);
    setTransportForm(EMPTY_TRANSPORT_FORM);
    setTransportFormError("");
    setTransportFormSuccess(false);
    setShowTransportForm(true);
  };

  const openEditTransportForm = (t: TransportItem) => {
    setEditingTransport(t);
    setTransportForm({
      name: t.name,
      type: t.type,
      category: t.category,
      priceRange: t.priceRange,
      description: t.description,
      capacity: t.capacity,
    });
    setTransportFormError("");
    setTransportFormSuccess(false);
    setShowTransportForm(true);
  };

  const closeTransportForm = () => {
    setShowTransportForm(false);
    setEditingTransport(null);
    setTransportForm(EMPTY_TRANSPORT_FORM);
    setTransportFormError("");
    setTransportFormSuccess(false);
  };

  const handleTransportSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTransportFormError("");
    setTransportFormSuccess(false);

    if (
      !transportForm.name.trim() ||
      !transportForm.type.trim() ||
      !transportForm.category ||
      !transportForm.priceRange.trim() ||
      !transportForm.description.trim() ||
      !transportForm.capacity.trim()
    ) {
      setTransportFormError("Please fill in all required fields.");
      return;
    }

    const t: TransportItem = {
      name: transportForm.name.trim(),
      type: transportForm.type.trim(),
      category: transportForm.category as TransportItem["category"],
      priceRange: transportForm.priceRange.trim(),
      description: transportForm.description.trim(),
      capacity: transportForm.capacity.trim(),
    };

    if (editingTransport) {
      transportStore.update(t);
      toast.success("Transport updated!");
    } else {
      transportStore.add(t);
      toast.success("Transport added!");
    }
    setTransportFormSuccess(true);
    setTimeout(closeTransportForm, 1000);
  };

  const isSaving = addPlace.isPending || updatePlace.isPending;

  return (
    <div className="min-h-screen bg-water-mesh">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-14">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-4xl font-bold mb-1">Admin Panel</h1>
          <p className="text-primary-foreground/70">
            Manage tourist places, restaurants, stay listings, and transport
            options.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <Tabs defaultValue="places">
          <TabsList className="mb-6 h-auto flex-wrap gap-1">
            <TabsTrigger
              value="places"
              data-ocid="admin.places.tab"
              className="gap-2"
            >
              <MapPin className="w-4 h-4" />
              Tourist Places
            </TabsTrigger>
            <TabsTrigger
              value="restaurants"
              data-ocid="admin.restaurants.tab"
              className="gap-2"
            >
              <UtensilsCrossed className="w-4 h-4" />
              Restaurants
            </TabsTrigger>
            <TabsTrigger
              value="stays"
              data-ocid="admin.stays.tab"
              className="gap-2"
            >
              <BedDouble className="w-4 h-4" />
              Stay Listings
            </TabsTrigger>
            <TabsTrigger
              value="transport"
              data-ocid="admin.transport.tab"
              className="gap-2"
            >
              <Bus className="w-4 h-4" />
              Transport
            </TabsTrigger>
          </TabsList>

          {/* ===== PLACES TAB ===== */}
          <TabsContent value="places">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Tourist Places
              </h2>
              <Button
                data-ocid="admin.add_button"
                onClick={openAddPlaceForm}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4" />
                Add Place
              </Button>
            </div>

            {loadingPlaces ? (
              <div
                data-ocid="admin.loading_state"
                className="flex items-center justify-center py-20"
              >
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : !places || places.length === 0 ? (
              <div
                data-ocid="admin.place.empty_state"
                className="text-center py-20 text-muted-foreground"
              >
                <p>No places added yet. Use "Add Place" to get started.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden bg-card">
                <Table data-ocid="admin.place.table">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold hidden md:table-cell">
                        Category
                      </TableHead>
                      <TableHead className="font-semibold hidden lg:table-cell">
                        Description
                      </TableHead>
                      <TableHead className="font-semibold text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {places.map((place, i) => (
                      <TableRow
                        key={place.id.toString()}
                        data-ocid={`admin.place.row.${i + 1}`}
                        className="group"
                      >
                        <TableCell className="font-medium">
                          {place.name}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="secondary">{place.category}</Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground max-w-xs truncate text-sm">
                          {place.description}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              data-ocid={`admin.place.edit_button.${i + 1}`}
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditPlaceForm(place)}
                              className="gap-1.5 text-muted-foreground hover:text-primary"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span className="hidden sm:block">Edit</span>
                            </Button>
                            <Button
                              data-ocid={`admin.place.delete_button.${i + 1}`}
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmDeletePlace(place.id)}
                              className="gap-1.5 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:block">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* ===== RESTAURANTS TAB ===== */}
          <TabsContent value="restaurants">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Restaurants
              </h2>
              <Button
                data-ocid="admin.restaurant.add_button"
                onClick={openAddRestaurantForm}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4" />
                Add Restaurant
              </Button>
            </div>

            {restaurantsStore.items.length === 0 ? (
              <div
                data-ocid="admin.restaurant.empty_state"
                className="text-center py-20 text-muted-foreground"
              >
                <p>No restaurants yet.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden bg-card">
                <Table data-ocid="admin.restaurant.table">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold hidden sm:table-cell">
                        Cuisine
                      </TableHead>
                      <TableHead className="font-semibold hidden md:table-cell">
                        Price
                      </TableHead>
                      <TableHead className="font-semibold hidden lg:table-cell">
                        Rating
                      </TableHead>
                      <TableHead className="font-semibold text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {restaurantsStore.items.map((r, i) => (
                      <TableRow
                        key={r.name}
                        data-ocid={`admin.restaurant.row.${i + 1}`}
                        className="group"
                      >
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="secondary">{r.cuisine}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline">{r.priceRange}</Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                          {r.rating}/5
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              data-ocid={`admin.restaurant.edit_button.${i + 1}`}
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditRestaurantForm(r)}
                              className="gap-1.5 text-muted-foreground hover:text-primary"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span className="hidden sm:block">Edit</span>
                            </Button>
                            <Button
                              data-ocid={`admin.restaurant.delete_button.${i + 1}`}
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmDeleteRestaurant(r.name)}
                              className="gap-1.5 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:block">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* ===== STAYS TAB ===== */}
          <TabsContent value="stays">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Stay Listings
              </h2>
              <Button
                data-ocid="admin.stay.add_button"
                onClick={openAddStayForm}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4" />
                Add Stay
              </Button>
            </div>

            {staysStore.items.length === 0 ? (
              <div
                data-ocid="admin.stay.empty_state"
                className="text-center py-20 text-muted-foreground"
              >
                <p>No stays yet.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden bg-card">
                <Table data-ocid="admin.stay.table">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold hidden sm:table-cell">
                        Category
                      </TableHead>
                      <TableHead className="font-semibold hidden md:table-cell">
                        Stars
                      </TableHead>
                      <TableHead className="font-semibold hidden lg:table-cell">
                        Price
                      </TableHead>
                      <TableHead className="font-semibold text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staysStore.items.map((s, i) => (
                      <TableRow
                        key={s.name}
                        data-ocid={`admin.stay.row.${i + 1}`}
                        className="group"
                      >
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="secondary">{s.category}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {s.stars}★
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground text-sm max-w-xs truncate">
                          {s.price}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              data-ocid={`admin.stay.edit_button.${i + 1}`}
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditStayForm(s)}
                              className="gap-1.5 text-muted-foreground hover:text-primary"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span className="hidden sm:block">Edit</span>
                            </Button>
                            <Button
                              data-ocid={`admin.stay.delete_button.${i + 1}`}
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmDeleteStay(s.name)}
                              className="gap-1.5 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:block">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* ===== TRANSPORT TAB ===== */}
          <TabsContent value="transport">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Transport Options
              </h2>
              <Button
                data-ocid="admin.transport.add_button"
                onClick={openAddTransportForm}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4" />
                Add Transport
              </Button>
            </div>

            {transportStore.items.length === 0 ? (
              <div
                data-ocid="admin.transport.empty_state"
                className="text-center py-20 text-muted-foreground"
              >
                <p>No transport options yet.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden bg-card">
                <Table data-ocid="admin.transport.table">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold hidden sm:table-cell">
                        Type
                      </TableHead>
                      <TableHead className="font-semibold hidden md:table-cell">
                        Category
                      </TableHead>
                      <TableHead className="font-semibold hidden lg:table-cell">
                        Price Range
                      </TableHead>
                      <TableHead className="font-semibold text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transportStore.items.map((t, i) => (
                      <TableRow
                        key={t.name}
                        data-ocid={`admin.transport.row.${i + 1}`}
                        className="group"
                      >
                        <TableCell className="font-medium">{t.name}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                          {t.type}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="secondary">{t.category}</Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground text-sm max-w-xs truncate">
                          {t.priceRange}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              data-ocid={`admin.transport.edit_button.${i + 1}`}
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditTransportForm(t)}
                              className="gap-1.5 text-muted-foreground hover:text-primary"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span className="hidden sm:block">Edit</span>
                            </Button>
                            <Button
                              data-ocid={`admin.transport.delete_button.${i + 1}`}
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmDeleteTransport(t.name)}
                              className="gap-1.5 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:block">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ===== PLACE ADD/EDIT DIALOG ===== */}
      <Dialog
        open={showPlaceForm}
        onOpenChange={(open) => !open && closePlaceForm()}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingPlace ? "Edit Place" : "Add New Place"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handlePlaceSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="place-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                data-ocid="admin.place.input"
                id="place-name"
                value={placeForm.name}
                onChange={(e) =>
                  setPlaceForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Alappuzha Beach"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="place-category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Input
                id="place-category"
                value={placeForm.category}
                onChange={(e) =>
                  setPlaceForm((f) => ({ ...f, category: e.target.value }))
                }
                placeholder="e.g. Beach, Backwaters, Heritage"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="place-description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="place-description"
                value={placeForm.description}
                onChange={(e) =>
                  setPlaceForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Describe this place…"
                rows={3}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="place-maps">
                Google Maps URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="place-maps"
                value={placeForm.mapsUrl}
                onChange={(e) =>
                  setPlaceForm((f) => ({ ...f, mapsUrl: e.target.value }))
                }
                placeholder="https://maps.google.com/?q=…"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="place-image">Image URL</Label>
              <Input
                id="place-image"
                value={placeForm.imageUrl}
                onChange={(e) =>
                  setPlaceForm((f) => ({ ...f, imageUrl: e.target.value }))
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <AnimatePresence>
              {placeFormError && (
                <motion.div
                  data-ocid="admin.error_state"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Alert className="border-destructive/30 bg-destructive/5 text-destructive flex items-center gap-2 py-2 px-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{placeFormError}</span>
                  </Alert>
                </motion.div>
              )}
              {placeFormSuccess && (
                <motion.div
                  data-ocid="admin.success_state"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Alert className="border-green-300 bg-green-50 text-green-700 flex items-center gap-2 py-2 px-3">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">
                      {editingPlace ? "Updated!" : "Place added!"}
                    </span>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <DialogFooter className="gap-2 pt-2">
              <Button
                data-ocid="admin.place.cancel_button"
                type="button"
                variant="outline"
                onClick={closePlaceForm}
              >
                Cancel
              </Button>
              <Button
                data-ocid="admin.place.submit_button"
                type="submit"
                disabled={isSaving}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {editingPlace ? "Update Place" : "Add Place"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Place Delete Dialog */}
      <Dialog
        open={confirmDeletePlace !== null}
        onOpenChange={(open) => !open && setConfirmDeletePlace(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" /> Delete Place?
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            This action cannot be undone. The place will be permanently removed.
          </p>
          <DialogFooter className="gap-2 mt-4">
            <Button
              data-ocid="admin.place.cancel_button"
              variant="outline"
              onClick={() => setConfirmDeletePlace(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.place.confirm_button"
              variant="destructive"
              disabled={deletePlace.isPending}
              onClick={() =>
                confirmDeletePlace !== null &&
                handlePlaceDelete(confirmDeletePlace)
              }
              className="gap-2"
            >
              {deletePlace.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== RESTAURANT ADD/EDIT DIALOG ===== */}
      <Dialog
        open={showRestaurantForm}
        onOpenChange={(open) => !open && closeRestaurantForm()}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingRestaurant ? "Edit Restaurant" : "Add New Restaurant"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleRestaurantSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="rest-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                data-ocid="admin.restaurant.input"
                id="rest-name"
                value={restaurantForm.name}
                onChange={(e) =>
                  setRestaurantForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Chakara Restaurant"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="rest-cuisine">
                  Cuisine <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={restaurantForm.cuisine}
                  onValueChange={(v) =>
                    setRestaurantForm((f) => ({
                      ...f,
                      cuisine: v as Restaurant["cuisine"],
                    }))
                  }
                  required
                >
                  <SelectTrigger
                    id="rest-cuisine"
                    data-ocid="admin.restaurant.select"
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Seafood">Seafood</SelectItem>
                    <SelectItem value="Kerala">Kerala</SelectItem>
                    <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="Multi-cuisine">Multi-cuisine</SelectItem>
                    <SelectItem value="Café">Café</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rest-price">
                  Price Range <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={restaurantForm.priceRange}
                  onValueChange={(v) =>
                    setRestaurantForm((f) => ({
                      ...f,
                      priceRange: v as Restaurant["priceRange"],
                    }))
                  }
                  required
                >
                  <SelectTrigger
                    id="rest-price"
                    data-ocid="admin.restaurant.select"
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Budget">Budget</SelectItem>
                    <SelectItem value="Mid-range">Mid-range</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rest-rating">
                Rating (1–5) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="rest-rating"
                type="number"
                min="1"
                max="5"
                value={restaurantForm.rating}
                onChange={(e) =>
                  setRestaurantForm((f) => ({ ...f, rating: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rest-specialty">
                Specialty <span className="text-destructive">*</span>
              </Label>
              <Input
                id="rest-specialty"
                value={restaurantForm.specialty}
                onChange={(e) =>
                  setRestaurantForm((f) => ({
                    ...f,
                    specialty: e.target.value,
                  }))
                }
                placeholder="e.g. Karimeen Pollichathu"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rest-desc">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="rest-desc"
                value={restaurantForm.description}
                onChange={(e) =>
                  setRestaurantForm((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe this restaurant…"
                rows={3}
                required
              />
            </div>

            <AnimatePresence>
              {restaurantFormError && (
                <motion.div
                  data-ocid="admin.restaurant.error_state"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Alert className="border-destructive/30 bg-destructive/5 text-destructive flex items-center gap-2 py-2 px-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{restaurantFormError}</span>
                  </Alert>
                </motion.div>
              )}
              {restaurantFormSuccess && (
                <motion.div
                  data-ocid="admin.restaurant.success_state"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Alert className="border-green-300 bg-green-50 text-green-700 flex items-center gap-2 py-2 px-3">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">
                      {editingRestaurant
                        ? "Restaurant updated!"
                        : "Restaurant added!"}
                    </span>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <DialogFooter className="gap-2 pt-2">
              <Button
                data-ocid="admin.restaurant.cancel_button"
                type="button"
                variant="outline"
                onClick={closeRestaurantForm}
              >
                Cancel
              </Button>
              <Button
                data-ocid="admin.restaurant.submit_button"
                type="submit"
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                {editingRestaurant ? "Update Restaurant" : "Add Restaurant"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Restaurant Delete Dialog */}
      <Dialog
        open={confirmDeleteRestaurant !== null}
        onOpenChange={(open) => !open && setConfirmDeleteRestaurant(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" /> Delete Restaurant?
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            <strong>{confirmDeleteRestaurant}</strong> will be permanently
            removed.
          </p>
          <DialogFooter className="gap-2 mt-4">
            <Button
              data-ocid="admin.restaurant.cancel_button"
              variant="outline"
              onClick={() => setConfirmDeleteRestaurant(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.restaurant.confirm_button"
              variant="destructive"
              onClick={() => {
                if (confirmDeleteRestaurant) {
                  restaurantsStore.remove(confirmDeleteRestaurant);
                  toast.success("Restaurant deleted.");
                  setConfirmDeleteRestaurant(null);
                }
              }}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== STAY ADD/EDIT DIALOG ===== */}
      <Dialog
        open={showStayForm}
        onOpenChange={(open) => !open && closeStayForm()}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingStay ? "Edit Stay" : "Add New Stay"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleStaySubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="stay-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                data-ocid="admin.stay.input"
                id="stay-name"
                value={stayForm.name}
                onChange={(e) =>
                  setStayForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Punnamada Lake Houseboat"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="stay-category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={stayForm.category}
                  onValueChange={(v) =>
                    setStayForm((f) => ({
                      ...f,
                      category: v as StayItem["category"],
                    }))
                  }
                  required
                >
                  <SelectTrigger
                    id="stay-category"
                    data-ocid="admin.stay.select"
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Houseboat">Houseboat</SelectItem>
                    <SelectItem value="Resort">Resort</SelectItem>
                    <SelectItem value="Homestay">Homestay</SelectItem>
                    <SelectItem value="Hotel">Hotel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stay-stars">
                  Stars (1–5) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="stay-stars"
                  type="number"
                  min="1"
                  max="5"
                  value={stayForm.stars}
                  onChange={(e) =>
                    setStayForm((f) => ({ ...f, stars: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stay-price">
                Price <span className="text-destructive">*</span>
              </Label>
              <Input
                id="stay-price"
                value={stayForm.price}
                onChange={(e) =>
                  setStayForm((f) => ({ ...f, price: e.target.value }))
                }
                placeholder="e.g. ₹5,000 – ₹10,000 / night"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stay-desc">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="stay-desc"
                value={stayForm.description}
                onChange={(e) =>
                  setStayForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Describe this stay…"
                rows={3}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stay-amenities">
                Amenities (comma-separated){" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="stay-amenities"
                value={stayForm.amenities}
                onChange={(e) =>
                  setStayForm((f) => ({ ...f, amenities: e.target.value }))
                }
                placeholder="e.g. Wi-Fi, Pool, Spa, Breakfast"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stay-image">Image URL</Label>
              <Input
                id="stay-image"
                value={stayForm.imageUrl}
                onChange={(e) =>
                  setStayForm((f) => ({ ...f, imageUrl: e.target.value }))
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <AnimatePresence>
              {stayFormError && (
                <motion.div
                  data-ocid="admin.stay.error_state"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Alert className="border-destructive/30 bg-destructive/5 text-destructive flex items-center gap-2 py-2 px-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{stayFormError}</span>
                  </Alert>
                </motion.div>
              )}
              {stayFormSuccess && (
                <motion.div
                  data-ocid="admin.stay.success_state"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Alert className="border-green-300 bg-green-50 text-green-700 flex items-center gap-2 py-2 px-3">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">
                      {editingStay ? "Stay updated!" : "Stay added!"}
                    </span>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <DialogFooter className="gap-2 pt-2">
              <Button
                data-ocid="admin.stay.cancel_button"
                type="button"
                variant="outline"
                onClick={closeStayForm}
              >
                Cancel
              </Button>
              <Button
                data-ocid="admin.stay.submit_button"
                type="submit"
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                {editingStay ? "Update Stay" : "Add Stay"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ===== TRANSPORT TAB CONTENT ===== */}

      {/* Transport Add/Edit Dialog */}
      <Dialog
        open={showTransportForm}
        onOpenChange={(open) => !open && closeTransportForm()}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingTransport ? "Edit Transport" : "Add New Transport"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleTransportSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="transport-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                data-ocid="admin.transport.input"
                id="transport-name"
                value={transportForm.name}
                onChange={(e) =>
                  setTransportForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Luxury Houseboat Hire"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="transport-type">
                  Type <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="transport-type"
                  value={transportForm.type}
                  onChange={(e) =>
                    setTransportForm((f) => ({ ...f, type: e.target.value }))
                  }
                  placeholder="e.g. Houseboat"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="transport-category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={transportForm.category}
                  onValueChange={(v) =>
                    setTransportForm((f) => ({
                      ...f,
                      category: v as TransportItem["category"],
                    }))
                  }
                  required
                >
                  <SelectTrigger
                    id="transport-category"
                    data-ocid="admin.transport.select"
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Boat">Boat</SelectItem>
                    <SelectItem value="Road">Road</SelectItem>
                    <SelectItem value="Cycle">Cycle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="transport-price">
                Price Range <span className="text-destructive">*</span>
              </Label>
              <Input
                id="transport-price"
                value={transportForm.priceRange}
                onChange={(e) =>
                  setTransportForm((f) => ({
                    ...f,
                    priceRange: e.target.value,
                  }))
                }
                placeholder="e.g. ₹500 – ₹2,000 / hr"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="transport-desc">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="transport-desc"
                value={transportForm.description}
                onChange={(e) =>
                  setTransportForm((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe this transport option…"
                rows={3}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="transport-capacity">
                Capacity <span className="text-destructive">*</span>
              </Label>
              <Input
                id="transport-capacity"
                value={transportForm.capacity}
                onChange={(e) =>
                  setTransportForm((f) => ({
                    ...f,
                    capacity: e.target.value,
                  }))
                }
                placeholder="e.g. 2–8 passengers"
                required
              />
            </div>

            <AnimatePresence>
              {transportFormError && (
                <motion.div
                  data-ocid="admin.transport.error_state"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Alert className="border-destructive/30 bg-destructive/5 text-destructive flex items-center gap-2 py-2 px-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{transportFormError}</span>
                  </Alert>
                </motion.div>
              )}
              {transportFormSuccess && (
                <motion.div
                  data-ocid="admin.transport.success_state"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Alert className="border-green-300 bg-green-50 text-green-700 flex items-center gap-2 py-2 px-3">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">
                      {editingTransport
                        ? "Transport updated!"
                        : "Transport added!"}
                    </span>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <DialogFooter className="gap-2 pt-2">
              <Button
                data-ocid="admin.transport.cancel_button"
                type="button"
                variant="outline"
                onClick={closeTransportForm}
              >
                Cancel
              </Button>
              <Button
                data-ocid="admin.transport.submit_button"
                type="submit"
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                {editingTransport ? "Update Transport" : "Add Transport"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transport Delete Dialog */}
      <Dialog
        open={confirmDeleteTransport !== null}
        onOpenChange={(open) => !open && setConfirmDeleteTransport(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" /> Delete Transport?
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            <strong>{confirmDeleteTransport}</strong> will be permanently
            removed.
          </p>
          <DialogFooter className="gap-2 mt-4">
            <Button
              data-ocid="admin.transport.cancel_button"
              variant="outline"
              onClick={() => setConfirmDeleteTransport(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.transport.confirm_button"
              variant="destructive"
              onClick={() => {
                if (confirmDeleteTransport) {
                  transportStore.remove(confirmDeleteTransport);
                  toast.success("Transport deleted.");
                  setConfirmDeleteTransport(null);
                }
              }}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stay Delete Dialog */}
      <Dialog
        open={confirmDeleteStay !== null}
        onOpenChange={(open) => !open && setConfirmDeleteStay(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" /> Delete Stay?
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            <strong>{confirmDeleteStay}</strong> will be permanently removed.
          </p>
          <DialogFooter className="gap-2 mt-4">
            <Button
              data-ocid="admin.stay.cancel_button"
              variant="outline"
              onClick={() => setConfirmDeleteStay(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.stay.confirm_button"
              variant="destructive"
              onClick={() => {
                if (confirmDeleteStay) {
                  staysStore.remove(confirmDeleteStay);
                  toast.success("Stay deleted.");
                  setConfirmDeleteStay(null);
                }
              }}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
