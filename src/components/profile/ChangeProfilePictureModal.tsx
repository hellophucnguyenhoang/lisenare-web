import { useState, useEffect, useRef } from "react";
import { X, Camera, Upload, Loader2, AlertCircle } from "lucide-react";
import { useUpdateLearnerAvatar } from "@/hooks/useLearner";
import { toast } from "sonner";

interface ChangeProfilePictureModalProps {
  isOpen: boolean;
  currentPictureUrl?: string | null;
  learnerName: string;
  onClose: () => void;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export default function ChangeProfilePictureModal({
  isOpen,
  currentPictureUrl,
  learnerName,
  onClose,
}: ChangeProfilePictureModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const updateAvatarMutation = useUpdateLearnerAvatar();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !updateAvatarMutation.isPending) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, updateAvatarMutation.isPending]);

  // Reset state when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setErrorMessage(null);
      setIsDragging(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (JPG, PNG, or WEBP).");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage("Image size must be less than 5 MB.");
      return;
    }

    setSelectedFile(file);

    // Read file as Base64 data URL for reliable, instant preview without blob URL revocation issues
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPreviewUrl(reader.result);
      }
    };
    reader.onerror = () => {
      setErrorMessage("Failed to read image file. Please try another image.");
    };
    reader.readAsDataURL(file);
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage("Please select a picture to upload.");
      return;
    }

    updateAvatarMutation.mutate(selectedFile, {
      onSuccess: () => {
        toast.success("Profile picture updated successfully!");
        onClose();
      },
      onError: (err) => {
        console.error("Failed to update profile picture:", err);
        setErrorMessage("Failed to upload profile picture. Please try again.");
        toast.error("Failed to update profile picture. Please try again.");
      },
    });
  };

  const displayImage =
    previewUrl || currentPictureUrl || "https://placecats.com/300/300";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        style={{ willChange: "opacity" }}
        className="fixed inset-0 bg-black/40 animate-in fade-in duration-200"
      />

      {/* Modal dialog */}
      <div
        style={{ willChange: "transform, opacity" }}
        className="relative bg-surface-container-lowest border border-outline-variant/60 rounded-3xl w-full max-w-md p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-on-surface">
                Profile picture
              </h3>
              <p className="text-[11px] text-outline">
                Choose a new photo for your account
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={updateAvatarMutation.isPending}
            className="p-1.5 rounded-full hover:bg-surface-container text-outline hover:text-on-surface transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error alert */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-error-container/20 border border-error/30 rounded-xl flex items-center gap-2.5 text-xs text-error animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Picture preview circle */}
          <div className="flex flex-col items-center justify-center gap-2.5">
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-3 border-primary/25 shadow-md bg-surface-container">
                <img
                  key={displayImage}
                  src={displayImage}
                  alt={learnerName}
                  className="w-full h-full object-cover"
                />
              </div>
              {previewUrl && (
                <span className="absolute bottom-0 right-0 bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs border-2 border-surface-container-lowest">
                  New
                </span>
              )}
            </div>
            {selectedFile && (
              <div className="flex items-center gap-2">
                <p className="text-xs text-on-surface-variant font-medium truncate max-w-56">
                  {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
                </p>
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="text-[11px] text-error hover:underline font-medium cursor-pointer"
                  title="Remove selected photo"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
            id="profile-picture-file-input"
          />

          {/* Drag & drop / Browse upload zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-outline-variant/60 hover:border-primary/50 hover:bg-surface-container-low/50"
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-1.5">
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-outline group-hover:text-primary transition-colors">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-on-surface">
                Click to choose a photo or drag and drop
              </p>
              <p className="text-[11px] text-outline">
                Supports JPG, PNG, or WEBP up to 5 MB
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onClose}
              disabled={updateAvatarMutation.isPending}
              className="px-4 py-2.5 rounded-xl border border-outline-variant/60 text-xs font-semibold text-on-surface hover:bg-surface-container transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-save-profile-picture"
              disabled={!selectedFile || updateAvatarMutation.isPending}
              className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/95 transition-all active:scale-95 shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateAvatarMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save picture</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
