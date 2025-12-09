import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { AlertCircle } from "lucide-react";

interface RapportFinancierData {
  objet: string;
  dateDebut: string;
  dateFin: string;
  hotelDejeuner?: number;
  telephone?: number;
  transport?: number;
  indemnites?: number;
  laisserPasser?: number;
  coutDivers?: number;
  montantRecu?: number;
  montantDepense?: number;
  commentaire?: string;
  fichiers: File[];
}

interface RapportFinancierProps {
  initialData?: Partial<RapportFinancierData>;
  onSave: (data: RapportFinancierData) => Promise<void>;
  isLoading?: boolean;
}

export function RapportFinancierForm({
  initialData,
  onSave,
  isLoading = false,
}: RapportFinancierProps) {
  const [fichiersUpload, setFichiersUpload] = useState<File[]>([]);
  const [error, setError] = useState<string>("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RapportFinancierData>({
    defaultValues: {
      objet: initialData?.objet || "",
      dateDebut: initialData?.dateDebut || "",
      dateFin: initialData?.dateFin || "",
      commentaire: initialData?.commentaire || "",
      fichiers: [],
    },
    mode: "onChange",
  });

  const handleFilesChange = (files: File[]) => {
    setFichiersUpload(files);
    setValue("fichiers", files as any);
  };

  const submit = async (formData: RapportFinancierData) => {
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
          <CardTitle>Rapport financier de mission</CardTitle>
          <CardDescription>
            Saisissez les dépenses et les pièces justificatives
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <h4 className="font-semibold text-red-700 mb-2">
                Erreurs trouvées:
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field} className="text-sm text-red-600">
                    {error?.message || `${field} est requis`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <Label htmlFor="objet">
              <span className="text-red-600">*</span> Objet
            </Label>
            <Controller
              name="objet"
              control={control}
              rules={{ required: "Champ requis" }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="objet"
                  placeholder="Ex : Mission de terrain"
                  className={errors.objet ? "border-red-500" : ""}
                />
              )}
            />
            {errors.objet && (
              <p className="text-sm text-red-600 mt-1">
                {errors.objet.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateDebut">
                <span className="text-red-600">*</span> Date début
              </Label>
              <Controller
                name="dateDebut"
                control={control}
                rules={{ required: "Champ requis" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="dateDebut"
                    type="date"
                    className={errors.dateDebut ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.dateDebut && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.dateDebut.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="dateFin">
                <span className="text-red-600">*</span> Date fin
              </Label>
              <Controller
                name="dateFin"
                control={control}
                rules={{ required: "Champ requis" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="dateFin"
                    type="date"
                    className={errors.dateFin ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.dateFin && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.dateFin.message}
                </p>
              )}
            </div>
          </div>

          {/* Coûts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "hotelDejeuner", label: "Hôtel et déjeuner" },
              { name: "telephone", label: "Téléphone" },
              { name: "transport", label: "Transport" },
              { name: "indemnites", label: "Indemnité de mission" },
              { name: "laisserPasser", label: "Laisser passer" },
              { name: "coutDivers", label: "Coût divers" },
            ].map(({ name, label }) => (
              <div key={name}>
                <Label htmlFor={name}>{label}</Label>
                <Controller
                  name={name as keyof RapportFinancierData}
                  control={control}
                  render={({ field }) => (
                    <Input
                      id={name}
                      type="number"
                      step="0.01"
                      name={field.name}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      value={field.value as number | string | undefined}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : parseFloat(e.target.value)
                        )
                      }
                    />
                  )}
                />
              </div>
            ))}
          </div>

          {/* Bilan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="montantRecu">Montant reçu</Label>
              <Controller
                name="montantRecu"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="montantRecu"
                    type="number"
                    step="0.01"
                  />
                )}
              />
            </div>
            <div>
              <Label htmlFor="montantDepense">Montant dépensé</Label>
              <Controller
                name="montantDepense"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="montantDepense"
                    type="number"
                    step="0.01"
                  />
                )}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="commentaire">Commentaires</Label>
            <Controller
              name="commentaire"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="commentaire"
                  placeholder="Observations ou remarques..."
                />
              )}
            />
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

export default RapportFinancierForm;
