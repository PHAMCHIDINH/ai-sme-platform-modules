"use client";

import { useEffect } from "react";

import { Button } from "./button";
import { cn } from "../kernel/utils";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function Modal({ open, title, onClose, children }: ModalProps) {
  useEffect(() => {
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className={cn("w-full max-w-xl rounded-2xl border border-border bg-card/95 p-6 text-card-foreground shadow-soft backdrop-blur")}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
          <Button onClick={onClose} size="sm" type="button" variant="ghost">
            Đóng
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
