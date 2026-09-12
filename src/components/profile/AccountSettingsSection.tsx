import { ShieldCheck, Mail, KeyRound, Edit3, LogOut } from "lucide-react";

interface AccountSettingsSectionProps {
  learnerEmail: string;
  isEmailVerified: boolean;
  onOpenEmailModal: () => void;
  onOpenPasswordModal: () => void;
  onOpenNameModal: () => void;
  onLogout?: () => void;
}

export default function AccountSettingsSection({
  learnerEmail,
  isEmailVerified,
  onOpenEmailModal,
  onOpenPasswordModal,
  onOpenNameModal,
  onLogout,
}: AccountSettingsSectionProps) {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-xs">
      <h3 className="text-sm font-bold font-display text-on-surface mb-3 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-primary" />
        Account Settings
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Email Settings */}
        <button
          type="button"
          id="btn-email-settings"
          onClick={onOpenEmailModal}
          className="p-3 bg-surface hover:bg-surface-container border border-outline-variant/50 rounded-xl text-left transition-all active:scale-98 group flex items-center gap-3 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors truncate">
              Email Settings
            </h4>
            <p className="text-[10px] text-outline truncate">
              {learnerEmail
                ? isEmailVerified
                  ? "Verified"
                  : "Unverified"
                : "Add email"}
            </p>
          </div>
        </button>

        {/* Change Password */}
        <button
          type="button"
          id="btn-change-password"
          onClick={onOpenPasswordModal}
          className="p-3 bg-surface hover:bg-surface-container border border-outline-variant/50 rounded-xl text-left transition-all active:scale-98 group flex items-center gap-3 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <KeyRound className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors truncate">
              Change Password
            </h4>
            <p className="text-[10px] text-outline truncate">
              Update password
            </p>
          </div>
        </button>

        {/* Edit Display Name */}
        <button
          type="button"
          id="btn-edit-name-settings"
          onClick={onOpenNameModal}
          className="p-3 bg-surface hover:bg-surface-container border border-outline-variant/50 rounded-xl text-left transition-all active:scale-98 group flex items-center gap-3 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Edit3 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors truncate">
              Display Name
            </h4>
            <p className="text-[10px] text-outline truncate">
              Edit profile name
            </p>
          </div>
        </button>

        {/* Sign Out */}
        <button
          type="button"
          id="btn-sign-out"
          onClick={onLogout}
          className="p-3 bg-surface hover:bg-error-container/20 border border-outline-variant/50 hover:border-error/40 rounded-xl text-left transition-all active:scale-98 group flex items-center gap-3 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-error-container/10 text-error flex items-center justify-center shrink-0">
            <LogOut className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-error truncate">
              Sign Out
            </h4>
            <p className="text-[10px] text-outline truncate">
              Switch to guest
            </p>
          </div>
        </button>
      </div>
    </section>
  );
}
