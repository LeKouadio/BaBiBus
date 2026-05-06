import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import { Header } from '../../components/Header';
import { BusStop } from '../../data/mockData';
import { toast } from 'sonner';
import api from '../../data/api';
import { useTranslation } from 'react-i18next';

export const ManageStops = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [stops, setStops] = useState<BusStop[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<BusStop | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '', latitude: '', longitude: '' });

  const fetchStops = async () => {
    try {
      const response = await api.get('/stops/search?name=&size=100');
      const data = response.data.content.map((s: any) => ({
        id: s.id.toString(),
        name: s.nom,
        address: s.adresse || '',
        latitude: s.latitude,
        longitude: s.longitude,
        lines: s.lignes || []
      }));
      setStops(data);
    } catch (e) {
      console.error(e);
      toast.error(t('common.error_loading'));
    }
  };

  useEffect(() => {
    fetchStops();
  }, []);

  const filteredStops = stops.filter(stop =>
    stop.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t('admin.delete_stop_confirm', { name }))) return;
    try {
      await api.delete(`/admin/stops/${id}`);
      setStops(stops.filter(s => s.id !== id));
      toast.success(t('admin.stop_deleted', { name }));
    } catch (e) {
      toast.error(t('common.error_deleting'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        nom: formData.name,
        adresse: formData.address,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };

      if (editingStop) {
        await api.put(`/admin/stops/${editingStop.id}/`, payload);
        toast.success(t('admin.stop_updated'));
      } else {
        await api.post('/admin/stops/', payload);
        toast.success(t('admin.stop_added'));
      }
      setIsModalOpen(false);
      setEditingStop(null);
      setFormData({ name: '', address: '', latitude: '', longitude: '' });
      fetchStops();
    } catch (e: any) {
      console.error('Error saving stop:', e);
      const errorMsg = e.response?.data?.message || t('common.error_saving');
      toast.error(errorMsg);
    }
  };

  const openModal = (stop?: BusStop) => {
    if (stop) {
      setEditingStop(stop);
      setFormData({
        name: stop.name,
        address: stop.address,
        latitude: stop.latitude.toString(),
        longitude: stop.longitude.toString()
      });
    } else {
      setEditingStop(null);
      setFormData({ name: '', address: '', latitude: '', longitude: '' });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="size-full bg-white flex flex-col overflow-hidden">
      <Header title={t('admin.manage_stops')} showBack />

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-[34px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">{t('admin.active_stops')}</h2>
            <p className="text-sm text-[#9E9E9E]">
              {filteredStops.length} {t('home.stops').toLowerCase()}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal()}
            className="bg-[#F57C00] text-white px-4 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-orange-200"
          >
            <Plus className="w-4 h-4" />
            {t('common.create')}
          </motion.button>
        </div>

        <div className="mb-5">
          <div className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('home.search_placeholder')}
              className="w-full h-[52px] rounded-[50px] px-5 pl-12 bg-[#FAFAFA] border border-[#E8E8E8] focus:border-[#F57C00] transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#F57C00]" />
          </div>
        </div>

        <div className="space-y-3 mb-20">
          {filteredStops.map((stop, index) => (
            <motion.div
              key={stop.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-[20px] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F57C00] flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                  {stop.name[0]}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#1A1A1A] mb-1">{stop.name}</h3>
                  <p className="text-[12px] text-[#616161] mb-1">{stop.address}</p>
                  <p className="text-[12px] text-[#9E9E9E]">
                    {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(stop)}
                    className="p-2 text-[#2E7D32] hover:bg-[#E8F5E9] rounded-full transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(stop.id, stop.name)}
                    className="p-2 text-[#C62828] hover:bg-[#FFEBEE] rounded-full transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.button
        onClick={() => openModal()}
        className="fixed bottom-10 right-5 w-14 h-14 bg-[#F57C00] rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(245,124,0,0.30)] z-10"
        whileTap={{ scale: 0.9 }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Plus className="w-6 h-6 text-white" />
      </motion.button>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-5"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-[350px] rounded-[32px] overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[#1A1A1A]">
                    {editingStop ? t('admin.edit_stop') : t('admin.add_stop')}
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-[12px] font-bold text-[#9E9E9E] uppercase mb-1 block">{t('admin.stop_name')}</label>
                    <input
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-12 bg-[#FAFAFA] border border-[#E8E8E8] rounded-xl px-4 focus:border-[#F57C00] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-[#9E9E9E] uppercase mb-1 block">{t('admin.address')}</label>
                    <input
                      required
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      className="w-full h-12 bg-[#FAFAFA] border border-[#E8E8E8] rounded-xl px-4 focus:border-[#F57C00] outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[12px] font-bold text-[#9E9E9E] uppercase mb-1 block">{t('admin.latitude')}</label>
                      <input
                        required
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                        className="w-full h-12 bg-[#FAFAFA] border border-[#E8E8E8] rounded-xl px-4 focus:border-[#F57C00] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-bold text-[#9E9E9E] uppercase mb-1 block">{t('admin.longitude')}</label>
                      <input
                        required
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                        className="w-full h-12 bg-[#FAFAFA] border border-[#E8E8E8] rounded-xl px-4 focus:border-[#F57C00] outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full h-14 bg-[#F57C00] text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform"
                  >
                    {editingStop ? t('common.update') : t('common.save')}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
