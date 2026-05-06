import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Mail, ArrowLeft, Bus, MapPin } from 'lucide-react';
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

export const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(t('validation.required'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      await forgotPassword(email);
      toast.success(t('auth.reset_link_sent'));
      navigate('/login');
    } catch (err: any) {
      console.error('Forgot password error:', err);
      const message = err.response?.data?.message || t('common.error_occurred');
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="size-full bg-background flex flex-col overflow-hidden relative transition-colors duration-300">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-[#FF9800] via-[#F57C00] to-[#E65100] pt-[44px] pb-8 px-5 rounded-b-[48px] shadow-[0_20px_50px_rgba(245,124,0,0.2)] shrink-0"
      >
        <button
          onClick={() => navigate(-1)}
          className="absolute left-5 top-11 text-white p-2 hover:bg-white/10 rounded-full transition-colors z-20"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="relative z-10 flex flex-col items-center">
          <motion.div 
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative mb-3 bg-white/20 backdrop-blur-xl p-4 rounded-[24px] border border-white/40 shadow-xl mt-2"
          >
            <Bus className="w-10 h-10 text-white drop-shadow-md" />
            <motion.div 
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2 bg-white p-1.5 rounded-full border-[2px] border-[#F57C00] shadow-md"
            >
              <MapPin className="w-4 h-4 text-[#2E7D32]" />
            </motion.div>
          </motion.div>
          
          <h2 className="text-[24px] font-black text-white drop-shadow-md tracking-tight">
            {t('auth.forgot_password_title')}
          </h2>
          <p className="text-[#FFE0B2] text-[14px] font-medium mt-1 text-center px-4">
            {t('auth.forgot_password_subtitle')}
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 px-6 pt-12 relative z-10"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div variants={itemVariants}>
            <Input
              label={t('auth.email_label')}
              type="email"
              value={email}
              onChange={setEmail}
              icon={<Mail className="w-5 h-5" />}
              error={error}
              placeholder="votre@email.com"
            />
          </motion.div>

          <motion.div variants={itemVariants} className="pt-4">
            <Button type="submit" variant="primary" fullWidth loading={loading}>
              {t('auth.forgot_password_btn')}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};
