"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  disabled?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Supprimer",
  cancelLabel = "Annuler",
  disabled = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <div className="bg-background/80 fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="bg-card text-card-foreground border-border w-full max-w-md rounded-lg border shadow-lg"
      >
        <div className="grid gap-4 p-5">
          <div className="flex items-start gap-3">
            <div className="bg-destructive/10 text-destructive inline-flex size-9 shrink-0 items-center justify-center rounded-lg">
              <AlertTriangle aria-hidden="true" className="size-4" />
            </div>
            <div>
              <h3 id="confirm-dialog-title" className="text-base font-semibold">
                {title}
              </h3>
              <p
                id="confirm-dialog-description"
                className="text-muted-foreground mt-2 text-sm leading-6"
              >
                {description}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={disabled}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onConfirm}
              disabled={disabled}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
