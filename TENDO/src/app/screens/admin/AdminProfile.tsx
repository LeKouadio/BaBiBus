import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, Globe, Moon, Sun, LogOut, Shield, Save, X } from 'lucide-react';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';

export const AdminProfile = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success(t('profile.logout_success'));
    navigate('/welcome');
  };

  const toggleLanguage = async () => {
    const langs = ['fr', 'en', 'ar', 'mnk'];
    const currentIndex = langs.indexOf(i18n.language);
    const nextIndex = (currentIndex + 1) % langs.length;
    const newLang = langs[nextIndex];
    await i18n.changeLanguage(newLang);
    
    const successMessages: Record<string, string> = {
      fr: "Langue changée en Français",
      en: "Language changed to English",
      ar: "تم تغيير اللغة إلى العربية",
      mnk: "Kan yɛlɛmana ka kɛ Maninkakan na"
    };
    toast.success(successMessages[newLang]);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(name, email, phone);
      toast.success(t('profile.updated'));
      setIsEditing(false);
    } catch (error) {
      toast.error(t('common.error_occurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="size-full bg-background flex flex-col overflow-hidden transition-colors duration-300">
      <Header title={t('profile.title')} showBack />

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-[34px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-[32px] border border-border p-6 mb-6 shadow-sm text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Shield className="w-20 h-20" />
          </div>

          <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-br from-[#F57C00] to-[#E65100] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
            <Shield className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-xl font-bold text-foreground mb-1">{user?.name}</h2>
          <p className="text-muted-foreground text-sm mb-3">{user?.email}</p>
          <span className="inline-block px-4 py-1.5 bg-orange-500/10 text-[#F57C00] text-[12px] font-bold rounded-full uppercase tracking-wider border border-orange-500/20">
            {t('welcome.login_admin')}
          </span>
        </motion.div>

        {!isEditing ? (
          <div className="space-y-4">
            <p className="text-[12px] font-bold text-[#2E7D32] uppercase tracking-widest mb-2 pl-2">
              {t('profile.my_account')}
            </p>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full flex items-center gap-4 p-5 bg-card rounded-[24px] border border-border hover:border-[#F57C00] transition-all group"
              >
                <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                  <User className="w-5 h-5 text-[#F57C00]" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[14px] font-bold text-foreground">{t('profile.edit_profile')}</p>
                  <p className="text-[12px] text-muted-foreground">{t('admin.manage_app')}</p>
                </div>
              </button>

              <button
                onClick={toggleLanguage}
                className="w-full flex items-center gap-4 p-5 bg-card rounded-[24px] border border-border hover:border-[#F57C00] transition-all group"
              >
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[14px] font-bold text-foreground">{t('profile.app_language')}</p>
                  <p className="text-[12px] text-muted-foreground uppercase">{i18n.language}</p>
                </div>
              </button>

              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-4 p-5 bg-card rounded-[24px] border border-border hover:border-[#F57C00] transition-all group"
              >
                <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                  {theme === 'light' ? <Moon className="w-5 h-5 text-purple-600" /> : <Sun className="w-5 h-5 text-orange-400" />}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[14px] font-bold text-foreground">{t('profile.app_theme')}</p>
                  <p className="text-[12px] text-muted-foreground uppercase">{theme}</p>
                </div>
              </button>
            </div>

            <div className="pt-6">
              <Button
                variant="danger"
                fullWidth
                icon={<LogOut className="w-5 h-5" />}
                onClick={handleLogout}
              >
                {t('profile.logout')}
              </Button>
            </div>
          </div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleUpdate}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12px] font-bold text-[#2E7D32] uppercase tracking-widest pl-2">
                {t('profile.edit_profile')}
              </p>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <Input
              label={t('auth.full_name')}
              value={name}
              onChange={setName}
              icon={<User className="w-5 h-5" />}
            />

            <Input
              label={t('auth.email_label')}
              type="email"
              value={email}
              onChange={setEmail}
              icon={<Mail className="w-5 h-5" />}
            />

            <Input
              label={t('auth.phone_number')}
              type="tel"
              value={phone}
              onChange={setPhone}
              icon={<Phone className="w-5 h-5" />}
            />

            <div className="pt-4 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => setIsEditing(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                icon={<Save className="w-4 h-4" />}
              >
                {t('common.save')}
              </Button>
            </div>
          </motion.form>
        )}
      </div>
    </div>
  );
};
