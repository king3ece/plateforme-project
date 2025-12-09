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
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle } from "lucide-react";
import { FileUpload } from "../../pages/user/FileUpload";

interface FDMFormData {
  nomProjet: string;
  lieuMission: string;
  dateDepart: string;
  dateProbableRetour: string;
  dureeMission: number;
  objectifMission: string;
  perdieme: number;
  transport: number;
  bonEssence: number;
  peage: number;
  laisserPasser: number;
  hotel: number;
  divers: number;
  fichiers?: File[];
}

interface MissionFormProps {
  initialData?: Partial<FDMFormData>;
  onSave: (data: FDMFormData) => Promise<void>;
  isLoading?: boolean;
}

export function MissionForm({
  initialData,
  onSave,
  isLoading,
}: MissionFormProps) {
  const [error, setError] = useState<string>("");
  const [fichiersUpload, setFichiersUpload] = useState<File[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FDMFormData>({
    defaultValues: {
      nomProjet: initialData?.nomProjet || "",
      lieuMission: initialData?.lieuMission || "",
      dateDepart: initialData?.dateDepart || "",
      dateProbableRetour: initialData?.dateProbableRetour || "",
      dureeMission: initialData?.dureeMission || 0,
      objectifMission: initialData?.objectifMission || "",
      perdieme: initialData?.perdieme || 0,
      transport: initialData?.transport || 0,
      bonEssence: initialData?.bonEssence || 0,
      peage: initialData?.peage || 0,
      laisserPasser: initialData?.laisserPasser || 0,
      hotel: initialData?.hotel || 0,
      divers: initialData?.divers || 0,
    },
    mode: "onChange",
  });

  const handleFilesChange = (files: File[]) => {
    setFichiersUpload(files);
    setValue("fichiers", files as any);
  };

  const submit = async (formData: FDMFormData) => {
    setError("");
    try {
      const numericFields: Array<keyof FDMFormData> = [
        "perdieme",
        "transport",
        "bonEssence",
        "peage",
        "laisserPasser",
        "hotel",
        "divers",
      ];
      const parsedData = { ...formData } as any;
      numericFields.forEach((field) => {
        // react-hook-form peut renvoyer des strings pour les inputs number
        parsedData[field] = Number(formData[field]);
      });
      await onSave(parsedData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue");
    }
  };

  // Calculate mission duration based on dates
  const dateDepart = watch("dateDepart");
  const dateProbableRetour = watch("dateProbableRetour");

  React.useEffect(() => {
    if (dateDepart && dateProbableRetour) {
      const start = new Date(dateDepart);
      const end = new Date(dateProbableRetour);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        setValue("dureeMission", diffDays);
      }
    }
  }, [dateDepart, dateProbableRetour, setValue]);

  // Calculate total estimate
  const perdieme = watch("perdieme") || 0;
  const transport = watch("transport") || 0;
  const bonEssence = watch("bonEssence") || 0;
  const peage = watch("peage") || 0;
  const laisserPasser = watch("laisserPasser") || 0;
  const hotel = watch("hotel") || 0;
  const divers = watch("divers") || 0;

  const totalEstimatif = React.useMemo(() => {
    return (
      Number(perdieme) +
      Number(transport) +
      Number(bonEssence) +
      Number(peage) +
      Number(laisserPasser) +
      Number(hotel) +
      Number(divers)
    );
  }, [perdieme, transport, bonEssence, peage, laisserPasser, hotel, divers]);

  return (
    <form className="space-y-6" onSubmit={handleSubmit(submit)}>
      <Card>
        <CardHeader>
          <CardTitle>Fiche Descriptive de Mission (FDM)</CardTitle>
          <CardDescription>
            Remplissez les informations de votre mission
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

          <div className="space-y-4">
            <div>
              <Label htmlFor="nomProjet">
                <span className="text-red-600">*</span> Nom du projet
              </Label>
              <Controller
                name="nomProjet"
                control={control}
                rules={{ required: "Nom du projet requis" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="nomProjet"
                    placeholder="Ex: Audit technique site XYZ"
                    className={errors.nomProjet ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.nomProjet && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.nomProjet.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="lieuMission">
                <span className="text-red-600">*</span> Lieu de la mission
              </Label>
              <Controller
                name="lieuMission"
                control={control}
                rules={{ required: "Lieu de mission requis" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="lieuMission"
                    placeholder="Ex: Kara, Togo"
                    className={errors.lieuMission ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.lieuMission && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.lieuMission.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="objectifMission">
                <span className="text-red-600">*</span> Objectif de la mission
              </Label>
              <Controller
                name="objectifMission"
                control={control}
                rules={{ required: "Objectif requis" }}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="objectifMission"
                    placeholder="Décrivez l'objectif de votre mission..."
                    rows={3}
                    className={errors.objectifMission ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.objectifMission && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.objectifMission.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dateDepart">
                <span className="text-red-600">*</span> Date de départ
              </Label>
              <Controller
                name="dateDepart"
                control={control}
                rules={{ required: "Date de départ requise" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="dateDepart"
                    type="date"
                    className={errors.dateDepart ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.dateDepart && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.dateDepart.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="dateProbableRetour">
                <span className="text-red-600">*</span> Date probable de retour
              </Label>
              <Controller
                name="dateProbableRetour"
                control={control}
                rules={{ required: "Date de retour requise" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="dateProbableRetour"
                    type="date"
                    className={
                      errors.dateProbableRetour ? "border-red-500" : ""
                    }
                  />
                )}
              />
              {errors.dateProbableRetour && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.dateProbableRetour.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="dureeMission">Durée (jours)</Label>
              <Controller
                name="dureeMission"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="dureeMission"
                    type="number"
                    readOnly
                    className="bg-gray-50"
                  />
                )}
              />
            </div>
          </div>

          <div className="border-t pt-4 mt-6">
            <h3 className="text-lg font-semibold text-blue-700 mb-4">
              Estimations financières
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="perdieme">Per diem (CFA)</Label>
                <Controller
                  name="perdieme"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} id="perdieme" type="number" step="0.01" />
                  )}
                />
              </div>

              <div>
                <Label htmlFor="transport">Transport (CFA)</Label>
                <Controller
                  name="transport"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="transport"
                      type="number"
                      step="0.01"
                    />
                  )}
                />
              </div>

              <div>
                <Label htmlFor="bonEssence">Bon essence (CFA)</Label>
                <Controller
                  name="bonEssence"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="bonEssence"
                      type="number"
                      step="0.01"
                    />
                  )}
                />
              </div>

              <div>
                <Label htmlFor="peage">Péage (CFA)</Label>
                <Controller
                  name="peage"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} id="peage" type="number" step="0.01" />
                  )}
                />
              </div>

              <div>
                <Label htmlFor="laisserPasser">Laisser-passer (CFA)</Label>
                <Controller
                  name="laisserPasser"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="laisserPasser"
                      type="number"
                      step="0.01"
                    />
                  )}
                />
              </div>

              <div>
                <Label htmlFor="hotel">Hôtel (CFA)</Label>
                <Controller
                  name="hotel"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} id="hotel" type="number" step="0.01" />
                  )}
                />
              </div>

              <div>
                <Label htmlFor="divers">Divers (CFA)</Label>
                <Controller
                  name="divers"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} id="divers" type="number" step="0.01" />
                  )}
                />
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total estimatif:</span>
                <span className="text-2xl font-bold text-blue-700">
                  {totalEstimatif.toLocaleString("fr-FR")} CFA
                </span>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Pièces jointes (optionnel)
            </h3>
            <FileUpload onFilesChange={handleFilesChange} />
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

export default MissionForm;
