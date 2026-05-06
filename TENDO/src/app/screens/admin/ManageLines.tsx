import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Edit, Trash2, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Header } from '../../components/Header';
import { BusLine } from '../../data/mockData';
import { toast } from 'sonner';
import api from '../../data/api';
import { useTranslation } from 'react-i18next';

export const ManageLines = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [lines, setLines] = useState<BusLine[]>([]);
  const [allStops, setAllStops] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<BusLine | null>(null);
  const [formData, setFormData] = useState({ 
    number: '', 
    name: '', 
    color: '#F57C00',
    type: 'Standard',
    hasWiFi: false,
    hasAC: false,
    isAccessible: false,
    selectedStops: [] as string[]
  });

  const fetchLines = async () => {
    try {
      const response = await api.get('/lines/');
      const data = response.data.map((l: any) => ({
        id: l.id.toString(),
        number: l.numero,
        name: l.nom,
        color: l.couleur,
        type: l.type,
        hasWiFi: l.hasWiFi,
        hasAC: l.hasAC,
        isAccessible: l.isAccessible,
        stops: l.lineStops ? l.lineStops.map((ls: any) => ls.stop.id.toString()) : []
      }));
      setLines(data);
    } catch (e) {
      console.error(e);
      toast.error(t('admin.error_loading_lines'));
    }
  };

  const fetchStops = async () => {
    try {
      const response = await api.get('/stops/search?name=&size=200');
      if (response.data && response.data.content) {
        setAllStops(response.data.content);
      }
    } catch (e) {
      console.error('Error fetching stops:', e);
    }
  };

  useEffect(() => {
    fetchLines();
    fetchStops();
  }, []);

  const filteredLines = lines.filter(line =>
    line.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    line.number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t('admin.delete_line_confirm', { name }))) return;
    try {
      await api.delete(`/admin/lines/${id}`);
      setLines(lines.filter(l => l.id !== id));
      toast.success(t('admin.line_deleted', { name }));
    } catch (e) {
      toast.error(t('common.error_deleting'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for duplicate number (only for new lines or if number changed)
    const isDuplicate = lines.some(l => 
      l.number === formData.number && (!editingLine || editingLine.id !== l.id)
    );
    
    if (isDuplicate) {
      toast.error(t('admin.line_number_exists') || "Ce numéro de ligne existe déjà.");
      return;
    }

    try {
      const payload = {
        numero: formData.number,
        nom: formData.name,
        couleur: formData.color,
        type: formData.type === 'Shuttle' ? 'Navette' : formData.type,
        hasWiFi: formData.hasWiFi,
        hasAC: formData.hasAC,
        isAccessible: formData.isAccessible,
        lineStops: formData.selectedStops.map((stopId, index) => ({
          stop: { id: parseInt(stopId) },
          position: index + 1
        }))
      };

      if (editingLine) {
        await api.put(`/admin/lines/${editingLine.id}`, payload);
        toast.success(t('admin.line_updated'));
      } else {
        await api.post('/admin/lines/', payload);
        toast.success(t('admin.line_added'));
      }
      setIsModalOpen(false);
      setEditingLine(null);
      setFormData({ 
        number: '', 
        name: '', 
        color: '#F57C00',
        type: 'Standard',
        hasWiFi: false,
        hasAC: false,
        isAccessible: false,
        selectedStops: []
      });
      fetchLines();
    } catch (e: any) {
      console.error('Error saving line:', e);
      const errorMsg = e.response?.data?.message || t('common.error_saving');
      toast.error(errorMsg);
    }
  };

  const openModal = (line?: BusLine) => {
    if (line) {
      setEditingLine(line);
      setFormData({
        number: line.number,
        name: line.name,
        color: line.color,
        type: (line as any).type || 'Standard',
        hasWiFi: (line as any).hasWiFi || false,
        hasAC: (line as any).hasAC || false,
        isAccessible: (line as any).isAccessible || false,
        selectedStops: line.stops || []
      });
    } else {
      setEditingLine(null);
      setFormData({ 
        number: '', 
        name: '', 
        color: '#F57C00',
        type: 'Standard',
        hasWiFi: false,
        hasAC: false,
        isAccessible: false,
        selectedStops: []
      });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="size-full bg-white flex flex-col overflow-hidden">
      <Header title={t('admin.manage_lines')} showBack />

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-[34px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">{t('admin.lines')}</h2>
            <p className="text-sm text-[#9E9E9E]">
              {filteredLines.length} {t('home.lines_count')}
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
          {filteredLines.map((line, index) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-[20px] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: line.color }}
                >
                  <span className="text-white font-bold text-lg">{line.number}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#1A1A1A] mb-1">{line.name}</h3>
                  <div className="flex gap-2">
                    <span className="inline-block px-3 py-1 bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-bold rounded-full uppercase">
                      {line.type || 'Standard'}
                    </span>
                    {line.hasWiFi && <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase">WiFi</span>}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(line)}
                    className="p-2 text-[#2E7D32] hover:bg-[#E8F5E9] rounded-full transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(line.id, line.number)}
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
              className="bg-white w-full max-w-[450px] max-h-[90vh] rounded-[32px] overflow-hidden flex flex-col"
            >
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[#1A1A1A]">
                    {editingLine ? t('admin.edit_line') : t('admin.add_line')}
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-[12px] font-bold text-[#9E9E9E] uppercase mb-1 block">{t('admin.line_number')}</label>
                    <input
                      required
                      value={formData.number}
                      onChange={e => setFormData({ ...formData, number: e.target.value })}
                      placeholder="Ex: 01"
                      className="w-full h-12 bg-[#FAFAFA] border border-[#E8E8E8] rounded-xl px-4 focus:border-[#F57C00] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-[#9E9E9E] uppercase mb-1 block">{t('admin.line_name')}</label>
                    <input
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Gare - Université"
                      className="w-full h-12 bg-[#FAFAFA] border border-[#E8E8E8] rounded-xl px-4 focus:border-[#F57C00] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-[#9E9E9E] uppercase mb-1 block">{t('admin.color')}</label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={e => setFormData({ ...formData, color: e.target.value })}
                        className="w-12 h-12 rounded-lg cursor-pointer border-none p-0"
                      />
                      <input
                        value={formData.color}
                        onChange={e => setFormData({ ...formData, color: e.target.value })}
                        className="flex-1 h-12 bg-[#FAFAFA] border border-[#E8E8E8] rounded-xl px-4 focus:border-[#F57C00] outline-none"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-[12px] font-bold text-[#9E9E9E] uppercase mb-1 block">{t('admin.line_type')}</label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
                      className="w-full h-12 bg-[#FAFAFA] border border-[#E8E8E8] rounded-xl px-4 focus:border-[#F57C00] outline-none"
                    >
                      <option value="Standard">{t('admin.type_standard')}</option>
                      <option value="Express">{t('admin.type_express')}</option>
                      <option value="Navette">{t('admin.type_shuttle')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[12px] font-bold text-[#9E9E9E] uppercase mb-1 block">
                      {t('admin.stops')} ({formData.selectedStops.length})
                    </label>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto border border-[#E8E8E8] rounded-xl p-2 bg-[#FAFAFA]">
                      {formData.selectedStops.map((stopId, index) => {
                        const stop = allStops.find(s => s.id.toString() === stopId);
                        return (
                          <div key={`${stopId}-${index}`} className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 bg-[#F57C00] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                                {index + 1}
                              </span>
                              <span className="text-sm font-medium truncate max-w-[150px]">{stop?.nom || 'Stop'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => {
                                  const newStops = [...formData.selectedStops];
                                  [newStops[index], newStops[index-1]] = [newStops[index-1], newStops[index]];
                                  setFormData({ ...formData, selectedStops: newStops });
                                }}
                                className="p-1 text-gray-400 disabled:opacity-30"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                disabled={index === formData.selectedStops.length - 1}
                                onClick={() => {
                                  const newStops = [...formData.selectedStops];
                                  [newStops[index], newStops[index+1]] = [newStops[index+1], newStops[index]];
                                  setFormData({ ...formData, selectedStops: newStops });
                                }}
                                className="p-1 text-gray-400 disabled:opacity-30"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const newStops = formData.selectedStops.filter((_, i) => i !== index);
                                  setFormData({ ...formData, selectedStops: newStops });
                                }}
                                className="p-1 text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      <select
                        onChange={(e) => {
                          if (e.target.value && !formData.selectedStops.includes(e.target.value)) {
                            setFormData({ ...formData, selectedStops: [...formData.selectedStops, e.target.value] });
                          }
                          e.target.value = '';
                        }}
                        className="w-full h-10 text-sm bg-white border border-dashed border-gray-300 rounded-lg px-2 outline-none"
                      >
                        <option value="">+ {t('admin.add_stop')}</option>
                        {allStops
                          .filter(s => !formData.selectedStops.includes(s.id.toString()))
                          .map(s => (
                            <option key={s.id} value={s.id}>{s.nom}</option>
                          ))
                        }
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, hasWiFi: !formData.hasWiFi })}
                      className={`h-12 rounded-xl border flex items-center justify-center gap-2 transition-all ${formData.hasWiFi ? 'bg-[#E8F5E9] border-[#2E7D32] text-[#2E7D32]' : 'bg-[#FAFAFA] border-[#E8E8E8] text-[#9E9E9E]'}`}
                    >
                      <span className="text-[12px] font-bold">{t('admin.has_wifi')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, hasAC: !formData.hasAC })}
                      className={`h-12 rounded-xl border flex items-center justify-center gap-2 transition-all ${formData.hasAC ? 'bg-[#E8F5E9] border-[#2E7D32] text-[#2E7D32]' : 'bg-[#FAFAFA] border-[#E8E8E8] text-[#9E9E9E]'}`}
                    >
                      <span className="text-[12px] font-bold">{t('admin.has_ac')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isAccessible: !formData.isAccessible })}
                      className={`h-12 rounded-xl border flex items-center justify-center gap-2 transition-all col-span-2 ${formData.isAccessible ? 'bg-[#E8F5E9] border-[#2E7D32] text-[#2E7D32]' : 'bg-[#FAFAFA] border-[#E8E8E8] text-[#9E9E9E]'}`}
                    >
                      <span className="text-[12px] font-bold">{t('admin.is_accessible')}</span>
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="w-full h-14 bg-[#F57C00] text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform"
                  >
                    {editingLine ? t('common.update') : t('common.save')}
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
