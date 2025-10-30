// import React, { useState, useEffect } from 'react';
// import { postesAPI } from '../../api/postes';
// import { subdivisionsAPI } from '../../api/subdivisions';
// import { Poste, CreatePosteDTO } from '../../types/Poste';
// import { Subdivision } from '../../types/Subdivision';
// import { Button } from '../../components/ui/button';
// import { Input } from '../../components/ui/input';
// import { Label } from '../../components/ui/label';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
// import { Plus, Trash2 } from 'lucide-react';
// import { toast } from 'sonner';
// import { validators } from '../../utils/validators';

// export const PostesPage = () => {
//   const [postes, setPostes] = useState<Poste[]>([]);
//   const [subdivisions, setSubdivisions] = useState<Subdivision[]>([]);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [formData, setFormData] = useState<CreatePosteDTO>({
//     libelle: '',
//     code: '',
//   });
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   useEffect(() => {
//     loadPostes();
//     loadSubdivisions();
//   }, []);

//   const loadPostes = async () => {
//     try {
//       const data = await postesAPI.getAll();
//       setPostes(data);
//     } catch (error) {
//       toast.error('Erreur lors du chargement des postes');
//     }
//   };

//   const loadSubdivisions = async () => {
//     try {
//       const data = await subdivisionsAPI.getAll();
//       setSubdivisions(data);
//     } catch (error) {
//       toast.error('Erreur lors du chargement des subdivisions');
//     }
//   };

//   const validateForm = (): boolean => {
//     const newErrors: Record<string, string> = {};

//     const libelleError = validators.required(formData.libelle, 'Le libellé');
//     if (libelleError) newErrors.libelle = libelleError;

//     const codeError = validators.required(formData.code, 'Le code');
//     if (codeError) newErrors.code = codeError;

//     if (!formData.subdivisionId) {
//       newErrors.subdivisionId = 'La subdivision est requise';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!validateForm()) return;

//     setIsLoading(true);
//     try {
//       await postesAPI.create(formData);
//       toast.success('Poste créé avec succès');
//       setIsDialogOpen(false);
//       resetForm();
//       loadPostes();
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'Erreur lors de la création');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDelete = async (reference: string) => {
//     if (!confirm('Êtes-vous sûr de vouloir supprimer ce poste ?')) return;

//     try {
//       await postesAPI.delete(ref);
//       toast.success('Poste supprimé avec succès');
//       loadPostes();
//     } catch (error: any) {
//       // Vérifier si c'est une erreur 204 (pas trouvé)
//       if (error.response?.data?.code === 204) {
//         toast.error('Poste introuvable ou déjà supprimé');
//       } else {
//         toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
//       }
//       console.error('Erreur suppression:', error);
//     }
//   };

//   const resetForm = () => {
//     setFormData({ libelle: '', subdivisionId: 0 });
//     setErrors({});
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h1>Gestion des Postes</h1>
//         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//           <DialogTrigger asChild>
//             <Button onClick={() => resetForm()}>
//               <Plus className="h-4 w-4 mr-2" />
//               Ajouter un poste
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="max-w-md">
//             <DialogHeader>
//               <DialogTitle>Nouveau Poste</DialogTitle>
//             </DialogHeader>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="libelle">Libellé *</Label>
//                 <Input
//                   id="libelle"
//                   value={formData.libelle}
//                   onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
//                   className={errors.libelle ? 'border-destructive' : ''}
//                   placeholder="Ex: Chef de service"
//                 />
//                 {errors.libelle && <p className="text-destructive text-sm">{errors.libelle}</p>}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="subdivision">Subdivision *</Label>
//                 <Select
//                   value={formData.subdivisionId?.toString()}
//                   onValueChange={(value) => setFormData({ ...formData, subdivisionId: parseInt(value) })}
//                 >
//                   <SelectTrigger className={errors.subdivisionId ? 'border-destructive' : ''}>
//                     <SelectValue placeholder="Sélectionner une subdivision" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {subdivisions.map((subdivision) => (
//                       <SelectItem key={subdivision.id} value={subdivision.id.toString()}>
//                         {subdivision.libelle}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 {errors.subdivisionId && <p className="text-destructive text-sm">{errors.subdivisionId}</p>}
//               </div>

//               <div className="flex justify-end gap-2">
//                 <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
//                   Annuler
//                 </Button>
//                 <Button type="submit" disabled={isLoading}>
//                   {isLoading ? 'Création...' : 'Créer'}
//                 </Button>
//               </div>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </div>

//       <div className="bg-white rounded-lg border">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Libellé</TableHead>
//               <TableHead>Subdivision</TableHead>
//               <TableHead className="text-right">Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {postes.map((poste) => (
//               <TableRow key={poste.reference}>
//                 <TableCell>{poste.code}</TableCell>
//                 <TableCell>{poste.libelle}</TableCell>
//                 {/* <TableCell>{poste.subdivision?.libelle || '-'}</TableCell> */}
//                 <TableCell className="text-right">
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={() => handleDelete(poste.reference)}
//                   >
//                     <Trash2 className="h-4 w-4 text-destructive" />
//                   </Button>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// };

// pages/admin/PostesPage.tsx
import React, { useState, useEffect } from "react";
import { postesAPI } from "../../api/postes";
import { Poste, CreatePosteDTO, UpdatePosteDTO } from "../../types/Poste";
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

export const PostesPage = () => {
  const [postes, setPostes] = useState<Poste[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPoste, setEditingPoste] = useState<Poste | null>(null);
  const [formData, setFormData] = useState<CreatePosteDTO>({
    code: "",
    libelle: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadPostes();
  }, []);

  const loadPostes = async () => {
    try {
      const data = await postesAPI.getAll();
      setPostes(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des postes");
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
      if (editingPoste) {
        // Mode édition : utiliser la référence
        const updateData: UpdatePosteDTO = {
          reference: editingPoste.reference, // ✅ Utilisation de la référence
          code: formData.code,
          libelle: formData.libelle,
        };
        await postesAPI.update(updateData);
        toast.success("Poste modifié avec succès");
      } else {
        // Mode création
        await postesAPI.create(formData);
        toast.success("Poste créé avec succès");
      }

      setIsDialogOpen(false);
      resetForm();
      loadPostes();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erreur lors de l'opération"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (poste: Poste) => {
    setEditingPoste(poste);
    setFormData({
      code: poste.code,
      libelle: poste.libelle,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (reference: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce poste ?")) return;

    try {
      await postesAPI.delete(reference); // ✅ Utilisation de la référence
      toast.success("Poste supprimé");
      loadPostes();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setFormData({ code: "", libelle: "" });
    setEditingPoste(null);
    setErrors({});
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Postes</h1>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open: boolean) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un poste
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
          {editingPoste ? "Modifier le Poste" : "Nouveau Poste"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={(handleSubmit as React.FormEventHandler<HTMLFormElement>)} className="space-y-4">
              <div className="space-y-2">
          <Label htmlFor="code">Code *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, code: e.target.value })
            }
            className={errors.code ? "border-destructive" : ""}
            placeholder="Ex: POST001"
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, libelle: e.target.value })
            }
            className={errors.libelle ? "border-destructive" : ""}
            placeholder="Ex: Chef de service"
          />
          {errors.libelle && (
            <p className="text-destructive text-sm">{errors.libelle}</p>
          )}
              </div>

              <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsDialogOpen(false);
              resetForm();
            }}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? editingPoste
                ? "Modification..."
                : "Création..."
              : editingPoste
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
            {postes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground"
                >
                  Aucun poste trouvé
                </TableCell>
              </TableRow>
            ) : (
              postes.map((poste) => (
                <TableRow key={poste.reference}>
                  {/* ✅ Utilisation de reference comme key */}
                  <TableCell className="font-medium">{poste.code}</TableCell>
                  <TableCell>{poste.libelle}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(poste)}
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(poste.reference)}
                        // {/* ✅ Référence */}
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
