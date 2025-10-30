import { useState, useEffect } from "react";
// Imports des APIs (commentés pour utiliser des données fictives)
import { workflowsAPI } from "../../api/workflows";
import { usersAPI } from "../../api/users";
import { postesAPI } from "../../api/postes";

// Imports des types TypeScript pour les entités du workflow
import {
  TypeProcessus,
  Validateur,
  CreateTypeProcessusDTO,
  CreateValidateurDTO,
} from "../../types/Workflow";
import { User } from "../../types/User";
import { Poste } from "../../types/Poste";

// Imports des composants UI pour l'interface utilisateur
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
  // États pour stocker les données des types de processus, validateurs, utilisateurs et postes
  const [typeProcessus, setTypeProcessus] = useState<TypeProcessus[]>([]);
  const [selectedProcessus, setSelectedProcessus] =
    useState<TypeProcessus | null>(null);
  const [validateurs, setValidateurs] = useState<Validateur[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [postes, setPostes] = useState<Poste[]>([]);

  // États pour gérer l'ouverture des dialogues (modales)
  const [isProcessusDialogOpen, setIsProcessusDialogOpen] = useState(false);
  const [isValidateurDialogOpen, setIsValidateurDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // États pour les données des formulaires
  const [processusFormData, setProcessusFormData] =
    useState<CreateTypeProcessusDTO>({ code: "", libelle: "" });
  const [validateurFormData, setValidateurFormData] =
    useState<CreateValidateurDTO>({
      typeProcessusId: 0,
      ordre: 1,
    });
  const [validateurType, setValidateurType] = useState<"user" | "poste">(
    "user"
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Données fictives pour simuler l'interface (remplace les appels API)
  // Ces données sont utilisées pour un aperçu sans backend
  const mockTypeProcessus: TypeProcessus[] = [
    { id: 1, code: "VAL_CONGES", libelle: "Validation congés" },
    { id: 2, code: "VAL_DOCS", libelle: "Validation documents" },
    { id: 3, code: "VAL_ACHATS", libelle: "Validation achats" },
  ];

  const mockUsers: User[] = [
    { id: 1, name: "Alice", lastName: "Dupont" },
    { id: 2, name: "Bob", lastName: "Martin" },
    { id: 3, name: "Charlie", lastName: "Durand" },
  ];

  const mockPostes: Poste[] = [
    { id: 1, libelle: "Directeur RH" },
    { id: 2, libelle: "Manager" },
    { id: 3, libelle: "Comptable" },
  ];

  const mockValidateurs: Record<number, Validateur[]> = {
    1: [
      {
        id: 1,
        typeProcessusId: 1,
        ordre: 1,
        user: mockUsers[0], // Alice Dupont
        poste: null,
      },
      {
        id: 2,
        typeProcessusId: 1,
        ordre: 2,
        user: null,
        poste: mockPostes[0], // Directeur RH
      },
    ],
    2: [
      {
        id: 3,
        typeProcessusId: 2,
        ordre: 1,
        user: mockUsers[1], // Bob Martin
        poste: null,
      },
    ],
    3: [], // Aucun validateur pour ce processus
  };

  // useEffect pour charger les données initiales au montage du composant
  useEffect(() => {
    loadTypeProcessus(); // Charge les types de processus
    loadUsers(); // Charge les utilisateurs
    loadPostes(); // Charge les postes
  }, []);

  // useEffect pour charger les validateurs quand un processus est sélectionné
  useEffect(() => {
    if (selectedProcessus) {
      loadValidateurs(selectedProcessus.id); // Charge les validateurs pour le processus sélectionné
    }
  }, [selectedProcessus]);

  // Fonction pour charger les types de processus (remplacée par des données fictives)
  const loadTypeProcessus = async () => {
    try {
      // Appel API commenté : const data = await workflowsAPI.getAllTypeProcessus();
      // Simulation avec données fictives
      setTypeProcessus(mockTypeProcessus);
      // toast.success("Types de processus chargés"); // Optionnel pour feedback
    } catch (error) {
      toast.error("Erreur lors du chargement des types de processus");
    }
  };

  // Fonction pour charger les validateurs d'un processus spécifique (remplacée par des données fictives)
  const loadValidateurs = async (typeProcessusId: number) => {
    try {
      // Appel API commenté : const data = await workflowsAPI.getValidateursByProcessus(typeProcessusId);
      // Simulation avec données fictives
      setValidateurs(mockValidateurs[typeProcessusId] || []);
    } catch (error) {
      toast.error("Erreur lors du chargement des validateurs");
    }
  };

  // Fonction pour charger les utilisateurs (remplacée par des données fictives)
  const loadUsers = async () => {
    try {
      // Appel API commenté : const data = await usersAPI.getAll();
      // Simulation avec données fictives
      setUsers(mockUsers);
    } catch (error) {
      toast.error("Erreur lors du chargement des utilisateurs");
    }
  };

  // Fonction pour charger les postes (remplacée par des données fictives)
  const loadPostes = async () => {
    try {
      // Appel API commenté : const data = await postesAPI.getAll();
      // Simulation avec données fictives
      setPostes(mockPostes);
    } catch (error) {
      toast.error("Erreur lors du chargement des postes");
    }
  };

  // Gestionnaire pour créer un nouveau type de processus
  const handleCreateProcessus = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation des champs requis
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
      // Appel API commenté : await workflowsAPI.createTypeProcessus(processusFormData);
      // Simulation : Ajouter à la liste fictive
      const newProcessus: TypeProcessus = {
        id: typeProcessus.length + 1, // ID fictif
        code: processusFormData.code,
        libelle: processusFormData.libelle,
      };
      setTypeProcessus([...typeProcessus, newProcessus]);
      toast.success("Type de processus créé avec succès");
      setIsProcessusDialogOpen(false);
      setProcessusFormData({ code: "", libelle: "" });
      setErrors({});
      // loadTypeProcessus(); // Recharger si nécessaire, mais simulé ci-dessus
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la création"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Gestionnaire pour créer un validateur (pour un processus sélectionné)
  const handleCreateValidateur = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProcessus) {
      toast.error("Veuillez sélectionner un type de processus");
      return;
    }

    // Validation des champs
    const newErrors: Record<string, string> = {};
    if (!validateurFormData.ordre) newErrors.ordre = "L'ordre est requis";
    if (validateurType === "user" && !validateurFormData.userId) {
      newErrors.userId = "L'utilisateur est requis";
    }
    if (validateurType === "poste" && !validateurFormData.posteId) {
      newErrors.posteId = "Le poste est requis";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      // Appel API commenté : await workflowsAPI.createValidateur(data);
      // Simulation : Ajouter à la liste fictive des validateurs
      const newValidateur: Validateur = {
        id: validateurs.length + 1, // ID fictif
        typeProcessusId: selectedProcessus.id,
        ordre: validateurFormData.ordre,
        user: validateurType === "user" ? mockUsers.find(u => u.id === validateurFormData.userId) : null,
        poste: validateurType === "poste" ? mockPostes.find(p => p.id === validateurFormData.posteId) : null,
      };
      const updatedValidateurs = [...validateurs, newValidateur];
      setValidateurs(updatedValidateurs);
      // Mettre à jour le mock pour persister
      mockValidateurs[selectedProcessus.id] = updatedValidateurs;
      toast.success("Validateur ajouté avec succès");
      setIsValidateurDialogOpen(false);
      resetValidateurForm();
      // loadValidateurs(selectedProcessus.id); // Recharger si nécessaire, mais simulé ci-dessus
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la création"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Gestionnaire pour supprimer un type de processus
  const handleDeleteProcessus = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce type de processus ?"))
      return;

    try {
      // Appel API commenté : await workflowsAPI.deleteTypeProcessus(id);
      // Simulation : Supprimer de la liste fictive
      setTypeProcessus(typeProcessus.filter(p => p.id !== id));
      if (selectedProcessus?.id === id) setSelectedProcessus(null);
      toast.success("Type de processus supprimé");
      // loadTypeProcessus(); // Recharger si nécessaire, mais simulé ci-dessus
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  // Gestionnaire pour supprimer un validateur
  const handleDeleteValidateur = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce validateur ?")) return;

    try {
      // Appel API commenté : await workflowsAPI.deleteValidateur(id);
      // Simulation : Supprimer de la liste fictive
      const updatedValidateurs = validateurs.filter(v => v.id !== id);
      setValidateurs(updatedValidateurs);
      if (selectedProcessus) {
        mockValidateurs[selectedProcessus.id] = updatedValidateurs;
      }
      toast.success("Validateur supprimé");
      // loadValidateurs(selectedProcessus.id); // Recharger si nécessaire, mais simulé ci-dessus
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  // Fonction pour réinitialiser le formulaire de validateur
  const resetValidateurForm = () => {
    setValidateurFormData({
      typeProcessusId: 0,
      ordre: validateurs.length + 1, // Ordre suivant
    });
    setValidateurType("user");
    setErrors({});
  };

  // Rendu du composant : Structure de l'interface utilisateur
  return (
    <div className="space-y-6">
      {/* En-tête avec titre et bouton pour créer un nouveau type de processus */}
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
            {/* Formulaire pour créer un type de processus avec champs code et libelle */}
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
                  placeholder="Ex: VAL_CONGES"
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

      {/* Grille principale : Liste des types de processus à gauche, détails à droite */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte pour la liste des types de processus */}
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
                      handleDeleteProcessus(processus.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Carte pour les validateurs du processus sélectionné */}
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
                    {/* Formulaire pour ajouter un validateur : ordre, type (user/poste), puis sélection */}
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
                        <Label>Type de validateur *</Label>
                        <Select
                          value={validateurType}
                          onValueChange={(value: "user" | "poste") => {
                            setValidateurType(value);
                            setValidateurFormData({
                              ...validateurFormData,
                              userId: undefined,
                              posteId: undefined,
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">
                              Utilisateur spécifique
                            </SelectItem>
                            <SelectItem value="poste">Par poste</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Section conditionnelle pour sélectionner un utilisateur ou un poste */}
                      {validateurType === "user" ? (
                        <div className="space-y-2">
                          <Label htmlFor="user">Utilisateur *</Label>
                          <Select
                            value={validateurFormData.userId?.toString()}
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
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="poste">Poste *</Label>
                          <Select
                            value={validateurFormData.posteId?.toString()}
                            onValueChange={(value: string) =>
                              setValidateurFormData({
                                ...validateurFormData,
                                posteId: parseInt(value),
                              })
                            }
                          >
                            <SelectTrigger
                              className={
                                errors.posteId ? "border-destructive" : ""
                              }
                            >
                              <SelectValue placeholder="Sélectionner un poste" />
                            </SelectTrigger>
                            <SelectContent>
                              {postes.map((poste) => (
                                <SelectItem
                                  key={poste.id}
                                  value={poste.id.toString()}
                                >
                                  {poste.libelle}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.posteId && (
                            <p className="text-destructive text-sm">
                              {errors.posteId}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Boutons pour soumettre ou annuler le formulaire */}
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
            {/* Affichage des validateurs pour le processus sélectionné */}
            {selectedProcessus ? (
              <div className="space-y-3">
                {validateurs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Aucun validateur configuré pour ce processus
                  </p>
                ) : (
                  validateurs
                    .sort((a, b) => a.ordre - b.ordre) // Tri par ordre de validation
                    .map((validateur) => (
                      <div
                        key={validateur.id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-card"
                      >
                        <div className="flex items-center gap-4">
                          {/* Badge pour afficher l'ordre de validation */}
                          <Badge variant="outline" className="text-lg px-3">
                            {validateur.ordre}
                          </Badge>
                          <div>
                            {/* Affichage du nom de l'utilisateur ou du poste */}
                            <p>
                              {validateur.user
                                ? `${validateur.user.lastName} ${validateur.user.name}`
                                : validateur.poste?.libelle}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {validateur.user ? "Utilisateur" : "Poste"}
                            </p>
                          </div>
                        </div>
                        {/* Bouton pour supprimer le validateur */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteValidateur(validateur.id)}
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