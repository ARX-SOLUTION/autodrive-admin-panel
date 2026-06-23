import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { User, Shield, Building2, Briefcase } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChangePassword } from "@/services/authService";
import { useUpdateUser } from "@/services/userService";
import { extractErrorMessage } from "@/lib/errors";
import { validateNewPassword } from "@/lib/password";

const ProfilePage = () => {
  const { t } = useTranslation();
  const tt = (key: string) => t(key);
  const { user, setAuth, token, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const updateMut = useUpdateUser();
  const passwordMut = useChangePassword();

  const [profile, setProfile] = useState({
    fullName: user?.name ?? "",
    phone: user?.phone ?? "",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  if (!user) return null;

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.fullName.trim()) return;
    updateMut.mutate(
      {
        id: user.id,
        fullName: profile.fullName.trim(),
        phone: profile.phone.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(t('profile.toast_updated'));
          setAuth(token ?? "cookie", {
            ...user,
            name: profile.fullName.trim(),
            phone: profile.phone.trim() || undefined,
          });
        },
        onError: (err) => toast.error(extractErrorMessage(err)),
      },
    );
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    const policyError = validateNewPassword(passwords.newPassword);
    if (policyError) {
      toast.error(policyError);
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error(t('profile.toast_password_mismatch'));
      return;
    }
    passwordMut.mutate(
      {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      },
      {
        onSuccess: () => {
          toast.success(t('profile.toast_password_updated'));
          setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
          logout();
          queryClient.clear();
          window.location.href = "/login";
        },
        onError: (err) => toast.error(extractErrorMessage(err, t('profile.toast_password_mismatch'))),
      },
    );
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-balance">{t('profile.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('profile.subtitle')}</p>
      </div>

      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-semibold text-balance">{user.name || user.email}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                <Shield className="h-3 w-3" />
                {tt(`profile.role_label_${user.role}`) || user.role}
              </span>
              {user.company_name && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                  <Briefcase className="h-3 w-3" />
                  {user.company_name}
                </span>
              )}
              {user.branch_name && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3" />
                  {user.branch_name}
                </span>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>{t('common.name')}</Label>
              <Input
                value={profile.fullName}
                onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
                required
                className="mt-1.5 bg-secondary border-border"
              />
            </div>
            <div>
              <Label>{t('common.email')}</Label>
              <Input
                value={user.email}
                disabled
                className="mt-1.5 bg-secondary/50 border-border"
              />
            </div>
            <div>
              <Label>{t('common.phone')}</Label>
              <Input
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+998..."
                className="mt-1.5 bg-secondary border-border"
              />
            </div>
          </div>
          <Button type="submit" disabled={updateMut.isPending}>
            {updateMut.isPending ? t('common.saving') : t('common.save')}
          </Button>
        </form>
      </div>

      <form onSubmit={handlePasswordChange} className="glass-card p-6 space-y-4">
        <div>
          <h3 className="font-heading font-semibold text-balance">{t('profile.change_password')}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('profile.password_hint')}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label>{t('profile.current_password')}</Label>
            <Input
              type="password"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
              required
              className="mt-1.5 bg-secondary border-border"
            />
          </div>
          <div>
            <Label>{t('profile.new_password')}</Label>
            <Input
              type="password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
              required
              minLength={8}
              className="mt-1.5 bg-secondary border-border"
            />
          </div>
          <div>
            <Label>{t('profile.confirm_password')}</Label>
            <Input
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
              required
              minLength={8}
              className="mt-1.5 bg-secondary border-border"
            />
          </div>
        </div>
        <Button type="submit" variant="outline" disabled={passwordMut.isPending}>
          {passwordMut.isPending ? t('profile.updating') : t('profile.update_password')}
        </Button>
      </form>
    </div>
  );
};

export default ProfilePage;
