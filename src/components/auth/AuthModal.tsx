import { useEffect } from "react";
import AuthComponent from "./AuthComponent";
import { type AuthMode } from "@/types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  onSuccess?: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
  onSuccess,
}: AuthModalProps) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-200">
        <AuthComponent
          initialMode={initialMode}
          isModal={true}
          onClose={onClose}
          onSuccess={() => {
            onSuccess?.();
            onClose();
          }}
        />
      </div>
    </div>
  );
}
