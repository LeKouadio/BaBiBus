import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Send, Trash2, Info, AlertTriangle, CheckCircle, Clock, X, Plus } from 'lucide-react';
import { Header } from '../../components/Header';
import { toast } from 'sonner';
import api from '../../data/api';
import { useTranslation } from 'react-i18next';

interface Notification {
  id: number;
  title: string;
  description: string;
  time: string;
  icon: string;
  color: string;
}

export const ManageNotifications = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'Info',
    color: '#1976D2'
  });

  const icons = [
    { name: 'Info', icon: Info },
    { name: 'AlertTriangle', icon: AlertTriangle },
    { name: 'CheckCircle', icon: CheckCircle },
    { name: 'Bell', icon: Bell },
    { name: 'Clock', icon: Clock }
  ];

  const colors = [
    { name: 'Blue', hex: '#1976D2' },
    { name: 'Orange', hex: '#F57C00' },
    { name: 'Green', hex: '#2E7D32' },
    { name: 'Red', hex: '#C62828' },
    { name: 'Purple', hex: '#7B1FA2' }
  ];

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (e) {
      console.error(e);
      toast.error(t('common.error_loading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cette notification ?")) return;
    try {
      await api.delete(`/admin/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success("Notification supprimée");
    } catch (e) {
      toast.error(t('common.error_deleting'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/notifications', formData);
      toast.success("Notification envoyée à tous les utilisateurs");
      setIsModalOpen(false);
      setFormData({ title: '', description: '', icon: 'Info', color: '#1976D2' });
      fetchNotifications();
    } catch (e) {
      toast.error("Erreur lors de l'envoi");
    }
  };

  const getIcon = (name: string, color: string) => {
    const IconComp = icons.find(i => i.name === name)?.icon || Info;
    return <IconComp className="w-6 h-6" style={{ color }} />;
  };

  return (
    <div className="size-full bg-[#FAFAFA] flex flex-col overflow-hidden">
      <Header title="Notifications" showBack />

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-[100px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Historique</h2>
            <p className="text-sm text-[#9E9E9E]">{notifications.length} notifications envoyées</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="bg-[#F57C00] text-white px-4 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-orange-200"
          >
            <Plus className="w-4 h-4" />
            Éditer
          </motion.button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#F57C00] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[#9E9E9E]">{t('common.loading')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif, index) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-[24px] p-5 border border-[#E8E8E8] shadow-sm relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: notif.color }} />
                
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-gray-50">
                    {getIcon(notif.icon, notif.color)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-[#1A1A1A] truncate">{notif.title}</h3>
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className="p-1.5 text-[#C62828] opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-[#FFEBEE]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[14px] text-[#616161] leading-relaxed mb-3">
                      {notif.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-[12px] text-[#9E9E9E]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(notif.time).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-[450px] rounded-t-[40px] sm:rounded-[40px] p-8 overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-[#1A1A1A]">Nouvelle Notification</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-[12px] font-black text-[#9E9E9E] uppercase tracking-widest mb-2 block">Titre de l'alerte</label>
                  <input
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Perturbation Ligne 11"
                    className="w-full h-14 bg-[#FAFAFA] border-2 border-transparent focus:border-[#F57C00] focus:bg-white rounded-[20px] px-5 outline-none transition-all font-bold"
                  />
                </div>

                <div>
                  <label className="text-[12px] font-black text-[#9E9E9E] uppercase tracking-widest mb-2 block">Message aux voyageurs</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Décrivez la situation ici..."
                    className="w-full bg-[#FAFAFA] border-2 border-transparent focus:border-[#F57C00] focus:bg-white rounded-[24px] p-5 outline-none transition-all resize-none font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[12px] font-black text-[#9E9E9E] uppercase tracking-widest mb-2 block">Icône</label>
                    <div className="flex flex-wrap gap-2">
                      {icons.map(item => (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon: item.name })}
                          className={`p-3 rounded-xl border-2 transition-all ${formData.icon === item.name ? 'border-[#F57C00] bg-orange-50' : 'border-transparent bg-gray-50'}`}
                        >
                          <item.icon className={`w-5 h-5 ${formData.icon === item.name ? 'text-[#F57C00]' : 'text-gray-400'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[12px] font-black text-[#9E9E9E] uppercase tracking-widest mb-2 block">Couleur</label>
                    <div className="flex flex-wrap gap-2">
                      {colors.map(c => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setFormData({ ...formData, color: c.hex })}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === c.hex ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-16 bg-[#F57C00] text-white font-black text-lg rounded-[24px] shadow-xl shadow-orange-200 flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
                >
                  <Send className="w-6 h-6" />
                  Diffuser maintenant
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
