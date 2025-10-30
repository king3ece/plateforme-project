import React, { useState, useEffect } from "react";
import { usersAPI } from "../../api/users";
import { useAuth } from "../../hooks/useAuth";
import { postesAPI } from "../../api/postes";
import { User, CreateUserDTO, UpdateUserDTO, UserRole } from "../../types/User";
import { Poste } from "../../types/Poste";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { validators } from "../../utils/validators";

export const UsersPage = () => {
  // ============================================
  // 1. HOOKS (doivent être déclarés en premier)
  // ============================================
  const { user: currentUser } = useAuth(); // Renommé pour éviter confusion avec state 'users'

  // État pour la liste des utilisateurs
  const [users, setUsers] = useState<User[]>([]);

  // État pour la liste des postes disponibles
  const [postes, setPostes] = useState<Poste[]>([]);

  // État pour contrôler l'ouverture/fermeture du dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // État pour gérer le chargement (désactiver le bouton pendant l'API call)
  const [isLoading, setIsLoading] = useState(false);

  // État pour savoir si on est en mode édition (contient l'utilisateur en cours d'édition)
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // État pour les données du formulaire
  const [formData, setFormData] = useState<CreateUserDTO>({
    email: "",
    name: "",
    lastName: "",
    password: "",
    role: UserRole.USER,
    posteRef: undefined, // Optionnel : référence du poste (peut être undefined)
  });

  // État pour les erreurs de validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ============================================
  // 2. CONTRÔLE D'ACCÈS (après les hooks)
  // ============================================
  // Si l'utilisateur n'est pas admin, on bloque l'accès
  if (
    !currentUser ||
    ((currentUser as any).roles ?? (currentUser as any).role) !== UserRole.ADMIN
  ) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600">Accès refusé</h2>
        <p className="text-gray-600 mt-2">
          Vous devez être administrateur pour accéder à cette page
        </p>
      </div>
    );
  }

  // ============================================
  // 3. EFFECT - Chargement initial des données
  // ============================================
  useEffect(() => {
    loadUsers();
    loadPostes();
  }, []); // [] = exécuté une seule fois au montage du composant

  // ============================================
  // 4. FONCTIONS DE CHARGEMENT DES DONNÉES
  // ============================================

  /**
   * Charge la liste complète des utilisateurs depuis l'API
   * Les utilisateurs incluent leur poste associé (relation SQL JOIN)
   */
  const loadUsers = async () => {
    try {
      const data = await usersAPI.getAll();
      console.log("✅ Utilisateurs chargés:", data);
      setUsers(data);
    } catch (error) {
      console.error("❌ Erreur chargement utilisateurs:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    }
  };

  /**
   * Charge la liste complète des postes disponibles
   * Utilisé pour remplir le Select dans le formulaire
   */
  const loadPostes = async () => {
    try {
      const data = await postesAPI.getAll();
      console.log("✅ Postes chargés:", data);
      setPostes(data);
    } catch (error) {
      console.error("❌ Erreur chargement postes:", error);
      toast.error("Erreur lors du chargement des postes");
    }
  };

  // ============================================
  // 5. VALIDATION DU FORMULAIRE
  // ============================================

  /**
   * Valide tous les champs du formulaire
   * @returns true si tout est valide, false sinon
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validation de l'email
    const emailError = validators.email(formData.email);
    if (emailError) newErrors.email = emailError;

    // Validation du nom (obligatoire)
    const nomError = validators.required(formData.name, "Le nom");
    if (nomError) newErrors.name = nomError;

    // Validation du prénom (obligatoire)
    const prenomError = validators.required(formData.lastName, "Le prénom");
    if (prenomError) newErrors.lastName = prenomError;

    // ⚠️ Le mot de passe n'est obligatoire QUE lors de la création
    // En mode édition, on peut le laisser vide (= pas de changement)
    if (!editingUser) {
      const passwordError = validators.password(formData.password);
      if (passwordError) newErrors.password = passwordError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // 6. SOUMISSION DU FORMULAIRE
  // ============================================

  /**
   * Gère la création OU la modification d'un utilisateur
   * Selon qu'on soit en mode édition ou création
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Empêche le rechargement de la page

    // Si la validation échoue, on arrête
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (editingUser) {
        // ==========================================
        // MODE ÉDITION
        // ==========================================

        // Construction de l'objet à envoyer au backend
        const updateData: UpdateUserDTO & { reference: string } = {
          reference: editingUser.reference, // Identifiant unique de l'utilisateur
          name: formData.name,
          lastName: formData.lastName,
          email: formData.email,
          posteRef: formData.posteRef, // ✅ Peut être undefined (= retirer le poste)
        };

        // ⚠️ On n'envoie le password que s'il a été modifié
        if (formData.password && formData.password.trim() !== "") {
          updateData.password = formData.password;
        }

        console.log("📤 UPDATE - Données envoyées:", updateData);
        await usersAPI.update(updateData);
        toast.success("✅ Utilisateur modifié avec succès");
      } else {
        // ==========================================
        // MODE CRÉATION
        // ==========================================

        console.log("📤 CREATE - Données envoyées:", formData);
        await usersAPI.create(formData);
        toast.success("✅ Utilisateur créé avec succès");
      }

      // Fermer le dialog et rafraîchir la liste
      setIsDialogOpen(false);
      resetForm();
      loadUsers(); // ♻️ Recharge la liste pour voir les changements
    } catch (error: any) {
      console.error("❌ Erreur lors de la soumission:", error);
      const message =
        error.response?.data?.message || "Erreur lors de l'opération";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // 7. GESTION DE L'ÉDITION
  // ============================================

  /**
   * Prépare le formulaire pour éditer un utilisateur existant
   * @param user L'utilisateur à éditer
   */
  const handleEdit = (user: User) => {
    console.log("✏️ Édition de l'utilisateur:", user);

    // Sauvegarder l'utilisateur en cours d'édition
    setEditingUser(user);

    // Pré-remplir le formulaire avec les données actuelles
    setFormData({
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      password: "", // ⚠️ Ne JAMAIS pré-remplir le mot de passe (sécurité)
      role: user.role,
      posteRef: user.poste?.reference, // ✅ Récupère la référence du poste actuel
    });

    // Ouvrir le dialog
    setIsDialogOpen(true);
  };

  // ============================================
  // 8. GESTION DE LA SUPPRESSION
  // ============================================

  /**
   * Supprime un utilisateur après confirmation
   * @param reference La référence unique de l'utilisateur
   */
  const handleDelete = async (reference: string) => {
    // Demander confirmation avant de supprimer
    if (!confirm("⚠️ Êtes-vous sûr de vouloir supprimer cet utilisateur ?"))
      return;

    try {
      await usersAPI.delete(reference);
      toast.success("🗑️ Utilisateur supprimé");
      loadUsers(); // Rafraîchir la liste
    } catch (error) {
      console.error("❌ Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  // ============================================
  // 9. RÉINITIALISATION DU FORMULAIRE
  // ============================================

  /**
   * Remet le formulaire à zéro
   * Utilisé après création/édition ou annulation
   */
  const resetForm = () => {
    setFormData({
      email: "",
      name: "",
      lastName: "",
      password: "",
      role: UserRole.USER,
      posteRef: undefined, // ✅ Réinitialiser le poste
    });
    setEditingUser(null); // Sortir du mode édition
    setErrors({}); // Effacer les erreurs
  };

  // ============================================
  // 10. RENDU DU COMPOSANT
  // ============================================

  return (
    <div className="space-y-6 p-6">
      {/* ========== HEADER ========== */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>

        {/* Dialog pour créer/éditer un utilisateur */}
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open: boolean) => {
            setIsDialogOpen(open);
            if (!open) resetForm(); // Réinitialiser si on ferme le dialog
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un utilisateur
            </Button>
          </DialogTrigger>

          {/* ========== FORMULAIRE ========== */}
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingUser
                  ? "✏️ Modifier l'Utilisateur"
                  : "➕ Nouvel Utilisateur"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Champ Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={errors.email ? "border-red-500" : ""}
                  placeholder="exemple@mail.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>

              {/* Champs Nom et Prénom (en ligne) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={errors.name ? "border-red-500" : ""}
                    placeholder="Dupont"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Prénom *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className={errors.lastName ? "border-red-500" : ""}
                    placeholder="Jean"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Champ Mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  Mot de passe {editingUser ? "(optionnel)" : "*"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className={errors.password ? "border-red-500" : ""}
                  placeholder={
                    editingUser
                      ? "Laisser vide pour ne pas modifier"
                      : "Minimum 6 caractères"
                  }
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>

              {/* ========== SELECT POSTE ========== */}
              {/* 🔑 ICI : Association User ↔ Poste via poste.id */}
              <div className="space-y-2">
                <Label htmlFor="poste">
                  🏢 Poste {editingUser && "(peut être modifié)"}
                </Label>
                <Select
                  value={formData.posteRef || "none"} // ⚠️ Utiliser "none" au lieu de ""
                  onValueChange={(value: string) => {
                    // Si "none" est sélectionné, mettre undefined
                    // Sinon, stocker la référence du poste
                    setFormData({
                      ...formData,
                      posteRef: value === "none" ? undefined : value,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un poste (optionnel)" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Option pour ne pas assigner de poste */}
                    <SelectItem value="none">Aucun poste</SelectItem>

                    {/* Liste de tous les postes disponibles */}
                    {postes.map((poste) => (
                      <SelectItem key={poste.reference} value={poste.reference}>
                        {poste.libelle} ({poste.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Afficher le poste actuel en mode édition */}
                {editingUser && (
                  <p className="text-sm text-gray-600">
                    📍 Poste actuel :{" "}
                    <strong>{editingUser.poste?.libelle || "Aucun"}</strong>
                  </p>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end gap-2 pt-4">
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
                    ? editingUser
                      ? "⏳ Modification..."
                      : "⏳ Création..."
                    : editingUser
                    ? "💾 Modifier"
                    : "✅ Créer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ========== TABLEAU DES UTILISATEURS ========== */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Prénom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>🏢 Poste</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-gray-500 py-8"
                >
                  Aucun utilisateur trouvé
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                // Compatibilité backend : certains utilisent 'roles', d'autres 'role'
                const displayRole = (user as any).roles ?? (user as any).role;

                return (
                  <TableRow key={user.reference}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.lastName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          displayRole === UserRole.ADMIN
                            ? "default"
                            : "secondary"
                        }
                      >
                        {displayRole}
                      </Badge>
                    </TableCell>
                    {/* 
                      ✅ Affichage du poste associé
                      La relation User → Poste est faite via user.poste
                      qui est peuplé par un JOIN SQL côté backend
                    */}
                    <TableCell>
                      {user.poste ? (
                        <span className="text-sm">
                          🏢 {user.poste.libelle}
                          <span className="text-gray-500 ml-1">
                            ({user.poste.code})
                          </span>
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* Bouton Éditer */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(user)}
                          title="Modifier cet utilisateur"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        {/* Bouton Supprimer */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user.reference)}
                          title="Supprimer cet utilisateur"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
