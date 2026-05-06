import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { User, Mail, Phone } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Header } from '../../components/Header';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const EditProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast.error(t('common.all_fields_required'));
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error(t('validation.invalid_email'));
      return;
    }

    setLoading(true);
    try {
      await updateProfile(name, email, phone);
      toast.success(t('profile.updated'));
      navigate('/user/profile');
    } catch (error) {
      toast.error(t('common.error_occurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="size-full bg-background flex flex-col overflow-hidden transition-colors duration-300">
      <Header title={t('profile.edit_profile')} showBack />

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-[34px]">
        <form onSubmit={handleSubmit} className="space-y-[14px]">
          <Input
            label={t('auth.full_name')}
            value={name}
            onChange={setName}
            icon={<User className="w-5 h-5" />}
            success={name.length > 0}
          />

          <Input
            label={t('auth.email_label')}
            type="email"
            value={email}
            onChange={setEmail}
            icon={<Mail className="w-5 h-5" />}
            success={email.length > 0 && /\S+@\S+\.\S+/.test(email)}
          />

          <Input
            label={t('auth.phone_number')}
            type="tel"
            value={phone}
            onChange={setPhone}
            icon={<Phone className="w-5 h-5" />}
            success={phone.length >= 8}
          />

          <div className="pt-4 space-y-3">
            <Button type="submit" variant="primary" fullWidth loading={loading}>
              {t('common.save')}
            </Button>

            <Button
              type="button"
              variant="outline-green"
              fullWidth
              onClick={() => navigate('/user/profile')}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
