"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Lock, Trash2, Check, AlertTriangle } from "lucide-react";

interface Props {
  initialName: string;
  initialEmail: string;
  hasPassword: boolean;
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-800">
        <span className="text-amber-400">{icon}</span>
        <h2 className="font-semibold text-slate-100 text-sm">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function StatusMessage({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <p className={`mt-3 flex items-center gap-1.5 text-sm ${type === "success" ? "text-emerald-400" : "text-red-400"}`}>
      {type === "success" ? <Check className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
      {message}
    </p>
  );
}

const inputCls = "w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30";
const labelCls = "block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5";
const btnPrimary = "rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export function SettingsClient({ initialName, initialEmail, hasPassword }: Props) {
  const { update: updateSession } = useSession();
  const router = useRouter();

  // Profile
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [profileStatus, setProfileStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwStatus, setPwStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  // Delete
  const [deleteInput, setDeleteInput] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteStatus, setDeleteStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileStatus(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = await res.json() as { ok?: boolean; error?: string; user?: { name: string; email: string } };
      if (!res.ok) {
        setProfileStatus({ type: "error", message: data.error ?? "Update failed" });
      } else {
        setProfileStatus({ type: "success", message: "Profile updated successfully" });
        // Refresh the NextAuth session so Navbar reflects the new name/email immediately
        await updateSession({ name: data.user?.name, email: data.user?.email });
        router.refresh();
      }
    } catch {
      setProfileStatus({ type: "error", message: "Network error, please try again" });
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwStatus(null);
    if (newPw !== confirmPw) {
      setPwStatus({ type: "error", message: "New passwords do not match" });
      return;
    }
    if (newPw.length < 8) {
      setPwStatus({ type: "error", message: "Password must be at least 8 characters" });
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) {
        setPwStatus({ type: "error", message: data.error ?? "Password change failed" });
      } else {
        setPwStatus({ type: "success", message: "Password changed successfully" });
        setCurrentPw(""); setNewPw(""); setConfirmPw("");
      }
    } catch {
      setPwStatus({ type: "error", message: "Network error, please try again" });
    } finally {
      setPwLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteInput !== "DELETE") return;
    setDeleteLoading(true);
    setDeleteStatus(null);
    try {
      const body: Record<string, string> = {};
      if (hasPassword) body.password = deletePassword;

      const res = await fetch("/api/user/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setDeleteStatus({ type: "error", message: data.error ?? "Deletion failed" });
        setDeleteLoading(false);
        return;
      }
      await signOut({ callbackUrl: "/" });
    } catch {
      setDeleteStatus({ type: "error", message: "Network error, please try again" });
      setDeleteLoading(false);
    }
  }

  const canDelete = deleteInput === "DELETE" && (!hasPassword || deletePassword.length > 0);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">Settings</h1>
          <p className="mt-1 text-sm text-slate-400">Manage your account details and preferences.</p>
        </div>

        {/* Profile */}
        <Section title="Profile" icon={<User className="h-4 w-4" />}>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label htmlFor="settings-name" className={labelCls}>Display name</label>
              <input
                id="settings-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                placeholder="Your name"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="settings-email" className={labelCls}>Email address</label>
              <input
                id="settings-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputCls}
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={profileLoading} className={btnPrimary}>
                {profileLoading ? "Saving…" : "Save changes"}
              </button>
            </div>
            {profileStatus && <StatusMessage {...profileStatus} />}
          </form>
        </Section>

        {/* Password — only for credentials accounts */}
        {hasPassword && (
          <Section title="Change Password" icon={<Lock className="h-4 w-4" />}>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label htmlFor="current-pw" className={labelCls}>Current password</label>
                <input
                  id="current-pw"
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  autoComplete="current-password"
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="new-pw" className={labelCls}>New password</label>
                <input
                  id="new-pw"
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="confirm-pw" className={labelCls}>Confirm new password</label>
                <input
                  id="confirm-pw"
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  autoComplete="new-password"
                  className={inputCls}
                />
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={pwLoading || !currentPw || !newPw || !confirmPw} className={btnPrimary}>
                  {pwLoading ? "Updating…" : "Update password"}
                </button>
              </div>
              {pwStatus && <StatusMessage {...pwStatus} />}
            </form>
          </Section>
        )}

        {/* Danger Zone */}
        <Section title="Danger Zone" icon={<Trash2 className="h-4 w-4" />}>
          <div className="space-y-4">
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-sm font-medium text-red-300">Delete account</p>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                This permanently deletes your account and all portfolio data. This cannot be undone.
              </p>
            </div>
            {hasPassword && (
              <div>
                <label htmlFor="delete-pw" className={labelCls}>
                  Current password
                </label>
                <input
                  id="delete-pw"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Enter your password to confirm"
                  className={`${inputCls} border-red-500/30 focus:border-red-500/60 focus:ring-red-500/20`}
                />
              </div>
            )}
            <div>
              <label htmlFor="delete-confirm" className={labelCls}>
                Type <span className="font-mono text-red-400 normal-case">DELETE</span> to confirm
              </label>
              <input
                id="delete-confirm"
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="DELETE"
                className={`${inputCls} border-red-500/30 focus:border-red-500/60 focus:ring-red-500/20`}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={!canDelete || deleteLoading}
                className="rounded-xl border border-red-500/40 px-5 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleteLoading ? "Deleting…" : "Delete my account"}
              </button>
            </div>
            {deleteStatus && <StatusMessage {...deleteStatus} />}
          </div>
        </Section>
      </div>
    </main>
  );
}
