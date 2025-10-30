import React, { useState, useEffect } from "react";
import { subdivisionsAPI } from "../../api/subdivisions";
import { typeSubdivisionsAPI } from "../../api/typeSubdivision";
import {
  Subdivision,
  CreateSubdivisionDTO,
  UpdateSubdivisionDTO,
} from "../../types/Subdivision";
import { TypeSubdivision } from "../../types/TypeSubdivision";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { validators } from "../../utils/validators";

export const SubdivisionsPage = () => {
  const [subdivisions, setSubdivisions] = useState<Subdivision[]>([]);
  const [typeSubdivisions, setTypeSubdivisions] = useState<TypeSubdivision[]>(
    []
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingSubdivision, setEditingSubdivision] =
    useState<Subdivision | null>(null);
  const [formData, setFormData] = useState<CreateSubdivisionDTO>({
    code: "",
    libelle: "",
    typeSubdivisionReference: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSubdivisions();
    loadTypeSubdivisions();
  }, []);

  const loadSubdivisions = async () => {
    try {
      const data = await subdivisionsAPI.getAll();
      setSubdivisions(data);
    } catch {
      toast.error("Erreur lors du chargement des subdivisions");
    }
  };

  const loadTypeSubdivisions = async () => {
    try {
      const data = await typeSubdivisionsAPI.getAll();
      setTypeSubdivisions(data);
    } catch {
      toast.error("Erreur lors du chargement des types de subdivision");
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const codeError = validators.required(formData.code, "Le code");
    if (codeError) newErrors.code = codeError;

    const libelleError = validators.required(formData.libelle, "Le libellé");
    if (libelleError) newErrors.libelle = libelleError;

    const typeError = validators.required(
      formData.typeSubdivisionReference,
      "Le type"
    );
    if (typeError) newErrors.typeSubdivisionReference = typeError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (editingSubdivision) {
        const updateData: UpdateSubdivisionDTO = {
          reference: editingSubdivision.reference,
          code: formData.code,
          libelle: formData.libelle,
          typeSubdivisionReference: formData.typeSubdivisionReference,
        };
        await subdivisionsAPI.update(updateData);
        toast.success("Subdivision modifiée avec succès");
      } else {
        await subdivisionsAPI.create(formData);
        toast.success("Subdivision créée avec succès");
      }

      setIsDialogOpen(false);
      resetForm();
      loadSubdivisions();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erreur lors de l'opération"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (subdivision: Subdivision) => {
    setEditingSubdivision(subdivision);
    setFormData({
      code: subdivision.code,
      libelle: subdivision.libelle,
      typeSubdivisionReference: subdivision.typeSubdivision?.reference || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (reference: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette subdivision ?"))
      return;

    try {
      await subdivisionsAPI.delete(reference);
      toast.success("Subdivision supprimée");
      loadSubdivisions();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setFormData({ code: "", libelle: "", typeSubdivisionReference: "" });
    setEditingSubdivision(null);
    setErrors({});
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Subdivisions</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une subdivision
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSubdivision
                  ? "Modifier la Subdivision"
                  : "Nouvelle Subdivision"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className={errors.code ? "border-destructive" : ""}
                  placeholder="Ex: SUB001"
                />
                {errors.code && (
                  <p className="text-destructive text-sm">{errors.code}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="libelle">Libellé *</Label>
                <Input
                  id="libelle"
                  value={formData.libelle}
                  onChange={(e) =>
                    setFormData({ ...formData, libelle: e.target.value })
                  }
                  className={errors.libelle ? "border-destructive" : ""}
                  placeholder="Ex: Région Maritime"
                />
                {errors.libelle && (
                  <p className="text-destructive text-sm">{errors.libelle}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="typeSubdivisionReference">
                  Type de subdivision *
                </Label>
                <select
                  id="typeSubdivisionReference"
                  value={formData.typeSubdivisionReference}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      typeSubdivisionReference: e.target.value,
                    })
                  }
                  className={`w-full border rounded px-3 py-2 ${
                    errors.typeSubdivisionReference ? "border-destructive" : ""
                  }`}
                >
                  <option value="">-- Sélectionner --</option>
                  {typeSubdivisions.map((type) => (
                    <option key={type.reference} value={type.reference}>
                      {type.libelle}
                    </option>
                  ))}
                </select>
                {errors.typeSubdivisionReference && (
                  <p className="text-destructive text-sm">
                    {errors.typeSubdivisionReference}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading
                    ? editingSubdivision
                      ? "Modification..."
                      : "Création..."
                    : editingSubdivision
                    ? "Modifier"
                    : "Créer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Libellé</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subdivisions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  Aucune subdivision trouvée
                </TableCell>
              </TableRow>
            ) : (
              subdivisions.map((subdivision) => (
                <TableRow key={subdivision.reference}>
                  <TableCell>{subdivision.code}</TableCell>
                  <TableCell>{subdivision.libelle}</TableCell>
                  <TableCell>
                    {subdivision.typeSubdivision?.libelle || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(subdivision)}
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(subdivision.reference)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
