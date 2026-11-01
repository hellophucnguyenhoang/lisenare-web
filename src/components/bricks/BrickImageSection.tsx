import { useState, useEffect, useRef } from "react";
import { Image as ImageIcon, Upload, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface BrickImageSectionProps {
  imageFile: File | null;
  onImageFileChange: (file: File | null) => void;
  existingImageUrl?: string | null;
  existingImagePath?: string | null;
  onRemoveExistingImage?: () => void;
  disabled?: boolean;
}

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setShow((prev) => !prev);
        }}
        className="w-4 h-4 rounded-full border border-outline/40 text-outline flex items-center justify-center text-[10px] font-bold hover:text-primary hover:border-primary transition-colors cursor-pointer"
        aria-label="More information"
      >
        i
      </button>

      {show && (
        <div
          role="tooltip"
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 w-60 sm:w-68 p-2.5 bg-on-surface text-surface text-[11px] leading-relaxed font-normal rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 pointer-events-none"
        >
          {text}
        </div>
      )}
    </div>
  );
}

export default function BrickImageSection({
  imageFile,
  onImageFileChange,
  existingImageUrl,
  existingImagePath,
  onRemoveExistingImage,
  disabled = false,
}: BrickImageSectionProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Generate Base64 preview for selected file
  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setPreviewUrl(reader.result);
        }
      };
      reader.onerror = () => {
        setErrorMessage("Failed to read image file.");
      };
      reader.readAsDataURL(imageFile);
    } else {
      setPreviewUrl(null);
    }
  }, [imageFile]);

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);

    if (!file.type.startsWith("image/")) {
      const err = "Please select a valid image file (JPG, PNG, WEBP, or GIF).";
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      const err = "Image size must be less than 5 MB.";
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    onImageFileChange(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageFileChange(null);
    setPreviewUrl(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onRemoveExistingImage) {
      onRemoveExistingImage();
    }
  };

  const currentDisplayUrl = previewUrl || existingImageUrl;
  const hasImage = Boolean(currentDisplayUrl || imageFile || existingImagePath);

  return (
    <section className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-on-surface-variant flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-primary" />
          <span>Context image (optional)</span>
          <InfoTooltip text="Optional image or GIF illustration to enrich the brick context and aid visual memory." />
        </label>
        {hasImage && !disabled && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs font-semibold text-error hover:underline flex items-center gap-1 cursor-pointer"
            title="Remove image"
          >
            <X className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 bg-error-container/20 border border-error/30 rounded-xl flex items-center gap-2 text-xs text-error animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
        id="brick-context-image-input"
      />

      {hasImage ? (
        /* Image Preview Box */
        <div className="relative rounded-2xl overflow-hidden border border-outline-variant/50 bg-surface-container-low group">
          <div className="w-full max-h-56 min-h-36 flex items-center justify-center p-2 bg-black/5 dark:bg-black/20">
            {currentDisplayUrl ? (
              <img
                src={currentDisplayUrl}
                alt="Brick context preview"
                className="max-h-52 w-auto max-w-full object-contain rounded-xl shadow-xs"
              />
            ) : (
              <div className="flex items-center justify-center py-8 text-xs text-outline">
                Loading image preview...
              </div>
            )}
          </div>

          {/* Action overlay / bottom info bar */}
          <div className="p-2.5 bg-surface-container flex items-center justify-between gap-2 border-t border-outline-variant/30 text-xs">
            <span className="text-[11px] font-medium text-on-surface-variant truncate">
              {imageFile ? (
                <>
                  {imageFile.name} ({(imageFile.size / (1024 * 1024)).toFixed(1)} MB)
                </>
              ) : (
                "Current context image"
              )}
            </span>
            {!disabled && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-surface hover:bg-surface-container-high border border-outline-variant/40 text-[11px] font-bold text-on-surface transition-colors cursor-pointer"
              >
                Change
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Dropzone Upload Trigger */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
            disabled
              ? "opacity-50 cursor-not-allowed border-outline-variant/40"
              : isDragging
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-outline-variant/60 hover:border-primary/50 hover:bg-surface-container-low/50"
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-outline group-hover:text-primary transition-colors">
              <Upload className="w-4.5 h-4.5" />
            </div>
            <p className="text-xs font-semibold text-on-surface">
              Click to choose an image or GIF, or drag and drop
            </p>
            <p className="text-[10px] text-outline">
              Supports JPG, PNG, WEBP, or animated GIF up to 5 MB
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
