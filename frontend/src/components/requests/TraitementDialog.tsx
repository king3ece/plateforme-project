import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle, CheckCircle, XCircle, Edit } from "lucide-react";
import { TraitementDecision } from "../../types/Fdm";

interface TraitementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (decision: TraitementDecision, commentaire: string) => Promise<void>;
  decision: TraitementDecision | null;
  isLoading?: boolean;
}

const DECISION_CONFIG: Record<
  TraitementDecision,
  {
    title: string;
    description: string;
    icon: React.ReactNode;
    buttonLabel: string;
    buttonVariant: "default" | "destructive" | "outline";
    color: string;
  }
> = {
  VALIDER: {
    title: "Valider la demande",
    description: "Cette demande sera approuvée et passera au validateur suivant ou sera finalisée.",
    icon: <CheckCircle className="h-5 w-5 text-green-600" />,
    buttonLabel: "Valider",
    buttonVariant: "default",
    color: "green",
  },
  REJETER: {
    title: "Rejeter la demande",
    description: "Cette demande sera définitivement rejetée. L'émetteur en sera notifié par email.",
    icon: <XCircle className="h-5 w-5 text-red-600" />,
    buttonLabel: "Rejeter",
    buttonVariant: "destructive",
    color: "red",
  },
  A_CORRIGER: {
    title: "Demander une correction",
    description: "Cette demande sera renvoyée au validateur précédent ou à l'émetteur pour correction.",
    icon: <Edit className="h-5 w-5 text-orange-600" />,
    buttonLabel: "Demander correction",
    buttonVariant: "outline",
    color: "orange",
  },
};

export function TraitementDialog({
  open,
  onOpenChange,
  onConfirm,
  decision,
  isLoading = false,
}: TraitementDialogProps) {
  const [commentaire, setCommentaire] = useState("");
  const [error, setError] = useState("");

  if (!decision) return null;

  const config = DECISION_CONFIG[decision];

  const handleConfirm = async () => {
    setError("");

    // Validation : commentaire obligatoire pour rejet et correction
    if ((decision === "REJETER" || decision === "A_CORRIGER") && !commentaire.trim()) {
      setError(`Un commentaire est obligatoire pour ${decision === "REJETER" ? "rejeter" : "demander une correction de"} la demande.`);
      return;
    }

    try {
      await onConfirm(decision, commentaire);
      setCommentaire("");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  };

  const handleCancel = () => {
    setCommentaire("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {config.icon}
            <DialogTitle>{config.title}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="commentaire">
              Commentaire
              {(decision === "REJETER" || decision === "A_CORRIGER") && (
                <span className="text-red-600 ml-1">*</span>
              )}
            </Label>
            <Textarea
              id="commentaire"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder={
                decision === "VALIDER"
                  ? "Commentaire optionnel..."
                  : decision === "REJETER"
                  ? "Précisez la raison du rejet..."
                  : "Précisez les corrections nécessaires..."
              }
              rows={4}
              className={error ? "border-red-500" : ""}
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              {decision === "VALIDER" && "Vous pouvez ajouter un commentaire (optionnel)"}
              {decision === "REJETER" && "Expliquez pourquoi vous rejetez cette demande"}
              {decision === "A_CORRIGER" && "Décrivez les corrections à apporter"}
            </p>
          </div>

          {decision === "VALIDER" && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                En validant, la demande sera transmise au validateur suivant. Si vous êtes le dernier validateur,
                la demande sera approuvée et les comptables seront notifiés.
              </AlertDescription>
            </Alert>
          )}

          {decision === "REJETER" && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Attention :</strong> Le rejet est définitif. L'émetteur et tous les validateurs précédents
                seront notifiés par email.
              </AlertDescription>
            </Alert>
          )}

          {decision === "A_CORRIGER" && (
            <Alert>
              <Edit className="h-4 w-4" />
              <AlertDescription>
                La demande sera renvoyée pour correction. Si vous êtes le premier validateur, elle retournera à l'émetteur.
                Sinon, elle retournera au validateur précédent.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            variant={config.buttonVariant}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Traitement en cours..." : config.buttonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
