import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { ArrowLeft, Save, Send, AlertCircle, Upload, X, File as FileIcon } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { toast } from "sonner";
import {
  RequestType,
  RequestPriority,
  CreateRequestPayload,
} from "../../types/request";

interface FormData {
  title: string;
  description: string;
  type: RequestType;
  priority: RequestPriority;
  files: File[];
  startDate?: string;
  endDate?: string;
  amount?: number;
  trainingTitle?: string;
  missionDestination?: string;
}

export function RequestPage() {
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      title: "",
      description: "",
      type: RequestType.AUTRE,
      priority: RequestPriority.MEDIUM,
      files: [],
    },
    mode: "onChange",
  });

  const selectedType = watch("type");

  const typeLabels: Record<RequestType, string> = {
    [RequestType.FDM]: "Fiche Descriptive de Mission",
    [RequestType.RFDM]: "Rapport Financier de Mission",
    [RequestType.DDA] : "Demande d'achat",
    [RequestType.BONPOUR] : "Bon pour",
    [RequestType.CONGE]: "Demande de congé",
    [RequestType.FORMATION]: "Demande de formation",
    [RequestType.ACHAT]: "Demande d'achat",
    [RequestType.MISSION]: "Demande de mission",
    [RequestType.AUTRE]: "Autre demande",
  };

  const priorityLabels = {
    [RequestPriority.LOW]: "Faible",
    [RequestPriority.MEDIUM]: "Moyenne",
    [RequestPriority.HIGH]: "Élevée",
    [RequestPriority.URGENT]: "Urgente",
  };

  const priorityColors = {
    [RequestPriority.LOW]: "text-gray-600",
    [RequestPriority.MEDIUM]: "text-blue-600",
    [RequestPriority.HIGH]: "text-orange-600",
    [RequestPriority.URGENT]: "text-red-600",
  };

  const handleFilesChange = (files: File[]) => {
    setUploadedFiles(files);
    setValue("files", files);
  };

  const addFiles = (newFiles: File[]) => {
    const maxFiles = 5;
    const maxSizeMB = 10;

    if (uploadedFiles.length + newFiles.length > maxFiles) {
      setError(`Vous ne pouvez télécharger que ${maxFiles} fichiers maximum`);
      return;
    }

    const validFiles: File[] = [];
    for (const file of newFiles) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`${file.name} dépasse la taille maximale de ${maxSizeMB}MB`);
        continue;
      }
      validFiles.push(file);
    }

    const updatedFiles = [...uploadedFiles, ...validFiles];
    handleFilesChange(updatedFiles);
  };

  const removeFile = (index: number) => {
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    handleFilesChange(updatedFiles);
    setError("");
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const onSubmit = async (data: FormData, isDraft: boolean) => {
    try {
      setIsLoading(true);
      setError("");

      const dynamicFields: Record<string, any> = {};

      switch (data.type) {
        case RequestType.CONGE:
          if (data.startDate) dynamicFields.startDate = data.startDate;
          if (data.endDate) dynamicFields.endDate = data.endDate;
          break;
        case RequestType.FORMATION:
          if (data.trainingTitle) dynamicFields.trainingTitle = data.trainingTitle;
          break;
        case RequestType.ACHAT:
          if (data.amount) dynamicFields.amount = data.amount;
          break;
        case RequestType.MISSION:
          if (data.missionDestination) dynamicFields.missionDestination = data.missionDestination;
          if (data.startDate) dynamicFields.startDate = data.startDate;
          if (data.endDate) dynamicFields.endDate = data.endDate;
          break;
      }

      const payload: CreateRequestPayload = {
        title: data.title,
        description: data.description,
        type: data.type,
        priority: data.priority,
        attachments: uploadedFiles,
        dynamicFields,
      };

      // TODO: Remplacer par l'appel API réel
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Données à sauvegarder:", payload, "Brouillon:", isDraft);

      if (isDraft) {
        toast.success("Demande enregistrée en brouillon");
      } else {
        toast.success("Demande soumise avec succès");
      }

      navigate("/user/demandes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      toast.error("Erreur lors de l'enregistrement de la demande");
    } finally {
      setIsLoading(false);
    }
  };

  const renderDynamicFields = () => {
    switch (selectedType) {
      case RequestType.CONGE:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Date de début</Label>
              <Controller
                name="startDate"
                control={control}
                rules={{ required: "Date de début requise" }}
                render={({ field }) => (
                  <Input
                    id="startDate"
                    type="date"
                    {...field}
                    className={errors.startDate ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.startDate && (
                <p className="text-sm text-red-600 mt-1">{errors.startDate.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="endDate">Date de fin</Label>
              <Controller
                name="endDate"
                control={control}
                rules={{ required: "Date de fin requise" }}
                render={({ field }) => (
                  <Input
                    id="endDate"
                    type="date"
                    {...field}
                    className={errors.endDate ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.endDate && (
                <p className="text-sm text-red-600 mt-1">{errors.endDate.message}</p>
              )}
            </div>
          </div>
        );

      case RequestType.FORMATION:
        return (
          <div>
            <Label htmlFor="trainingTitle">Titre de la formation</Label>
            <Controller
              name="trainingTitle"
              control={control}
              rules={{ required: "Titre de la formation requis" }}
              render={({ field }) => (
                <Input
                  id="trainingTitle"
                  placeholder="Ex: Formation React.js avancé"
                  {...field}
                  className={errors.trainingTitle ? "border-red-500" : ""}
                />
              )}
            />
            {errors.trainingTitle && (
              <p className="text-sm text-red-600 mt-1">{errors.trainingTitle.message}</p>
            )}
          </div>
        );

      case RequestType.ACHAT:
        return (
          <div>
            <Label htmlFor="amount">Montant estimé (FCFA)</Label>
            <Controller
              name="amount"
              control={control}
              rules={{
                required: "Montant requis",
                min: { value: 0, message: "Le montant doit être positif" },
              }}
              render={({ field }) => (
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  className={errors.amount ? "border-red-500" : ""}
                />
              )}
            />
            {errors.amount && (
              <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>
            )}
          </div>
        );

      case RequestType.MISSION:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="missionDestination">Destination</Label>
              <Controller
                name="missionDestination"
                control={control}
                rules={{ required: "Destination requise" }}
                render={({ field }) => (
                  <Input
                    id="missionDestination"
                    placeholder="Ex: Lomé, Kara, etc."
                    {...field}
                    className={errors.missionDestination ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.missionDestination && (
                <p className="text-sm text-red-600 mt-1">{errors.missionDestination.message}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Date de début</Label>
                <Controller
                  name="startDate"
                  control={control}
                  rules={{ required: "Date de début requise" }}
                  render={({ field }) => (
                    <Input
                      id="startDate"
                      type="date"
                      {...field}
                      className={errors.startDate ? "border-red-500" : ""}
                    />
                  )}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.startDate.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="endDate">Date de fin</Label>
                <Controller
                  name="endDate"
                  control={control}
                  rules={{ required: "Date de fin requise" }}
                  render={({ field }) => (
                    <Input
                      id="endDate"
                      type="date"
                      {...field}
                      className={errors.endDate ? "border-red-500" : ""}
                    />
                  )}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.endDate.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* En-tête */}
      <div className="flex-shrink-0 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/user/demandes")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux demandes
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle demande</h1>
          <p className="text-sm text-gray-500 mt-1">
            Créez une nouvelle demande en remplissant le formulaire ci-dessous
          </p>
        </div>
      </div>

      {/* Contenu avec scroll */}
      <div className="flex-1 overflow-y-auto pr-2">
        <form className="space-y-6 pb-6">
          {/* Informations principales */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de la demande</CardTitle>
              <CardDescription>
                Remplissez les informations générales de votre demande
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type de demande</Label>
                  <Controller
                    name="type"
                    control={control}
                    rules={{ required: "Type de demande requis" }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(RequestType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {typeLabels[type]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.type && (
                    <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="priority">Priorité</Label>
                  <Controller
                    name="priority"
                    control={control}
                    rules={{ required: "Priorité requise" }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className={errors.priority ? "border-red-500" : ""}>
                          <SelectValue placeholder="Sélectionner une priorité" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(RequestPriority).map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              <span className={priorityColors[priority]}>
                                {priorityLabels[priority]}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.priority && (
                    <p className="text-sm text-red-600 mt-1">{errors.priority.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="title">Titre</Label>
                <Controller
                  name="title"
                  control={control}
                  rules={{
                    required: "Titre requis",
                    minLength: {
                      value: 5,
                      message: "Le titre doit contenir au moins 5 caractères",
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      id="title"
                      placeholder="Décrivez brièvement votre demande"
                      {...field}
                      className={errors.title ? "border-red-500" : ""}
                    />
                  )}
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Controller
                  name="description"
                  control={control}
                  rules={{
                    required: "Description requise",
                    minLength: {
                      value: 10,
                      message: "La description doit contenir au moins 10 caractères",
                    },
                  }}
                  render={({ field }) => (
                    <Textarea
                      id="description"
                      placeholder="Décrivez en détail votre demande..."
                      rows={4}
                      {...field}
                      className={errors.description ? "border-red-500" : ""}
                    />
                  )}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>

              {renderDynamicFields()}
            </CardContent>
          </Card>

          {/* Pièces jointes */}
          <Card>
            <CardHeader>
              <CardTitle>Pièces jointes</CardTitle>
              <CardDescription>
                Ajoutez des documents à l'appui de votre demande (max 5 fichiers, 10MB chacun)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div
                  onClick={() => document.getElementById("file-input")?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Cliquez pour sélectionner des fichiers
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, DOCX, JPG, PNG (max 10MB par fichier)
                  </p>
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    onChange={(e) => addFiles(Array.from(e.target.files || []))}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Fichiers sélectionnés ({uploadedFiles.length}/5)
                    </p>
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 rounded p-3 border border-gray-200"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-700 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="flex-shrink-0 ml-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end sticky bottom-0 bg-white pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleSubmit((data) => onSubmit(data, true))}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Enregistrer en brouillon
            </Button>
            <Button
              type="button"
              onClick={handleSubmit((data) => onSubmit(data, false))}
              disabled={isLoading || !isValid}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Soumettre la demande
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}