import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Trash2, User as UserIcon, ShieldCheck, Mail, Phone, Plus, X, Lock, Shield, Save, Power, Edit, UserCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { Header } from '../../components/Header';
import { User } from '../../data/mockData';
import { toast } from 'sonner';
import api from '../../data/api';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

export const ManageUsers = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'USER'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      const data = response.data.map((u: any) => ({
        id: u.id.toString(),
        name: u.nom,
        email: u.email,
        role: u.role.toLowerCase(),
        phone: u.telephone || '',
        enabled: u.enabled ?? true
      }));
      setUsers(data);
    } catch (e) {
      console.error(e);
      toast.error(t('common.error_loading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (name === 'Admin BaBiBUS' || id === '1') {
        toast.error("Impossible de supprimer l'administrateur principal");
        return;
    }
    if (!confirm(`Voulez-vous vraiment supprimer l'utilisateur ${name} ?`)) return;
    
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      toast.success(`Utilisateur ${name} supprimé`);
      setIsDetailsModalOpen(false);
    } catch (e) {
      toast.error(t('common.error_deleting'));
    }
  };

  const toggleUserStatus = async (user: User) => {
    if (user.id === '1' || user.name === 'Admin BaBiBUS') {
      toast.error("Impossible de désactiver l'administrateur principal");
      return;
    }

    try {
      const newStatus = !user.enabled;
      await api.put(`/admin/users/${user.id}/`, {
        nom: user.name,
        email: user.email,
        telephone: user.phone,
        role: user.role.toUpperCase(),
        enabled: newStatus,
        language: 'fr'
      });
      
      setUsers(users.map(u => u.id === user.id ? { ...u, enabled: newStatus } : u));
      if (selectedUser?.id === user.id) {
        setSelectedUser({ ...user, enabled: newStatus });
      }
      toast.success(newStatus ? "Compte activé" : "Compte désactivé");
    } catch (e) {
      toast.error("Erreur lors du changement de statut");
    }
  };

  const openDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const openModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't show password
      phone: user.phone || '',
      role: user.role.toUpperCase()
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        nom: formData.name,
        email: formData.email,
        telephone: formData.phone,
        role: formData.role,
        language: 'fr'
      } as any;

      if (formData.password) {
        payload.motDePasse = formData.password;
      }

      if (editingUser) {
        await api.put(`/admin/users/${editingUser.id}/`, payload);
        toast.success("Utilisateur mis à jour");
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (e: any) {
      console.error(e);
      toast.error(e.response?.data?.message || t('common.error_saving'));
    }
  };

  return (
    <div className="size-full bg-white flex flex-col overflow-hidden">
      <Header title={t('admin.users')} showBack />

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-[34px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">{t('admin.users')}</h2>
            <p className="text-sm text-[#9E9E9E]">
              {filteredUsers.length} utilisateur(s) trouvé(s)
            </p>
          </div>
          </div>

        <div className="mb-5">
          <div className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un utilisateur..."
              className="w-full h-[52px] rounded-[50px] px-5 pl-12 bg-[#FAFAFA] border border-[#E8E8E8] focus:border-[#F57C00] transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#F57C00]" />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#F57C00] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[#9E9E9E]">{t('common.loading')}</p>
          </div>
        ) : (
          <div className="space-y-3 mb-20">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-[24px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#F5F5F5]"
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${user.role === 'admin' ? 'bg-[#E3F2FD] text-[#1976D2]' : 'bg-[#E8F5E9] text-[#2E7D32]'}`}>
                      {user.role === 'admin' ? <ShieldCheck className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${user.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-[#1A1A1A] truncate">{user.name}</h3>
                      {user.role === 'admin' && (
                        <span className="px-2 py-0.5 bg-[#1976D2] text-white text-[10px] font-black rounded-full uppercase">Admin</span>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[13px] text-[#616161]">
                        <Mail className="w-3.5 h-3.5 text-[#9E9E9E]" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1.5 text-[13px] text-[#616161]">
                          <Phone className="w-3.5 h-3.5 text-[#9E9E9E]" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openDetails(user)}
                      className="p-2.5 text-[#2E7D32] hover:bg-[#E8F5E9] rounded-full transition-colors flex-shrink-0"
                    >
                      <UserCircle className="w-6 h-6" />
                    </button>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        className="p-2.5 text-[#C62828] hover:bg-[#FFEBEE] rounded-full transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isDetailsModalOpen && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-5"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-white w-full max-w-[400px] rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="relative p-8 flex flex-col items-center">
                <button 
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="absolute right-6 top-6 p-2 bg-[#FAFAFA] rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center mb-4 ${selectedUser.role === 'admin' ? 'bg-[#E3F2FD] text-[#1976D2]' : 'bg-[#E8F5E9] text-[#2E7D32]'}`}>
                  {selectedUser.role === 'admin' ? <ShieldCheck className="w-12 h-12" /> : <UserIcon className="w-12 h-12" />}
                </div>

                <h3 className="text-2xl font-black text-[#1A1A1A] mb-1">{selectedUser.name}</h3>
                <p className="text-[#9E9E9E] font-medium mb-4">{selectedUser.email}</p>

                <div className={`px-4 py-1.5 rounded-full flex items-center gap-2 mb-8 ${selectedUser.enabled ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFEBEE] text-[#C62828]'}`}>
                  {selectedUser.enabled ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span className="text-xs font-black uppercase tracking-wider">
                    {selectedUser.enabled ? "Compte Actif" : "Compte Désactivé"}
                  </span>
                </div>

                <div className="w-full grid grid-cols-1 gap-3">
                  <button
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      openModal(selectedUser);
                    }}
                    className="w-full h-14 bg-[#FAFAFA] hover:bg-[#F0F0F0] rounded-2xl flex items-center px-6 gap-4 transition-all group"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-blue-600">
                      <Edit className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-[#1A1A1A]">Modifier le compte</span>
                  </button>

                  <button
                    onClick={() => toggleUserStatus(selectedUser)}
                    className={`w-full h-14 rounded-2xl flex items-center px-6 gap-4 transition-all group ${selectedUser.enabled ? 'bg-[#FFF3E0] hover:bg-[#FFE0B2]' : 'bg-[#E8F5E9] hover:bg-[#C8E6C9]'}`}
                  >
                    <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${selectedUser.enabled ? 'text-orange-600' : 'text-green-600'}`}>
                      <Power className="w-5 h-5" />
                    </div>
                    <span className={`font-bold ${selectedUser.enabled ? 'text-orange-700' : 'text-green-700'}`}>
                      {selectedUser.enabled ? "Désactiver le compte" : "Activer le compte"}
                    </span>
                  </button>

                  <button
                    onClick={() => handleDelete(selectedUser.id, selectedUser.name)}
                    className="w-full h-14 bg-[#FFEBEE] hover:bg-[#FFCDD2] rounded-2xl flex items-center px-6 gap-4 transition-all group"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-red-600">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-red-700">Supprimer le compte</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

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
              className="bg-white w-full max-w-[380px] rounded-[32px] overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[#1A1A1A]">
                    Modifier l'utilisateur
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label={t('auth.full_name')}
                    required
                    value={formData.name}
                    onChange={(val) => setFormData({ ...formData, name: val })}
                    icon={<UserIcon className="w-5 h-5" />}
                  />
                  <Input
                    label={t('auth.email_label')}
                    required
                    type="email"
                    value={formData.email}
                    onChange={(val) => setFormData({ ...formData, email: val })}
                    icon={<Mail className="w-5 h-5" />}
                  />
                  <Input
                    label={t('auth.password_label')}
                    required={!editingUser}
                    type="password"
                    placeholder={editingUser ? "Laisser vide pour ne pas changer" : ""}
                    value={formData.password}
                    onChange={(val) => setFormData({ ...formData, password: val })}
                    icon={<Lock className="w-5 h-5" />}
                  />
                  <Input
                    label={t('auth.phone_number')}
                    type="tel"
                    value={formData.phone}
                    onChange={(val) => setFormData({ ...formData, phone: val })}
                    icon={<Phone className="w-5 h-5" />}
                  />

                  <div>
                    <label className="text-[12px] font-bold text-[#9E9E9E] uppercase mb-2 block">
                      Rôle de l'utilisateur
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'USER' })}
                        className={`flex-1 h-12 rounded-xl border flex items-center justify-center gap-2 transition-all ${formData.role === 'USER' ? 'bg-[#E8F5E9] border-[#2E7D32] text-[#2E7D32]' : 'bg-white border-[#E8E8E8] text-[#9E9E9E]'}`}
                      >
                        <UserIcon className="w-4 h-4" />
                        <span className="font-bold text-sm">Voyageur</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'ADMIN' })}
                        className={`flex-1 h-12 rounded-xl border flex items-center justify-center gap-2 transition-all ${formData.role === 'ADMIN' ? 'bg-[#E3F2FD] border-[#1976D2] text-[#1976D2]' : 'bg-white border-[#E8E8E8] text-[#9E9E9E]'}`}
                      >
                        <Shield className="w-4 h-4" />
                        <span className="font-bold text-sm">Admin</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      icon={<Save className="w-5 h-5" />}
                    >
                      {editingUser ? t('common.update') : t('common.save')}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
