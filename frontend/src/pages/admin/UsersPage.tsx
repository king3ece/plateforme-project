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
  // HOOKS
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [postes, setPostes] = useState<Poste[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserDTO>({
    email: "",
    name: "",
    lastName: "",
    password: "",
    role: UserRole.USER,
    posteRef: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // CONTROLE ACCES
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

  // EFFECT
  useEffect(() => {
    loadUsers();
    loadPostes();
  }, []);

  // CHARGEMENT
  const loadUsers = async () => {
    try {
      const data = await usersAPI.getAll();
      setUsers(data);
    } catch (error) {
      console.error("❌ Erreur chargement utilisateurs:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    }
  };

  const loadPostes = async () => {
    try {
      const data = await postesAPI.getAll();
      setPostes(data);
    } catch (error) {
      console.error("❌ Erreur chargement postes:", error);
      toast.error("Erreur lors du chargement des postes");
    }
  };

  // VALIDATION
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const emailError = validators.email(formData.email);
    if (emailError) newErrors.email = emailError;
    const nomError = validators.required(formData.name, "Le nom");
    if (nomError) newErrors.name = nomError;
    const prenomError = validators.required(formData.lastName, "Le prénom");
    if (prenomError) newErrors.lastName = prenomError;
    if (!editingUser) {
      const passwordError = validators.password(formData.password);
      if (passwordError) newErrors.password = passwordError;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SOUMISSION
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      if (editingUser) {
        const updateData: UpdateUserDTO & { reference: string } = {
          reference: editingUser.reference,
          name: formData.name,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role,
          posteRef: formData.posteRef,
        };
        if (formData.password && formData.password.trim() !== "") {
          updateData.password = formData.password;
        }
        await usersAPI.update(updateData);
        toast.success("✅ Utilisateur modifié avec succès");
      } else {
        await usersAPI.create(formData);
        toast.success("✅ Utilisateur créé avec succès");
      }
      setIsDialogOpen(false);
      resetForm();
      loadUsers();
    } catch (error: any) {
      console.error("❌ Erreur lors de la soumission:", error);
      const message =
        error.response?.data?.message || "Erreur lors de l'opération";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // EDITION
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      password: "",
      role: user.role || user.roles || UserRole.USER,
      posteRef: user.poste?.reference,
    });
    setIsDialogOpen(true);
  };

  // SUPPRESSION
  const handleDelete = async (reference: string) => {
    if (!confirm("⚠️ Êtes-vous sûr de vouloir supprimer cet utilisateur ?"))
      return;
    try {
      await usersAPI.delete(reference);
      toast.success("🗑️ Utilisateur supprimé");
      loadUsers();
    } catch (error) {
      console.error("❌ Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  // RESET
  const resetForm = () => {
    setFormData({
      email: "",
      name: "",
      lastName: "",
      password: "",
      role: UserRole.USER,
      posteRef: undefined,
    });
    setEditingUser(null);
    setErrors({});
  };

  // RENDU
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
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
              Ajouter un utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingUser
                  ? "✏️ Modifier l'Utilisateur"
                  : "➕ Nouvel Utilisateur"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="space-y-2">
                <Label htmlFor="role">👤 Rôle *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: UserRole) => {
                    setFormData({ ...formData, role: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.USER}>
                      👤 Utilisateur
                    </SelectItem>
                    <SelectItem value={UserRole.ADMIN}>
                      🔐 Administrateur
                    </SelectItem>
                  </SelectContent>
                </Select>
                {editingUser && (
                  <p className="text-sm text-gray-600">
                    📍 Rôle actuel :{" "}
                    <strong>
                      {editingUser.role || editingUser.roles || "USER"}
                    </strong>
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="poste">
                  🏢 Poste {editingUser && "(peut être modifié)"}
                </Label>
                <Select
                  value={formData.posteRef || "none"}
                  onValueChange={(value: string) => {
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
                    <SelectItem value="none">Aucun poste</SelectItem>
                    {postes.map((poste) => (
                      <SelectItem key={poste.reference} value={poste.reference}>
                        {poste.libelle} ({poste.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editingUser && (
                  <p className="text-sm text-gray-600">
                    📍 Poste actuel :{" "}
                    <strong>{editingUser.poste?.libelle || "Aucun"}</strong>
                  </p>
                )}
              </div>
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
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Prénom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>🏢 Poste</TableHead>
              <TableHead>🏛️ Subdivision</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-gray-500 py-8"
                >
                  Aucun utilisateur trouvé
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
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
                    <TableCell>
                      {user.subdivision ? (
                        <div className="text-sm">
                          <div className="font-medium">
                            {user.subdivision.libelle}
                          </div>
                          {user.subdivision.typeSubdivision && (
                            <div className="text-xs text-gray-500">
                              ({user.subdivision.typeSubdivision.libelle})
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(user)}
                          title="Modifier cet utilisateur"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
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
