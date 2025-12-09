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
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { validators } from "../../utils/validators";

export const WorkflowsPage = () => {
  const [typeProcessus, setTypeProcessus] = useState<TypeProcessus[]>([]);
  const [selectedProcessus, setSelectedProcessus] =
    useState<TypeProcessus | null>(null);
  const [validateurs, setValidateurs] = useState<Validateur[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [isProcessusDialogOpen, setIsProcessusDialogOpen] = useState(false);
  const [isValidateurDialogOpen, setIsValidateurDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [processusFormData, setProcessusFormData] =
    useState<CreateTypeProcessusDTO>({ code: "", libelle: "" });
  const [validateurFormData, setValidateurFormData] =
    useState<CreateValidateurDTO>({
      typeProcessusId: 0,
      ordre: 1,
      userId: undefined,
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
      toast.error("Erreur lors du chargement des types de processus");
    }
  };

  const loadValidateurs = async (typeProcessusId: number) => {
    try {
      const data = await workflowsAPI.getAllValidateurs(typeProcessusId);
      setValidateurs(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des validateurs");
    }
  };

  const loadUsers = async () => {
    try {
      const data = await usersAPI.getAll();
      setUsers(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des utilisateurs");
    }
  };

  const handleCreateProcessus = async (e: React.FormEvent) => {
    e.preventDefault();

    const libelleError = validators.required(
      processusFormData.libelle,
      "Le libellé"
    );
    if (libelleError) {
      setErrors({ libelle: libelleError });
      return;
    }

    setIsLoading(true);
    try {
      await workflowsAPI.createTypeProcessus(processusFormData);
      toast.success("Type de processus créé avec succès");
      setIsProcessusDialogOpen(false);
      setProcessusFormData({ code: "", libelle: "" });
      setErrors({});
      loadTypeProcessus();
    } catch (error: any) {
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
      loadValidateurs(selectedProcessus.id);
    } catch (error: any) {
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
      loadTypeProcessus();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleDeleteValidateur = async (reference: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce validateur ?")) return;

    try {
      await workflowsAPI.deleteValidateur(reference);
      toast.success("Validateur supprimé");
      if (selectedProcessus) loadValidateurs(selectedProcessus.id);
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetValidateurForm = () => {
    setValidateurFormData({
      typeProcessusId: 0,
      ordre: validateurs.length + 1,
      userId: undefined,
    });
    setErrors({});
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1>Gestion des Workflows</h1>
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
                  placeholder="Ex: Validation congés"
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
            <CardDescription>Liste des processus de validation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {typeProcessus.map((processus) => (
              <div
                key={processus.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedProcessus?.id === processus.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary"
                }`}
                onClick={() => setSelectedProcessus(processus)}
              >
                <div className="flex justify-between items-center">
                  <span>{processus.libelle}</span>
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
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>
                  {selectedProcessus
                    ? `Validateurs - ${selectedProcessus.libelle}`
                    : "Sélectionnez un processus"}
                </CardTitle>
                <CardDescription>
                  Ordre de validation des demandes
                </CardDescription>
              </div>
              {selectedProcessus && (
                <Dialog
                  open={isValidateurDialogOpen}
                  onOpenChange={setIsValidateurDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button onClick={resetValidateurForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Ajouter un Validateur</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={handleCreateValidateur}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="ordre">Ordre de validation *</Label>
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
                        <Label htmlFor="user">Utilisateur *</Label>
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
            {selectedProcessus ? (
              <div className="space-y-3">
                {validateurs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Aucun validateur configuré pour ce processus
                  </p>
                ) : (
                  validateurs
                    .sort((a, b) => a.ordre - b.ordre)
                    .map((validateur) => (
                      <div
                        key={validateur.reference}
                        className="flex items-center justify-between p-4 border rounded-lg bg-card"
                      >
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="text-lg px-3">
                            {validateur.ordre}
                          </Badge>
                          <div>
                            <p>
                              {validateur.user?.lastName}{" "}
                              {validateur.user?.name}
                            </p>
                            {validateur.user?.subdivision && (
                              <p className="text-muted-foreground text-xs mt-1">
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
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDeleteValidateur(validateur.reference)
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Sélectionnez un type de processus pour voir ses validateurs
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
