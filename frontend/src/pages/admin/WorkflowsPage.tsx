// #file:c:\Users\cegno\PROJET-STAGE-IDS\update\plateforme\frontend\src\pages\admin\WorkflowsPage.tsx
// # WorkflowsPage.tsx
import { useState, useEffect } from "react";
import { workflowsAPI } from "../../api/workflows";
import { usersAPI } from "../../api/users";
import {
  TypeProcessus,
  Validateur,
  CreateTypeProcessusDTO,
  CreateValidateurDTO,
} from "../../types/Workflow";
import { User } from "../../types/User";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Plus, Trash2, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { validators } from "../../utils/validators";

export const WorkflowsPage = () => {
  const [typeProcessus, setTypeProcessus] = useState<TypeProcessus[]>([]);
  const [selectedProcessus, setSelectedProcessus] =
    useState<TypeProcessus | null>(null);
  const [validateurs, setValidateurs] = useState<Validateur[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessusDialogOpen, setIsProcessusDialogOpen] = useState(false);
  const [isValidateurDialogOpen, setIsValidateurDialogOpen] = useState(false);

  const [processusFormData, setProcessusFormData] =
    useState<CreateTypeProcessusDTO>({
      code: "",
      libelle: "",
    });

  const [validateurFormData, setValidateurFormData] =
    useState<CreateValidateurDTO>({
      typeProcessusId: 0,
      ordre: 1,
    });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadTypeProcessus();
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedProcessus) {
      loadValidateurs(selectedProcessus.id);
    }
  }, [selectedProcessus]);

  const loadTypeProcessus = async () => {
    try {
      const data = await workflowsAPI.getAllTypeProcessus();
      setTypeProcessus(data);
    } catch (error) {
      console.error("Error loading type processus:", error);
      toast.error("Erreur lors du chargement des types de processus");
    }
  };

  const loadValidateurs = async (typeProcessusId: number) => {
    try {
      const data = await workflowsAPI.getValidateursByProcessus(
        typeProcessusId
      );
      setValidateurs(data);
    } catch (error) {
      console.error("Error loading validateurs:", error);
      toast.error("Erreur lors du chargement des validateurs");
    }
  };

  const loadUsers = async () => {
    try {
      const data = await usersAPI.getAll();
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    }
  };

  const handleCreateProcessus = async (e: React.FormEvent) => {
    e.preventDefault();

    const codeError = validators.required(processusFormData.code, "Le code");
    const libelleError = validators.required(
      processusFormData.libelle,
      "Le libellé"
    );
    if (codeError || libelleError) {
      setErrors({ code: codeError, libelle: libelleError });
      return;
    }

    setIsLoading(true);
    try {
      await workflowsAPI.createTypeProcessus(processusFormData);
      toast.success("Type de processus créé avec succès");
      setIsProcessusDialogOpen(false);
      setProcessusFormData({ code: "", libelle: "" });
      setErrors({});
      await loadTypeProcessus();
    } catch (error: any) {
      console.error("Error creating processus:", error);
      toast.error(
        error.response?.data?.message || "Erreur lors de la création"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateValidateur = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProcessus) {
      toast.error("Veuillez sélectionner un type de processus");
      return;
    }

    const newErrors: Record<string, string> = {};
    if (!validateurFormData.ordre) newErrors.ordre = "L'ordre est requis";
    if (!validateurFormData.userId) {
      newErrors.userId = "L'utilisateur est requis";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const data: CreateValidateurDTO = {
        typeProcessusId: selectedProcessus.id,
        ordre: validateurFormData.ordre,
        userId: validateurFormData.userId,
      };

      await workflowsAPI.createValidateur(data);
      toast.success("Validateur ajouté avec succès");
      setIsValidateurDialogOpen(false);
      resetValidateurForm();
      await loadValidateurs(selectedProcessus.id);
    } catch (error: any) {
      console.error("Error creating validateur:", error);
      toast.error(
        error.response?.data?.message || "Erreur lors de la création"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProcessus = async (reference: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce type de processus ?"))
      return;

    try {
      await workflowsAPI.deleteTypeProcessus(reference);
      toast.success("Type de processus supprimé");
      if (selectedProcessus?.reference === reference)
        setSelectedProcessus(null);
      await loadTypeProcessus();
    } catch (error) {
      console.error("Error deleting processus:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleDeleteValidateur = async (reference: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce validateur ?")) return;

    try {
      await workflowsAPI.deleteValidateur(reference);
      toast.success("Validateur supprimé");
      if (selectedProcessus) {
        await loadValidateurs(selectedProcessus.id);
      }
    } catch (error) {
      console.error("Error deleting validateur:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetValidateurForm = () => {
    setValidateurFormData({
      typeProcessusId: 0,
      ordre:
        validateurs.length > 0
          ? Math.max(...validateurs.map((v) => v.ordre)) + 1
          : 1,
    });
    setErrors({});
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Workflows</h1>
        <Dialog
          open={isProcessusDialogOpen}
          onOpenChange={setIsProcessusDialogOpen}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Type de Processus
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nouveau Type de Processus</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateProcessus} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  value={processusFormData.code}
                  onChange={(e) =>
                    setProcessusFormData({
                      ...processusFormData,
                      code: e.target.value,
                    })
                  }
                  className={errors.code ? "border-destructive" : ""}
                  placeholder="Ex: FDM"
                />
                {errors.code && (
                  <p className="text-destructive text-sm">{errors.code}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="libelle">Libellé *</Label>
                <Input
                  id="libelle"
                  value={processusFormData.libelle}
                  onChange={(e) =>
                    setProcessusFormData({
                      ...processusFormData,
                      libelle: e.target.value,
                    })
                  }
                  className={errors.libelle ? "border-destructive" : ""}
                  placeholder="Ex: Fiche Descriptive de Mission"
                />
                {errors.libelle && (
                  <p className="text-destructive text-sm">{errors.libelle}</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsProcessusDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Création..." : "Créer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Types de Processus</CardTitle>
            <CardDescription>
              Sélectionnez un processus pour gérer ses validateurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {typeProcessus.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun type de processus
                </p>
              ) : (
                typeProcessus.map((processus) => (
                  <div
                    key={processus.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedProcessus?.id === processus.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-accent"
                    }`}
                    onClick={() => setSelectedProcessus(processus)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{processus.libelle}</p>
                        <Badge variant="outline" className="mt-1">
                          {processus.code}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProcessus(processus.reference);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Validateurs</CardTitle>
                <CardDescription>
                  {selectedProcessus
                    ? `Chaîne de validation pour: ${selectedProcessus.libelle}`
                    : "Sélectionnez un processus pour voir ses validateurs"}
                </CardDescription>
              </div>
              {selectedProcessus && (
                <Dialog
                  open={isValidateurDialogOpen}
                  onOpenChange={setIsValidateurDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter Validateur
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nouveau Validateur</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={handleCreateValidateur}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="ordre">Ordre *</Label>
                        <Input
                          id="ordre"
                          type="number"
                          min="1"
                          value={validateurFormData.ordre}
                          onChange={(e) =>
                            setValidateurFormData({
                              ...validateurFormData,
                              ordre: parseInt(e.target.value),
                            })
                          }
                          className={errors.ordre ? "border-destructive" : ""}
                        />
                        {errors.ordre && (
                          <p className="text-destructive text-sm">
                            {errors.ordre}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="userId">Utilisateur *</Label>
                        <Select
                          value={validateurFormData.userId?.toString() || ""}
                          onValueChange={(value: string) =>
                            setValidateurFormData({
                              ...validateurFormData,
                              userId: parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger
                            className={
                              errors.userId ? "border-destructive" : ""
                            }
                          >
                            <SelectValue placeholder="Sélectionner un utilisateur" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((user) => (
                              <SelectItem
                                key={user.id}
                                value={user.id.toString()}
                              >
                                {user.lastName} {user.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.userId && (
                          <p className="text-destructive text-sm">
                            {errors.userId}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsValidateurDialogOpen(false)}
                        >
                          Annuler
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Ajout..." : "Ajouter"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedProcessus ? (
              <div className="text-center py-8 text-muted-foreground">
                <UsersIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>
                  Sélectionnez un type de processus pour gérer ses validateurs
                </p>
              </div>
            ) : validateurs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UsersIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun validateur configuré pour ce processus</p>
                <p className="text-sm mt-2">
                  Ajoutez des validateurs pour définir le workflow de validation
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {validateurs
                  .sort((a, b) => a.ordre - b.ordre)
                  .map((validateur, index) => (
                    <div
                      key={validateur.id}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Badge className="mt-1">{validateur.ordre}</Badge>
                          <div className="flex-1">
                            {validateur.user ? (
                              <>
                                <p className="font-medium">
                                  {validateur.user.lastName}{" "}
                                  {validateur.user.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {validateur.user.email}
                                </p>
                                {validateur.user.subdivision && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    🏛️ {validateur.user.subdivision.libelle}
                                    {validateur.user.subdivision
                                      .typeSubdivision && (
                                      <span>
                                        {" "}
                                        (
                                        {
                                          validateur.user.subdivision
                                            .typeSubdivision.libelle
                                        }
                                        )
                                      </span>
                                    )}
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="text-muted-foreground">
                                Validateur non configuré
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDeleteValidateur(validateur.reference)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {index < validateurs.length - 1 && (
                        <div className="ml-6 mt-2 text-muted-foreground text-sm">
                          ↓ Puis...
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// import { useState, useEffect } from "react";
// import { workflowsAPI } from "../../api/workflows";
// import { usersAPI } from "../../api/users";
// import { postesAPI } from "../../api/postes";

// import {
//   TypeProcessus,
//   Validateur,
//   CreateTypeProcessusDTO,
//   CreateValidateurDTO,
// } from "../../types/Workflow";
// import { User } from "../../types/User";
// import { Poste } from "../../types/Poste";

// import { Button } from "../../components/ui/button";
// import { Input } from "../../components/ui/input";
// import { Label } from "../../components/ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "../../components/ui/dialog";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "../../components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../../components/ui/select";
// import { Badge } from "../../components/ui/badge";
// import { Plus, Trash2, Users as UsersIcon } from "lucide-react";
// import { toast } from "sonner";
// import { validators } from "../../utils/validators";

// export const WorkflowsPage = () => {
//   const [typeProcessus, setTypeProcessus] = useState<TypeProcessus[]>([]);
//   const [selectedProcessus, setSelectedProcessus] =
//     useState<TypeProcessus | null>(null);
//   const [validateurs, setValidateurs] = useState<Validateur[]>([]);
//   const [users, setUsers] = useState<User[]>([]);
//   const [postes, setPostes] = useState<Poste[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isProcessusDialogOpen, setIsProcessusDialogOpen] = useState(false);
//   const [isValidateurDialogOpen, setIsValidateurDialogOpen] = useState(false);
//   const [validateurType, setValidateurType] = useState<"user" | "poste">("user");

//   const [processusFormData, setProcessusFormData] =
//     useState<CreateTypeProcessusDTO>({
//       code: "",
//       libelle: "",
//     });

//   const [validateurFormData, setValidateurFormData] =
//     useState<CreateValidateurDTO>({
//       typeProcessusId: 0,
//       ordre: 1,
//     });

//   const [errors, setErrors] = useState<Record<string, string>>({});

//   useEffect(() => {
//     loadTypeProcessus();
//     loadUsers();
//     loadPostes();
//   }, []);

//   useEffect(() => {
//     if (selectedProcessus) {
//       loadValidateurs(selectedProcessus.id);
//     }
//   }, [selectedProcessus]);

//   const loadTypeProcessus = async () => {
//     try {
//       const data = await workflowsAPI.getAllTypeProcessus();
//       setTypeProcessus(data);
//     } catch (error) {
//       console.error("Error loading type processus:", error);
//       toast.error("Erreur lors du chargement des types de processus");
//     }
//   };

//   const loadValidateurs = async (typeProcessusId: number) => {
//     try {
//       const data = await workflowsAPI.getValidateursByProcessus(typeProcessusId);
//       setValidateurs(data);
//     } catch (error) {
//       console.error("Error loading validateurs:", error);
//       toast.error("Erreur lors du chargement des validateurs");
//     }
//   };

//   const loadUsers = async () => {
//     try {
//       const data = await usersAPI.getAll();
//       setUsers(data);
//     } catch (error) {
//       console.error("Error loading users:", error);
//       toast.error("Erreur lors du chargement des utilisateurs");
//     }
//   };

//   const loadPostes = async () => {
//     try {
//       const data = await postesAPI.getAll();
//       setPostes(data);
//     } catch (error) {
//       console.error("Error loading postes:", error);
//       toast.error("Erreur lors du chargement des postes");
//     }
//   };

//   const handleCreateProcessus = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const codeError = validators.required(processusFormData.code, "Le code");
//     const libelleError = validators.required(
//       processusFormData.libelle,
//       "Le libellé"
//     );
//     if (codeError || libelleError) {
//       setErrors({ code: codeError, libelle: libelleError });
//       return;
//     }

//     setIsLoading(true);
//     try {
//       await workflowsAPI.createTypeProcessus(processusFormData);
//       toast.success("Type de processus créé avec succès");
//       setIsProcessusDialogOpen(false);
//       setProcessusFormData({ code: "", libelle: "" });
//       setErrors({});
//       await loadTypeProcessus();
//     } catch (error: any) {
//       console.error("Error creating processus:", error);
//       toast.error(
//         error.response?.data?.message || "Erreur lors de la création"
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCreateValidateur = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!selectedProcessus) {
//       toast.error("Veuillez sélectionner un type de processus");
//       return;
//     }

//     const newErrors: Record<string, string> = {};
//     if (!validateurFormData.ordre) newErrors.ordre = "L'ordre est requis";
//     if (validateurType === "user" && !validateurFormData.userId) {
//       newErrors.userId = "L'utilisateur est requis";
//     }
//     if (validateurType === "poste" && !validateurFormData.posteId) {
//       newErrors.posteId = "Le poste est requis";
//     }

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const data: CreateValidateurDTO = {
//         typeProcessusId: selectedProcessus.id,
//         ordre: validateurFormData.ordre,
//         userId: validateurType === "user" ? validateurFormData.userId : undefined,
//         posteId: validateurType === "poste" ? validateurFormData.posteId : undefined,
//       };

//       await workflowsAPI.createValidateur(data);
//       toast.success("Validateur ajouté avec succès");
//       setIsValidateurDialogOpen(false);
//       resetValidateurForm();
//       await loadValidateurs(selectedProcessus.id);
//     } catch (error: any) {
//       console.error("Error creating validateur:", error);
//       toast.error(
//         error.response?.data?.message || "Erreur lors de la création"
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDeleteProcessus = async (id: number) => {
//     if (!confirm("Êtes-vous sûr de vouloir supprimer ce type de processus ?"))
//       return;

//     try {
//       await workflowsAPI.deleteTypeProcessus(id);
//       toast.success("Type de processus supprimé");
//       if (selectedProcessus?.id === id) setSelectedProcessus(null);
//       await loadTypeProcessus();
//     } catch (error) {
//       console.error("Error deleting processus:", error);
//       toast.error("Erreur lors de la suppression");
//     }
//   };

//   const handleDeleteValidateur = async (id: number) => {
//     if (!confirm("Êtes-vous sûr de vouloir supprimer ce validateur ?")) return;

//     try {
//       await workflowsAPI.deleteValidateur(id);
//       toast.success("Validateur supprimé");
//       if (selectedProcessus) {
//         await loadValidateurs(selectedProcessus.id);
//       }
//     } catch (error) {
//       console.error("Error deleting validateur:", error);
//       toast.error("Erreur lors de la suppression");
//     }
//   };

//   const resetValidateurForm = () => {
//     setValidateurFormData({
//       typeProcessusId: 0,
//       ordre: validateurs.length + 1,
//     });
//     setValidateurType("user");
//     setErrors({});
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold">Gestion des Workflows</h1>
//         <Dialog
//           open={isProcessusDialogOpen}
//           onOpenChange={setIsProcessusDialogOpen}
//         >
//           <DialogTrigger asChild>
//             <Button>
//               <Plus className="h-4 w-4 mr-2" />
//               Nouveau Type de Processus
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="max-w-md">
//             <DialogHeader>
//               <DialogTitle>Nouveau Type de Processus</DialogTitle>
//             </DialogHeader>
//             <form onSubmit={handleCreateProcessus} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="code">Code *</Label>
//                 <Input
//                   id="code"
//                   value={processusFormData.code}
//                   onChange={(e) =>
//                     setProcessusFormData({
//                       ...processusFormData,
//                       code: e.target.value,
//                     })
//                   }
//                   className={errors.code ? "border-destructive" : ""}
//                   placeholder="Ex: FDM"
//                 />
//                 {errors.code && (
//                   <p className="text-destructive text-sm">{errors.code}</p>
//                 )}
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="libelle">Libellé *</Label>
//                 <Input
//                   id="libelle"
//                   value={processusFormData.libelle}
//                   onChange={(e) =>
//                     setProcessusFormData({
//                       ...processusFormData,
//                       libelle: e.target.value,
//                     })
//                   }
//                   className={errors.libelle ? "border-destructive" : ""}
//                   placeholder="Ex: Fiche Descriptive de Mission"
//                 />
//                 {errors.libelle && (
//                   <p className="text-destructive text-sm">{errors.libelle}</p>
//                 )}
//               </div>

//               <div className="flex justify-end gap-2">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => setIsProcessusDialogOpen(false)}
//                 >
//                   Annuler
//                 </Button>
//                 <Button type="submit" disabled={isLoading}>
//                   {isLoading ? "Création..." : "Créer"}
//                 </Button>
//               </div>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <Card className="lg:col-span-1">
//           <CardHeader>
//             <CardTitle>Types de Processus</CardTitle>
//             <CardDescription>
//               Sélectionnez un processus pour gérer ses validateurs
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-2">
//               {typeProcessus.length === 0 ? (
//                 <p className="text-sm text-muted-foreground text-center py-4">
//                   Aucun type de processus
//                 </p>
//               ) : (
//                 typeProcessus.map((processus) => (
//                   <div
//                     key={processus.id}
//                     className={`p-3 rounded-lg border cursor-pointer transition-colors ${
//                       selectedProcessus?.id === processus.id
//                         ? "border-primary bg-primary/5"
//                         : "hover:bg-accent"
//                     }`}
//                     onClick={() => setSelectedProcessus(processus)}
//                   >
//                     <div className="flex items-start justify-between">
//                       <div className="flex-1">
//                         <p className="font-medium">{processus.libelle}</p>
//                         <Badge variant="outline" className="mt-1">
//                           {processus.code}
//                         </Badge>
//                       </div>
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleDeleteProcessus(processus.id);
//                         }}
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="lg:col-span-2">
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <div>
//                 <CardTitle>Validateurs</CardTitle>
//                 <CardDescription>
//                   {selectedProcessus
//                     ? `Chaîne de validation pour: ${selectedProcessus.libelle}`
//                     : "Sélectionnez un processus pour voir ses validateurs"}
//                 </CardDescription>
//               </div>
//               {selectedProcessus && (
//                 <Dialog
//                   open={isValidateurDialogOpen}
//                   onOpenChange={setIsValidateurDialogOpen}
//                 >
//                   <DialogTrigger asChild>
//                     <Button size="sm">
//                       <Plus className="h-4 w-4 mr-2" />
//                       Ajouter Validateur
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent>
//                     <DialogHeader>
//                       <DialogTitle>Nouveau Validateur</DialogTitle>
//                     </DialogHeader>
//                     <form onSubmit={handleCreateValidateur} className="space-y-4">
//                       <div className="space-y-2">
//                         <Label htmlFor="ordre">Ordre *</Label>
//                         <Input
//                           id="ordre"
//                           type="number"
//                           min="1"
//                           value={validateurFormData.ordre}
//                           onChange={(e) =>
//                             setValidateurFormData({
//                               ...validateurFormData,
//                               ordre: parseInt(e.target.value),
//                             })
//                           }
//                           className={errors.ordre ? "border-destructive" : ""}
//                         />
//                         {errors.ordre && (
//                           <p className="text-destructive text-sm">{errors.ordre}</p>
//                         )}
//                       </div>

//                       <div className="space-y-2">
//                         <Label>Type de validateur *</Label>
//                         <Select
//                           value={validateurType}
//                           onValueChange={(value: "user" | "poste") =>
//                             setValidateurType(value)
//                           }
//                         >
//                           <SelectTrigger>
//                             <SelectValue />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="user">Utilisateur spécifique</SelectItem>
//                             <SelectItem value="poste">Poste</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>

//                       {validateurType === "user" ? (
//                         <div className="space-y-2">
//                           <Label htmlFor="userId">Utilisateur *</Label>
//                           <Select
//                             value={validateurFormData.userId?.toString()}
//                             onValueChange={(value) =>
//                               setValidateurFormData({
//                                 ...validateurFormData,
//                                 userId: parseInt(value),
//                               })
//                             }
//                           >
//                             <SelectTrigger
//                               className={errors.userId ? "border-destructive" : ""}
//                             >
//                               <SelectValue placeholder="Sélectionner un utilisateur" />
//                             </SelectTrigger>
//                             <SelectContent>
//                               {users.map((user) => (
//                                 <SelectItem key={user.id} value={user.id.toString()}>
//                                   {user.lastName} {user.name}
//                                 </SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>
//                           {errors.userId && (
//                             <p className="text-destructive text-sm">{errors.userId}</p>
//                           )}
//                         </div>
//                       ) : (
//                         <div className="space-y-2">
//                           <Label htmlFor="posteId">Poste *</Label>
//                           <Select
//                             value={validateurFormData.posteId?.toString()}
//                             onValueChange={(value) =>
//                               setValidateurFormData({
//                                 ...validateurFormData,
//                                 posteId: parseInt(value),
//                               })
//                             }
//                           >
//                             <SelectTrigger
//                               className={errors.posteId ? "border-destructive" : ""}
//                             >
//                               <SelectValue placeholder="Sélectionner un poste" />
//                             </SelectTrigger>
//                             <SelectContent>
//                               {postes.map((poste) => (
//                                 <SelectItem key={poste.id} value={poste.id.toString()}>
//                                   {poste.libelle}
//                                 </SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>
//                           {errors.posteId && (
//                             <p className="text-destructive text-sm">{errors.posteId}</p>
//                           )}
//                         </div>
//                       )}

//                       <div className="flex justify-end gap-2">
//                         <Button
//                           type="button"
//                           variant="outline"
//                           onClick={() => setIsValidateurDialogOpen(false)}
//                         >
//                           Annuler
//                         </Button>
//                         <Button type="submit" disabled={isLoading}>
//                           {isLoading ? "Ajout..." : "Ajouter"}
//                         </Button>
//                       </div>
//                     </form>
//                   </DialogContent>
//                 </Dialog>
//               )}
//             </div>
//           </CardHeader>
//           <CardContent>
//             {!selectedProcessus ? (
//               <div className="text-center py-8 text-muted-foreground">
//                 <UsersIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
//                 <p>Sélectionnez un type de processus pour gérer ses validateurs</p>
//               </div>
//             ) : validateurs.length === 0 ? (
//               <div className="text-center py-8 text-muted-foreground">
//                 <UsersIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
//                 <p>Aucun validateur configuré pour ce processus</p>
//                 <p className="text-sm mt-2">
//                   Ajoutez des validateurs pour définir le workflow de validation
//                 </p>
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {validateurs
//                   .sort((a, b) => a.ordre - b.ordre)
//                   .map((validateur, index) => (
//                     <div
//                       key={validateur.id}
//                       className="p-4 border rounded-lg hover:shadow-md transition-shadow"
//                     >
//                       <div className="flex items-start justify-between">
//                         <div className="flex items-start gap-3 flex-1">
//                           <Badge className="mt-1">{validateur.ordre}</Badge>
//                           <div className="flex-1">
//                             {validateur.user ? (
//                               <>
//                                 <p className="font-medium">
//                                   {validateur.user.lastName} {validateur.user.name}
//                                 </p>
//                                 <p className="text-sm text-muted-foreground">
//                                   {validateur.user.email}
//                                 </p>
//                                 <Badge variant="outline" className="mt-2">
//                                   Utilisateur
//                                 </Badge>
//                               </>
//                             ) : validateur.poste ? (
//                               <>
//                                 <p className="font-medium">
//                                   {validateur.poste.libelle}
//                                 </p>
//                                 <p className="text-sm text-muted-foreground">
//                                   Code: {validateur.poste.code}
//                                 </p>
//                                 <Badge variant="outline" className="mt-2">
//                                   Poste
//                                 </Badge>
//                               </>
//                             ) : (
//                               <p className="text-muted-foreground">
//                                 Validateur non configuré
//                               </p>
//                             )}
//                           </div>
//                         </div>
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => handleDeleteValidateur(validateur.id)}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                       {index < validateurs.length - 1 && (
//                         <div className="ml-6 mt-2 text-muted-foreground text-sm">
//                           ↓ Puis...
//                         </div>
//                       )}
//                     </div>
//                   ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };
