import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bus, MapPin, Menu, X, Home as HomeIcon, LogOut, Users, Globe, Bell } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import api from '../../data/api';
import { useTranslation } from 'react-i18next';

export const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [stats, setStats] = useState([
    { label: t('admin.active_stops'), value: 0, color: '#F57C00', key: 'stops' },
    { label: t('admin.lines'), value: 0, color: '#2E7D32', key: 'lines' },
    { label: t('admin.users'), value: 0, color: '#F57C00', key: 'users' },
    { label: t('admin.favorites'), value: 0, color: '#2E7D32', key: 'favorites' }
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        const data = response.data;
        if (data) {
          setStats(prev => prev.map(s => ({
            ...s,
            value: data[s.key] || 0
          })));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
  }, []);

  const menuItems = [
    { icon: HomeIcon, label: 'Dashboard', active: true },
    { icon: MapPin, label: t('admin.manage_stops'), onClick: () => navigate('/admin/stops') },
    { icon: Bus, label: t('admin.manage_lines'), onClick: () => navigate('/admin/lines') },
    { icon: Users, label: t('admin.users'), onClick: () => navigate('/admin/users') },
    { icon: Bell, label: t('notifications.title'), onClick: () => navigate('/admin/notifications') },
    { icon: Globe, label: t('profile.title'), onClick: () => navigate('/admin/profile') }
  ];

  const handleLogout = () => {
    logout();
    toast.success(t('profile.logout_success'));
    navigate('/welcome');
  };

  return (
    <div className="size-full bg-background flex flex-col overflow-hidden transition-colors duration-300">
      <div className="bg-[#F57C00] h-[88px] pt-[44px] px-5 flex items-center justify-between rounded-b-[24px]">
        <div className="flex items-center gap-3">
          <Bus className="w-8 h-8 text-white" />
        </div>

        <motion.button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="text-white"
          whileTap={{ scale: 0.95 }}
        >
          <Menu className="w-6 h-6" />
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-[34px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-500/10 border-l-4 border-[#F57C00] rounded-[20px] p-5 mb-5"
        >
          <h2 className="text-[#F57C00] font-bold text-lg mb-1">
            {t('admin.welcome_admin')}
          </h2>
          <p className="text-muted-foreground text-[14px]">{t('admin.manage_app')}</p>
        </motion.div>

        <div className="mb-5">
          <p className="text-[12px] font-medium text-[#2E7D32] uppercase tracking-wide mb-3">
            {t('admin.realtime_stats')}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-[20px] border border-border p-4"
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="text-3xl font-bold mb-1"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </motion.p>
                <p className="text-[12px] text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[12px] font-medium text-[#2E7D32] uppercase tracking-wide mb-3">
            {t('admin.management')}
          </p>

          <div className="space-y-3">
            <motion.button
              onClick={() => navigate('/admin/stops')}
              className="w-full bg-card rounded-[20px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-left"
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#F57C00] flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    {t('admin.manage_stops')}
                  </h3>
                  <p className="text-[14px] text-muted-foreground mb-2">
                    {t('admin.manage_stops_desc')}
                  </p>
                  <span className="text-[#F57C00] text-[14px] font-medium">
                    {t('admin.access')} →
                  </span>
                </div>
              </div>
            </motion.button>

            <motion.button
              onClick={() => navigate('/admin/lines')}
              className="w-full bg-card rounded-[20px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-left"
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#F57C00] flex items-center justify-center flex-shrink-0">
                  <Bus className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    {t('admin.manage_lines')}
                  </h3>
                  <p className="text-[14px] text-muted-foreground mb-2">
                    {t('admin.manage_lines_desc')}
                  </p>
                  <span className="text-[#F57C00] text-[14px] font-medium">
                    {t('admin.access')} →
                  </span>
                </div>
              </div>
            </motion.button>

            <motion.button
              onClick={() => navigate('/admin/users')}
              className="w-full bg-card rounded-[20px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-left"
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#F57C00] flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    Gérer les utilisateurs
                  </h3>
                  <p className="text-[14px] text-muted-foreground mb-2">
                    Consultez la liste des utilisateurs et gérez les comptes.
                  </p>
                  <span className="text-[#F57C00] text-[14px] font-medium">
                    {t('admin.access')} →
                  </span>
                </div>
              </div>
            </motion.button>

            <motion.button
              onClick={() => navigate('/admin/notifications')}
              className="w-full bg-card rounded-[20px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-left"
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#F57C00] flex items-center justify-center flex-shrink-0">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    Diffuser des notifications
                  </h3>
                  <p className="text-[14px] text-muted-foreground mb-2">
                    Envoyez des alertes en temps réel à tous les voyageurs.
                  </p>
                  <span className="text-[#F57C00] text-[14px] font-medium">
                    {t('admin.access')} →
                  </span>
                </div>
              </div>
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 z-40"
            />

            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-card rounded-r-[24px] shadow-lg z-50 overflow-hidden"
            >
              <div className="bg-[#F57C00] h-[130px] flex items-center justify-center rounded-br-[24px]">
                <div className="text-center">
                  <Bus className="w-16 h-16 text-white mx-auto mb-2" />
                  <p className="text-white text-[14px] font-light">
                    {t('admin.dashboard_title')}
                  </p>
                </div>
              </div>

              <div className="p-4">
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-[16px] mb-2 transition-all
                      ${item.active
                        ? 'bg-[#E8F5E9] border-l-3 border-[#2E7D32] text-[#2E7D32] font-semibold'
                        : 'text-foreground hover:bg-muted'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                ))}

                <div className="h-px bg-border my-4" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-[16px] text-[#C62828] hover:bg-muted"
                >
                  <LogOut className="w-5 h-5" />
                  <span>{t('profile.logout')}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
