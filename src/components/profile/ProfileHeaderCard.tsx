import { Edit3, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { maskEmail } from "@/utils/maskEmail";

interface ProfileHeaderCardProps {
  learnerName: string;
  learnerEmail: string;
  isEmailVerified: boolean;
  onOpenEmailModal: () => void;
  onOpenNameModal: () => void;
}

export default function ProfileHeaderCard({
  learnerName,
  learnerEmail,
  isEmailVerified,
  onOpenEmailModal,
  onOpenNameModal,
}: ProfileHeaderCardProps) {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-6 shadow-xs">
      <div className="flex items-center gap-5">
        {/* Profile Picture */}
        <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-container shrink-0 border border-outline-variant/40">
          <img
            src="https://placecats.com/300/300"
            alt={learnerName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Learner Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-display text-on-surface truncate">
              {learnerName}
            </h2>
            <button
              type="button"
              id="btn-edit-name-header"
              onClick={onOpenNameModal}
              className="p-1 rounded-lg text-outline hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
              title="Edit name"
              aria-label="Edit display name"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs text-on-surface-variant">
            {learnerEmail ? (
              <button
                type="button"
                onClick={onOpenEmailModal}
                className="group flex items-center gap-1.5 hover:text-primary transition-colors truncate cursor-pointer"
                title={
                  isEmailVerified
                    ? "Email verified - click to manage"
                    : "Email unverified - click to verify"
                }
              >
                <Mail className="w-3.5 h-3.5 text-outline group-hover:text-primary transition-colors shrink-0" />
                <span className="truncate">{maskEmail(learnerEmail)}</span>
                {isEmailVerified ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-md shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-md shrink-0">
                    <AlertCircle className="w-3 h-3" />
                    Unverified
                  </span>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenEmailModal}
                className="text-xs text-primary font-medium hover:underline cursor-pointer flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                + Add email
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
