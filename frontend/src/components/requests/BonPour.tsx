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
import { FileUpload } from "../../pages/user/FileUpload";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle, Trash2 } from "lucide-react";

interface LigneBonPour {
  libelle: string;
  montant: number;
}

interface BonPourData {
  montantTotal?: number;
  lignes: LigneBonPour[];
  fichiers: File[];
}

interface BonPourProps {
  initialData?: Partial<BonPourData>;
  onSave: (data: BonPourData) => Promise<void>;
  isLoading?: boolean;
}

export function BonPourForm({
  initialData,
  onSave,
  isLoading = false,
}: BonPourProps) {
  const [fichiersUpload, setFichiersUpload] = useState<File[]>([]);
  const [error, setError] = useState<string>("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<BonPourData>({
    defaultValues: {
      montantTotal: initialData?.montantTotal || 0,
      lignes: initialData?.lignes || [{ libelle: "", montant: 0 }],
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

  const submit = async (formData: BonPourData) => {
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
          <CardTitle>Bon pour</CardTitle>
          <CardDescription>
            Remplissez les lignes et le montant total
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="montantTotal">Montant total (€)</Label>
            <Controller
              name="montantTotal"
              control={control}
              render={({ field }) => (
                <Input {...field} id="montantTotal" type="number" step="0.01" />
              )}
            />
          </div>

          {/* Lignes du bon pour */}
          <div className="space-y-4">
            <Label>Lignes du bon pour</Label>
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
              >
                <Controller
                  name={`lignes.${index}.libelle`}
                  control={control}
                  rules={{ required: "Libellé requis" }}
                  render={({ field }) => (
                    <Input {...field} placeholder="Libellé" />
                  )}
                />
                <Controller
                  name={`lignes.${index}.montant`}
                  control={control}
                  rules={{
                    required: "Montant requis",
                    min: { value: 0.01, message: "Montant invalide" },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      placeholder="Montant (€)"
                    />
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
              onClick={() => append({ libelle: "", montant: 0 })}
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

export default BonPourForm;
