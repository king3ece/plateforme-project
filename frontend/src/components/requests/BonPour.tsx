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
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle, Trash2, Plus } from "lucide-react";

interface LigneBonPour {
  libelle: string;
  montant: number;
}

interface BonPourData {
  beneficiaire: string;
  motif: string;
  lignes: LigneBonPour[];
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
  const [error, setError] = useState<string>("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<BonPourData>({
    defaultValues: {
      beneficiaire: initialData?.beneficiaire || "",
      motif: initialData?.motif || "",
      lignes: initialData?.lignes || [{ libelle: "", montant: 0 }],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lignes",
  });

  const submit = async (formData: BonPourData) => {
    setError("");
    try {
      await onSave(formData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue");
    }
  };

  // Calculate total from lines
  const lignes = watch("lignes") || [];
  const montantTotal = React.useMemo(() => {
    return lignes.reduce((sum, ligne) => sum + (Number(ligne.montant) || 0), 0);
  }, [lignes]);

  return (
    <form className="space-y-6" onSubmit={handleSubmit(submit)}>
      <Card>
        <CardHeader>
          <CardTitle>Bon Pour</CardTitle>
          <CardDescription>
            Créer une demande de bon pour avec plusieurs lignes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="beneficiaire">Bénéficiaire *</Label>
              <Controller
                name="beneficiaire"
                control={control}
                rules={{ required: "Bénéficiaire requis" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="beneficiaire"
                    placeholder="Ex: Jean Dupont"
                    className={errors.beneficiaire ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.beneficiaire && (
                <p className="text-sm text-red-600 mt-1">{errors.beneficiaire.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="motif">Motif *</Label>
              <Controller
                name="motif"
                control={control}
                rules={{ required: "Motif requis" }}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="motif"
                    placeholder="Décrivez le motif du bon pour..."
                    rows={3}
                    className={errors.motif ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.motif && (
                <p className="text-sm text-red-600 mt-1">{errors.motif.message}</p>
              )}
            </div>
          </div>

          <div className="border-t pt-4 mt-6">
            <h3 className="text-lg font-semibold text-blue-700 mb-4">Lignes du bon pour</h3>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start p-3 bg-gray-50 rounded-lg"
                >
                  <div className="md:col-span-6">
                    <Controller
                      name={`lignes.${index}.libelle`}
                      control={control}
                      rules={{ required: "Libellé requis" }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Libellé de la ligne"
                          className={errors.lignes?.[index]?.libelle ? "border-red-500" : ""}
                        />
                      )}
                    />
                    {errors.lignes?.[index]?.libelle && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.lignes[index]?.libelle?.message}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-5">
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
                          placeholder="Montant (CFA)"
                          className={errors.lignes?.[index]?.montant ? "border-red-500" : ""}
                        />
                      )}
                    />
                    {errors.lignes?.[index]?.montant && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.lignes[index]?.montant?.message}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-1 flex items-center justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => append({ libelle: "", montant: 0 })}
              className="mt-3"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une ligne
            </Button>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Montant total:</span>
                <span className="text-2xl font-bold text-blue-700">
                  {montantTotal.toLocaleString('fr-FR')} CFA
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading} className="min-w-32">
              {isLoading ? "En cours..." : "Soumettre"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

export default BonPourForm;
