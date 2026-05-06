import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { User, Mail, Lock, Bus, MapPin, Phone, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: 'spring',
      stiffness: 260,
      damping: 20
    }
  }
};

export const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = t('validation.required');
    
    const emailValue = email.trim();
    if (!emailValue) {
      newErrors.email = t('validation.required');
    } else if (!/\S+@\S+\.\S+/.test(emailValue)) {
      newErrors.email = t('validation.invalid_email');
    }

    if (!phone.trim()) {
      newErrors.phone = t('validation.required');
    } else if (!/^\d{8,}$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = t('validation.invalid_phone');
    }
    if (!password) {
      newErrors.password = t('validation.required');
    } else if (password.length < 6) {
      newErrors.password = t('validation.min_password');
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = t('validation.password_mismatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await register(name, email, password, phone);
      toast.success(t('auth.register_success'));
      navigate('/user/home');
    } catch (error: any) {
      const message = error.response?.data?.message || t('common.error_occurred');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="size-full bg-background flex flex-col overflow-hidden relative transition-colors duration-300">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FFB74D]/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#F57C00]/10 rounded-full blur-[60px] translate-y-1/4 -translate-x-1/4 pointer-events-none" />

      {/* Hero Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
        className="relative bg-gradient-to-br from-[#FF9800] via-[#F57C00] to-[#E65100] pt-[44px] pb-8 px-5 rounded-b-[48px] shadow-[0_20px_50px_rgba(245,124,0,0.2)] overflow-hidden shrink-0 z-10"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] pointer-events-none opacity-30 mix-blend-overlay" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-10 -left-10 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
        
        <div className="relative z-10 flex flex-col items-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute left-0 top-0 text-white p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <motion.div 
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative mb-3 bg-white/20 backdrop-blur-xl p-4 rounded-[24px] border border-white/40 shadow-xl mt-2"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-[24px] pointer-events-none" />
            <Bus className="w-10 h-10 text-white drop-shadow-md" />
            <motion.div 
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2 bg-white p-1.5 rounded-full border-[2px] border-[#F57C00] shadow-md"
            >
              <MapPin className="w-4 h-4 text-[#2E7D32]" />
            </motion.div>
          </motion.div>
          
          <h2 className="text-[28px] font-black text-white drop-shadow-md tracking-tight">
            {t('auth.register_title')}
          </h2>
          <p className="text-[#FFE0B2] text-[15px] font-medium mt-1">
            {t('auth.register_subtitle')}
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 overflow-y-auto px-6 pt-8 pb-[34px] relative z-10"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div variants={itemVariants}>
            <Input
              label={t('auth.full_name')}
              value={name}
              onChange={setName}
              icon={<User className="w-5 h-5" />}
              error={errors.name}
              success={!errors.name && name.length > 0}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Input
              label={t('auth.email_label')}
              type="email"
              value={email}
              onChange={setEmail}
              icon={<Mail className="w-5 h-5" />}
              error={errors.email}
              success={!errors.email && email.length > 0}
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Input
              label={t('auth.phone_number')}
              type="tel"
              value={phone}
              onChange={setPhone}
              icon={<Phone className="w-5 h-5" />}
              error={errors.phone}
              success={!errors.phone && phone.length > 0}
              placeholder={t('auth.phone_placeholder')}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Input
              label={t('auth.password_label')}
              type="password"
              value={password}
              onChange={setPassword}
              icon={<Lock className="w-5 h-5" />}
              error={errors.password}
              success={!errors.password && password.length > 0}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Input
              label={t('auth.confirm_password_label')}
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              icon={<Lock className="w-5 h-5" />}
              error={errors.confirmPassword}
              success={!errors.confirmPassword && confirmPassword.length > 0}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="pt-2">
            <Button 
              type="submit" 
              variant="primary" 
              fullWidth 
              loading={loading}
              className="flex items-center justify-center gap-2"
            >
              {t('auth.register_btn')} <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>

          <motion.p 
            variants={itemVariants}
            className="text-center text-[15px] text-[#616161] pt-4"
          >
            {t('auth.already_account')}{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-[#F57C00] font-bold hover:underline"
            >
              {t('auth.login_btn')}
            </button>
          </motion.p>
        </form>
      </motion.div>
    </div>
  );
};
