import React from 'react';
import { motion } from 'motion/react';
import { User, Bell, Clock, Globe, Info, LogOut, ChevronRight, Shield, Moon, Sun } from 'lucide-react';
import { Header } from '../../components/Header';
import { BottomTabBar } from '../../components/BottomTabBar';
import { Button } from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';

export const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

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

  const menuItems = [
    { icon: User, label: t('profile.edit_profile'), onClick: () => navigate('/user/edit-profile') },
    ...(user?.role === 'admin' ? [{ icon: Shield, label: t('admin.dashboard_title'), onClick: () => navigate('/admin/dashboard') }] : []),
    { icon: Bell, label: t('profile.notifications'), onClick: () => navigate('/user/notifications') },
    { icon: Clock, label: t('profile.search_history'), onClick: () => navigate('/user/search?type=historique') },
    { icon: Globe, label: t('profile.app_language'), onClick: toggleLanguage },
    { icon: theme === 'light' ? Moon : Sun, label: t('profile.app_theme'), onClick: toggleTheme },
    { icon: Info, label: t('profile.about'), onClick: () => navigate('/user/about') }
  ];

  return (
    <div className="size-full bg-background flex flex-col overflow-hidden transition-colors duration-300">
      <Header title={t('profile.title')} />

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-[100px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="w-[68px] h-[68px] rounded-full bg-gradient-to-br from-[#FF9800] to-[#E65100] flex items-center justify-center mx-auto mb-3 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-lg font-bold text-foreground">
            {user?.name}
          </h2>
          <p className="text-[14px] text-muted-foreground mb-2">{user?.email}</p>
          <span className="inline-block px-3 py-1 bg-green-500/10 text-[#2E7D32] text-[12px] font-medium rounded-[50px]">
            {t('profile.active_user')}
          </span>
        </motion.div>

        <div className="h-px bg-border mb-4" />

        <div className="mb-4">
          <p className="text-[12px] font-medium text-[#F57C00] uppercase tracking-wide mb-3">
            {t('profile.my_account')}
          </p>

          <div className="space-y-1">
            {menuItems.map((item, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={item.onClick}
                className="w-full flex items-center gap-3 p-4 rounded-[16px] hover:bg-card transition-all border border-transparent hover:border-border shadow-sm hover:shadow-md"
              >
                <item.icon className="w-5 h-5 text-[#F57C00]" />
                <span className="flex-1 text-left font-medium text-foreground">
                  {item.label}
                </span>
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ duration: 0.15 }}
                >
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </motion.div>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="h-px bg-border mb-5" />

        <Button
          variant="danger"
          fullWidth
          icon={<LogOut />}
          onClick={handleLogout}
        >
          {t('profile.logout')}
        </Button>
      </div>

      <BottomTabBar />
    </div>
  );
};
