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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle,
  Edit,
  Loader2,
  Plus,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddTouristPlace,
  useAllTouristPlaces,
  useDeleteTouristPlace,
  useIsCallerAdmin,
  useUpdateTouristPlace,
} from "../hooks/useQueries";
import type { TouristPlace } from "../hooks/useQueries";

type FormState = {
  id: string;
  name: string;
  description: string;
  category: string;
  mapsUrl: string;
  imageUrl: string;
};

const EMPTY_FORM: FormState = {
  id: "",
  name: "",
  description: "",
  category: "",
  mapsUrl: "",
  imageUrl: "",
};

export default function AdminPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: checkingAdmin } = useIsCallerAdmin();
  const { data: places, isLoading: loadingPlaces } = useAllTouristPlaces();
  const addPlace = useAddTouristPlace();
  const updatePlace = useUpdateTouristPlace();
  const deletePlace = useDeleteTouristPlace();

  const [showForm, setShowForm] = useState(false);
  const [editingPlace, setEditingPlace] = useState<TouristPlace | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<bigint | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  const isLoggedIn = !!identity;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-water-mesh flex items-center justify-center px-4">
        <div className="text-center">
          <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Authentication Required
          </h2>
          <p className="text-muted-foreground">
            Please sign in to access the admin panel.
          </p>
        </div>
      </div>
    );
  }

  if (checkingAdmin) {
    return (
      <div
        data-ocid="admin.loading_state"
        className="min-h-screen bg-water-mesh flex items-center justify-center"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-water-mesh flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground">
            You do not have administrator privileges for this app.
          </p>
        </div>
      </div>
    );
  }

  const openAddForm = () => {
    setEditingPlace(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setFormSuccess(false);
    setShowForm(true);
  };

  const openEditForm = (place: TouristPlace) => {
    setEditingPlace(place);
    setForm({
      id: place.id.toString(),
      name: place.name,
      description: place.description,
      category: place.category,
      mapsUrl: place.mapsUrl,
      imageUrl: place.imageUrl,
    });
    setFormError("");
    setFormSuccess(false);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingPlace(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setFormSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess(false);

    if (
      !form.name.trim() ||
      !form.description.trim() ||
      !form.category.trim() ||
      !form.mapsUrl.trim()
    ) {
      setFormError("Please fill in all required fields.");
      return;
    }

    const place: TouristPlace = {
      id: editingPlace ? editingPlace.id : BigInt(Date.now()),
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      mapsUrl: form.mapsUrl.trim(),
      imageUrl: form.imageUrl.trim(),
    };

    try {
      if (editingPlace) {
        await updatePlace.mutateAsync(place);
        toast.success("Place updated successfully!");
      } else {
        await addPlace.mutateAsync(place);
        toast.success("Place added successfully!");
      }
      setFormSuccess(true);
      setTimeout(closeForm, 1200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setFormError(msg);
      toast.error(`Operation failed: ${msg}`);
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deletePlace.mutateAsync(id);
      toast.success("Place deleted.");
      setConfirmDelete(null);
    } catch {
      toast.error("Failed to delete place.");
      setConfirmDelete(null);
    }
  };

  const isSaving = addPlace.isPending || updatePlace.isPending;

  return (
    <div className="min-h-screen bg-water-mesh">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-14">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-4xl font-bold mb-1">Admin Panel</h1>
          <p className="text-primary-foreground/70">
            Manage tourist places and content.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Add button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Tourist Places
          </h2>
          <Button
            data-ocid="admin.add_button"
            onClick={openAddForm}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Add Place
          </Button>
        </div>

        {/* Table */}
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
            <Table>
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
                  <TableRow key={place.id.toString()} className="group">
                    <TableCell className="font-medium">{place.name}</TableCell>
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
                          onClick={() => openEditForm(place)}
                          className="gap-1.5 text-muted-foreground hover:text-primary"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span className="hidden sm:block">Edit</span>
                        </Button>
                        <Button
                          data-ocid={`admin.place.delete_button.${i + 1}`}
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmDelete(place.id)}
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
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingPlace ? "Edit Place" : "Add New Place"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                data-ocid="admin.place.input"
                id="name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Alappuzha Beach"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Input
                id="category"
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                placeholder="e.g. Beach, Backwaters, Heritage"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Describe this place…"
                rows={3}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mapsUrl">
                Google Maps URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="mapsUrl"
                value={form.mapsUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, mapsUrl: e.target.value }))
                }
                placeholder="https://maps.google.com/?q=…"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={form.imageUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, imageUrl: e.target.value }))
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {formError && (
                <motion.div
                  data-ocid="admin.error_state"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Alert className="border-destructive/30 bg-destructive/5 text-destructive flex items-center gap-2 py-2 px-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{formError}</span>
                  </Alert>
                </motion.div>
              )}
              {formSuccess && (
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
                onClick={closeForm}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDelete !== null}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Delete Place?
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            This action cannot be undone. The place will be permanently removed.
          </p>
          <DialogFooter className="gap-2 mt-4">
            <Button
              data-ocid="admin.place.cancel_button"
              variant="outline"
              onClick={() => setConfirmDelete(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.place.confirm_button"
              variant="destructive"
              disabled={deletePlace.isPending}
              onClick={() =>
                confirmDelete !== null && handleDelete(confirmDelete)
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
    </div>
  );
}
