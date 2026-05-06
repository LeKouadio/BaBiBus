import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bell, Info, ChevronRight, Clock, X, Trash2, AlertTriangle, Wifi, CheckCircle, MapPin } from 'lucide-react';
import { Header } from '../../components/Header';
import { BottomTabBar } from '../../components/BottomTabBar';
import api from '../../data/api';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Clock': return Clock;
    case 'Info': return Info;
    case 'Bell': return Bell;
    case 'AlertTriangle': return AlertTriangle;
    case 'Wifi': return Wifi;
    case 'CheckCircle': return CheckCircle;
    case 'MapPin': return MapPin;
    default: return Bell;
  }
};

const formatTime = (timeStr: string, t: any) => {
  const date = new Date(timeStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHrs === 0) return t('notifications.time_less_than_hour');
  if (diffHrs < 24) return t('notifications.time_hours_ago').replace('{{hours}}', diffHrs.toString());
  return t('notifications.time_yesterday');
};

export const Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        if (res.data && res.data.length > 0) {
          setNotifications(res.data);
        } else {
          // Mock data if backend is empty
          setNotifications([
            {
              id: 101,
              title: "Perturbation Ligne 11",
              description: "Des retards sont à prévoir sur la ligne 11 en raison de travaux au Plateau.",
              time: new Date().toISOString(),
              isRead: false,
              icon: "AlertTriangle",
              color: "#F57C00"
            },
            {
              id: 102,
              title: "Nouvel arrêt ajouté",
              description: "L'arrêt 'Palais de la Culture' est désormais desservi par la ligne 05.",
              time: new Date(Date.now() - 3600000 * 2).toISOString(),
              isRead: false,
              icon: "MapPin",
              color: "#2E7D32"
            },
            {
              id: 103,
              title: "WiFi disponible",
              description: "Bonne nouvelle ! Le WiFi gratuit est désormais disponible sur les lignes 22 et 81.",
              time: new Date(Date.now() - 3600000 * 5).toISOString(),
              isRead: true,
              icon: "Wifi",
              color: "#1976D2"
            },
            {
              id: 104,
              title: "Mise à jour système",
              description: "Votre application BaBiBUS a été mise à jour vers la version 2.1.0.",
              time: new Date(Date.now() - 3600000 * 24).toISOString(),
              isRead: true,
              icon: "CheckCircle",
              color: "#4CAF50"
            }
          ]);
        }
      } catch (e) {
        console.error(e);
        // Fallback mock data on error
        setNotifications([
          {
            id: 101,
            title: "Perturbation Ligne 11",
            description: "Des retards sont à prévoir sur la ligne 11 en raison de travaux au Plateau.",
            time: new Date().toISOString(),
            isRead: false,
            icon: "AlertTriangle",
            color: "#F57C00"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success(t('notifications.delete_success'));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteAllNotifications = async () => {
    const previous = [...notifications];
    setNotifications([]);
    
    try {
      await api.delete('/notifications/all');
      toast.success(t('notifications.delete_all_success'));
    } catch (e) {
      console.error(e);
      setNotifications(previous);
      toast.error(t('common.error_occurred'));
    }
  };

  return (
    <div className="size-full bg-background flex flex-col overflow-hidden transition-colors duration-300">
      <Header title={t('notifications.title')} showBack />

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-[100px]">
        {loading ? (
           <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-[#F57C00] border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <>
            {notifications.length > 0 && (
              <div className="flex justify-end mb-4">
                <button 
                  onClick={deleteAllNotifications}
                  className="flex items-center gap-1.5 text-[13px] font-bold text-[#D32F2F] hover:opacity-80 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('notifications.delete_all')}
                </button>
              </div>
            )}
            
            <div className="space-y-4">
              {notifications.map((notif, index) => {
                const IconComponent = getIconComponent(notif.icon);
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => !notif.isRead && markAsRead(notif.id)}
                    className={`p-4 rounded-[20px] border ${notif.isRead ? 'bg-card border-border' : 'bg-orange-500/10 border-orange-500/20 cursor-pointer'} flex gap-4 items-start relative`}
                  >
                    {!notif.isRead && (
                      <div className="absolute top-4 right-4 w-2 h-2 bg-[#F57C00] rounded-full animate-pulse" />
                    )}
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${notif.color}20` }}
                    >
                      <IconComponent className="w-5 h-5" style={{ color: notif.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`text-[15px] font-bold ${notif.isRead ? 'text-foreground' : 'text-[#E65100]'} truncate`}>
                          {notif.title}
                        </h4>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className="p-1 hover:bg-black/5 rounded-full transition-colors shrink-0"
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                      <p className="text-[13px] text-muted-foreground leading-relaxed mb-2">
                        {notif.description}
                      </p>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {formatTime(notif.time, t)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 opacity-50">
                <Bell className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('notifications.empty')}</p>
              </div>
            )}
          </>
        )}
      </div>

      <BottomTabBar />
    </div>
  );
};
