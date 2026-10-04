import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import {
  Download,
  X,
  FileCode,
  Folder,
  FolderPlus,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { type Collection } from "@/types";
import {
  useImportCollection,
  useImportToNewCollection,
} from "@/hooks/useCollections";
import PlainTextInput from "@/components/common/PlainTextInput";
import { toast } from "sonner";

interface ImportCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: Collection[];
  defaultCollectionId?: number | null;
  onSuccess?: (collectionId: number) => void;
}

export default function ImportCollectionModal({
  isOpen,
  onClose,
  collections,
  defaultCollectionId,
  onSuccess,
}: ImportCollectionModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [brickCount, setBrickCount] = useState<number | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Target collection mode: 'existing' | 'new'
  const [mode, setMode] = useState<"existing" | "new">(() => {
    return collections.length > 0 ? "existing" : "new";
  });

  const [selectedCollectionId, setSelectedCollectionId] = useState<
    number | null
  >(() => {
    if (defaultCollectionId) return defaultCollectionId;
    return collections.length > 0 ? collections[0].id : null;
  });

  const [newCollectionName, setNewCollectionName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const importToExisting = useImportCollection();
  const importToNew = useImportToNewCollection();
  const isImporting = importToExisting.isPending || importToNew.isPending;

  if (!isOpen) return null;

  const sanitizeNameFromFilename = (filename: string) => {
    return filename
      .replace(/\.json$/i, "")
      .replace(/[-_]export$/i, "")
      .replace(/[-_]+/g, " ")
      .trim();
  };

  const processFile = async (selectedFile: File) => {
    setFileError(null);

    if (!selectedFile.name.toLowerCase().endsWith(".json")) {
      setFileError("Please select a JSON file (.json).");
      setFile(null);
      setBrickCount(null);
      return;
    }

    try {
      const text = await selectedFile.text();
      const parsed = JSON.parse(text);

      if (!Array.isArray(parsed)) {
        setFileError(
          "Invalid collection file: the JSON file must contain a list of bricks.",
        );
        setFile(null);
        setBrickCount(null);
        return;
      }

      setFile(selectedFile);
      setBrickCount(parsed.length);

      // Auto-suggest new collection name if empty
      if (!newCollectionName) {
        setNewCollectionName(sanitizeNameFromFilename(selectedFile.name));
      }
    } catch {
      setFileError("Unable to parse JSON file. The file may be corrupted.");
      setFile(null);
      setBrickCount(null);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      processFile(selected);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setBrickCount(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please select a JSON file to import.");
      return;
    }

    if (mode === "new") {
      if (!newCollectionName.trim()) {
        toast.error("Please enter a name for the new collection.");
        return;
      }

      importToNew.mutate(
        {
          collectionName: newCollectionName.trim(),
          file,
        },
        {
          onSuccess: ({ collection, result }) => {
            toast.success(
              `Imported to "${collection.name}": ${result.added} added, ${result.skipped} skipped.`,
            );
            onSuccess?.(collection.id);
            onClose();
          },
          onError: (err: unknown) => {
            console.error("Failed to import collection:", err);
            toast.error("Failed to import collection. Please check the file.");
          },
        },
      );
    } else {
      if (!selectedCollectionId) {
        toast.error("Please select a collection to import into.");
        return;
      }

      const targetCol = collections.find((c) => c.id === selectedCollectionId);
      importToExisting.mutate(
        {
          collectionId: selectedCollectionId,
          file,
        },
        {
          onSuccess: (result) => {
            toast.success(
              `Imported to "${targetCol?.name || "collection"}": ${result.added} added, ${result.skipped} skipped.`,
            );
            onSuccess?.(selectedCollectionId);
            onClose();
          },
          onError: (err: unknown) => {
            console.error("Failed to import collection:", err);
            toast.error("Failed to import collection. Please check the file.");
          },
        },
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-outline-variant/70 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-on-surface">
                Import Collection
              </h3>
              <p className="text-xs text-outline">
                Load bricks from an exported JSON file
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isImporting}
            className="text-outline hover:text-on-surface p-1.5 rounded-xl hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-5">
          {/* File Picker / Dropzone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Collection JSON File <span className="text-error">*</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />

            {!file ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                  isDragging
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : "border-outline-variant/80 hover:border-primary/60 hover:bg-surface-container-low/50"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface">
                    Click to select file or drag & drop
                  </p>
                  <p className="text-[11px] text-outline mt-0.5">
                    Supports JSON files exported from Lisenare
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-surface-container-low border border-outline-variant/60 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-on-surface truncate">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-outline font-medium">
                      {(file.size / 1024).toFixed(1)} KB
                      {brickCount !== null && ` • ${brickCount} bricks detected`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  disabled={isImporting}
                  className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                  title="Remove file"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {fileError && (
              <div className="flex items-center gap-1.5 text-xs text-error mt-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}
          </div>

          {/* Destination Collection Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Import Destination
            </label>

            {/* Mode selection tabs */}
            <div className="flex rounded-xl p-1 bg-surface-container-low border border-outline-variant/60">
              <button
                type="button"
                onClick={() => setMode("existing")}
                disabled={collections.length === 0}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === "existing"
                    ? "bg-white text-primary shadow-xs"
                    : "text-outline hover:text-on-surface disabled:opacity-40 disabled:cursor-not-allowed"
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>Existing Collection</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("new")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === "new"
                    ? "bg-white text-primary shadow-xs"
                    : "text-outline hover:text-on-surface"
                }`}
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>New Collection</span>
              </button>
            </div>

            {/* Form inputs based on mode */}
            {mode === "existing" ? (
              <div className="space-y-1">
                <select
                  value={selectedCollectionId ?? ""}
                  onChange={(e) =>
                    setSelectedCollectionId(Number(e.target.value))
                  }
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-xs font-semibold text-on-surface focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all cursor-pointer"
                >
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name} ({col.brickCount ?? 0} bricks)
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-outline px-1">
                  Bricks will be merged into this collection. Existing duplicates
                  are safely skipped.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <PlainTextInput
                  id="input-import-new-collection-name"
                  value={newCollectionName}
                  onChange={setNewCollectionName}
                  placeholder="e.g. Travel Vocabulary, Slang"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary text-xs font-semibold text-on-surface outline-none transition-all"
                />
                <p className="text-[11px] text-outline px-1">
                  A new collection will be created with these bricks.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onClose}
              disabled={isImporting}
              className="flex-1 py-2.5 px-4 bg-surface hover:bg-surface-container border border-outline-variant/60 text-on-surface font-semibold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                !file ||
                isImporting ||
                (mode === "new" && !newCollectionName.trim()) ||
                (mode === "existing" && !selectedCollectionId)
              }
              className="flex-2 py-2.5 px-4 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-xs hover:bg-primary/95 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>
                    Import {brickCount !== null ? `${brickCount} ` : ""}Bricks
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
