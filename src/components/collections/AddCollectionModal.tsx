import { useState } from "react";
import {
  BookOpen,
  Plane,
  Briefcase,
  Utensils,
  X,
  Check,
  Clock,
} from "lucide-react";
import { type Collection } from "@/types";

interface AddCollectionModalProps {
  onClose: () => void;
  onAddCollection?: (
    name: string,
    description: string,
    iconName?: string,
  ) => void;
  onEditCollection?: (
    id: number,
    name: string,
    description: string,
    iconName?: string,
  ) => void;
  collectionToEdit?: Collection;
}

export default function AddCollectionModal({
  onClose,
  onAddCollection,
  onEditCollection,
  collectionToEdit,
}: AddCollectionModalProps) {
  const [newColName, setNewColName] = useState(collectionToEdit?.name || "");
  const [newColDesc, setNewColDesc] = useState(
    collectionToEdit?.description || "",
  );
  const [newColIcon, setNewColIcon] = useState("BookOpen");

  const getIcon = (name: string, className = "w-6 h-6 text-primary") => {
    switch (name) {
      case "Plane":
        return <Plane className={className} />;
      case "Briefcase":
        return <Briefcase className={className} />;
      case "Utensils":
        return <Utensils className={className} />;
      case "Clock":
        return <Clock className={className} />;
      default:
        return <BookOpen className={className} />;
    }
  };

  const handleSubmit = () => {
    if (newColName.trim() === "") {
      alert("Please enter a collection name");
      return;
    }

    if (collectionToEdit && onEditCollection) {
      onEditCollection(collectionToEdit.id, newColName, newColDesc, newColIcon);
    } else if (onAddCollection) {
      onAddCollection(newColName, newColDesc, newColIcon);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-primary font-display">
            {collectionToEdit ? "Edit Collection" : "Create Collection"}
          </h3>
          <button
            onClick={onClose}
            className="text-outline hover:text-on-surface p-1 rounded-full hover:bg-surface-container"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">
              Collection Name
            </label>
            <input
              type="text"
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              placeholder="e.g. Slang Words, Medical Terms..."
              className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-xl focus:ring-1 focus:ring-primary focus:outline-none text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">
              Description (Optional)
            </label>
            <textarea
              value={newColDesc}
              onChange={(e) => setNewColDesc(e.target.value)}
              placeholder="Describe what this collection is for..."
              rows={2}
              className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-xl focus:ring-1 focus:ring-primary focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-2">
              Select Icon
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { name: "BookOpen", label: "Book" },
                { name: "Plane", label: "Travel" },
                { name: "Briefcase", label: "Business" },
                { name: "Utensils", label: "Food" },
                { name: "Clock", label: "Routine" },
              ].map((ic) => (
                <button
                  key={ic.name}
                  type="button"
                  onClick={() => setNewColIcon(ic.name)}
                  className={`py-2.5 flex flex-col items-center justify-center border rounded-xl transition-all ${
                    newColIcon === ic.name
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-outline-variant/60 hover:bg-surface"
                  }`}
                >
                  {getIcon(
                    ic.name,
                    `w-5 h-5 mb-1 ${newColIcon === ic.name ? "text-primary" : "text-outline"}`,
                  )}
                  <span className="text-[10px] font-bold">{ic.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold hover:bg-primary/95 transition-all shadow-md mt-2 flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            <span>
              {collectionToEdit ? "Save Changes" : "Create Collection"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
