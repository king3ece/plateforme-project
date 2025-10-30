import React, { useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { FileUpload } from "../../pages/user/FileUpload";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle, Trash2 } from "lucide-react";

interface LigneAchat {
  reference: string;
  designation: string;
  prixUnitaire: number;
  quantite: number;
}

interface DemandeAchatData {
  destination: string;
  fournisseur: string;
  service: string;
  client: string;
  montantProjet?: number;
  prixTotal?: number;
  commentaire?: string;
  lignes: LigneAchat[];
  fichiers: File[];
}

interface DemandeAchatProps {
  initialData?: Partial<DemandeAchatData>;
  onSave: (data: DemandeAchatData) => Promise<void>;
  isLoading?: boolean;
}

export function DemandeAchatForm({
  initialData,
  onSave,
  isLoading = false,
}: DemandeAchatProps) {
  const [fichiersUpload, setFichiersUpload] = useState<File[]>([]);
  const [error, setError] = useState<string>("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<DemandeAchatData>({
    defaultValues: {
      destination: initialData?.destination || "",
      fournisseur: initialData?.fournisseur || "",
      service: initialData?.service || "",
      client: initialData?.client || "",
      montantProjet: initialData?.montantProjet || 0,
      prixTotal: initialData?.prixTotal || 0,
      commentaire: initialData?.commentaire || "",
      lignes: initialData?.lignes || [
        { reference: "", designation: "", prixUnitaire: 0, quantite: 1 },
      ],
      fichiers: [],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lignes",
  });

  const handleFilesChange = (files: File[]) => {
    setFichiersUpload(files);
    setValue("fichiers", files as any);
  };

  const submit = async (formData: DemandeAchatData) => {
    setError("");
    try {
      await onSave({ ...formData, fichiers: fichiersUpload });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue");
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(submit)}>
      <Card>
        <CardHeader>
          <CardTitle>Demande d’achat</CardTitle>
          <CardDescription>
            Remplissez les informations générales et les lignes d’achat
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Informations générales */}
          {[
            { name: "destination", label: "Destination de l'achat *" },
            { name: "fournisseur", label: "Fournisseur proposé *" },
            { name: "service", label: "Service bénéficiaire *" },
            { name: "client", label: "Nom du client *" },
          ].map(({ name, label }) => (
            <div key={name}>
              <Label htmlFor={name}>{label}</Label>
              <Controller
                name={name as keyof DemandeAchatData}
                control={control}
                rules={{ required: "Champ requis" }}
                render={({ field }) => <Input {...field} id={name} />}
              />
              {errors[name as keyof DemandeAchatData] && (
                <p className="text-sm text-red-600 mt-1">Champ requis</p>
              )}
            </div>
          ))}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="montantProjet">Montant du projet (€)</Label>
              <Controller
                name="montantProjet"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="montantProjet"
                    type="number"
                    step="0.01"
                  />
                )}
              />
            </div>
            <div>
              <Label htmlFor="prixTotal">Prix total achat (€)</Label>
              <Controller
                name="prixTotal"
                control={control}
                render={({ field }) => (
                  <Input {...field} id="prixTotal" type="number" step="0.01" />
                )}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="commentaire">Commentaire</Label>
            <Controller
              name="commentaire"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="commentaire"
                  placeholder="À quoi va servir cet achat ?"
                />
              )}
            />
          </div>

          {/* Lignes d’achat */}
          <div className="space-y-4">
            <Label>Lignes d’achat</Label>
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
              >
                <Controller
                  name={`lignes.${index}.reference`}
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="Référence" />
                  )}
                />
                <Controller
                  name={`lignes.${index}.designation`}
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="Désignation" />
                  )}
                />
                <Controller
                  name={`lignes.${index}.prixUnitaire`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      placeholder="Prix unitaire"
                    />
                  )}
                />
                <Controller
                  name={`lignes.${index}.quantite`}
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="number" placeholder="Quantité" />
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              onClick={() =>
                append({
                  reference: "",
                  designation: "",
                  prixUnitaire: 0,
                  quantite: 1,
                })
              }
            >
              Ajouter une nouvelle ligne
            </Button>
          </div>

          <div>
            <Label>Pièces jointes</Label>
            <FileUpload onFilesChange={handleFilesChange} />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              Soumettre
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

export default DemandeAchatForm;
