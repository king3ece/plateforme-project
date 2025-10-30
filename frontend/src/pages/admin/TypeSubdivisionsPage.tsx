import React, { useState, useEffect } from "react";
import { typeSubdivisionsAPI } from "../../api/typeSubdivision";
import {
  TypeSubdivision,
  CreateTypeSubdivisionDTO,
  UpdateTypeSubdivisionDTO,
} from "../../types/TypeSubdivision";
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

export const TypeSubdivisionsPage = () => {
  const [types, setTypes] = useState<TypeSubdivision[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingType, setEditingType] = useState<TypeSubdivision | null>(null);
  const [formData, setFormData] = useState<CreateTypeSubdivisionDTO>({
    code: "",
    libelle: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    try {
      const data = await typeSubdivisionsAPI.getAll();
      console.debug("TypeSubdivisionsPage.loadTypes data:", data);
      setTypes(data || []);
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (editingType) {
        const updateData: UpdateTypeSubdivisionDTO = {
          code: formData.code,
          libelle: formData.libelle,
        };
        await typeSubdivisionsAPI.update(updateData);
        toast.success("Type modifié avec succès");
      } else {
        await typeSubdivisionsAPI.create(formData);
        toast.success("Type créé avec succès");
      }

      setIsDialogOpen(false);
      resetForm();
      loadTypes();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erreur lors de l'opération"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (type: TypeSubdivision) => {
    setEditingType(type);
    setFormData({
      code: type.code,
      libelle: type.libelle,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (reference: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce type ?")) return;

    try {
      await typeSubdivisionsAPI.delete(reference);
      toast.success("Type supprimé");
      loadTypes();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setFormData({ code: "", libelle: "" });
    setEditingType(null);
    setErrors({});
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Types de Subdivision</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un type
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingType ? "Modifier le Type" : "Nouveau Type"}
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
                  placeholder="Ex: TYPE001"
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
                  placeholder="Ex: Région, Département, Commune"
                />
                {errors.libelle && (
                  <p className="text-destructive text-sm">{errors.libelle}</p>
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
                    ? editingType
                      ? "Modification..."
                      : "Création..."
                    : editingType
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {types.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground"
                >
                  Aucun type trouvé
                </TableCell>
              </TableRow>
            ) : (
              types.map((type) => (
                <TableRow key={type.reference}>
                  <TableCell>{type.code}</TableCell>
                  <TableCell>{type.libelle}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(type)}
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(type.reference)}
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
