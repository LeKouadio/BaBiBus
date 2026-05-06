import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Bus, MapPin, ArrowRight, UserPlus, Navigation, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Welcome = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="size-full bg-background flex flex-col overflow-hidden relative transition-colors duration-300">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FFB74D]/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#F57C00]/10 rounded-full blur-[60px] translate-y-1/4 -translate-x-1/4 pointer-events-none" />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
        className="relative bg-gradient-to-br from-[#FF9800] via-[#F57C00] to-[#E65100] h-[45%] rounded-b-[48px] flex items-center justify-center shadow-[0_20px_50px_rgba(245,124,0,0.2)] overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] pointer-events-none opacity-30 mix-blend-overlay" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-10 -left-10 w-32 h-32 bg-white/20 rounded-full blur-2xl" />

        <div className="flex flex-col items-center relative z-10 mt-16">
          <motion.div 
            animate={{ y: [-6, 6, -6] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative mb-5 bg-white/20 backdrop-blur-xl p-6 rounded-[32px] border border-white/40 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-[32px] pointer-events-none" />
            <Bus className="w-20 h-20 text-white drop-shadow-xl" />
            <motion.div 
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-3 -right-3 bg-white p-2 rounded-full border-[3px] border-[#F57C00] shadow-lg"
            >
              <MapPin className="w-5 h-5 text-[#2E7D32]" />
            </motion.div>
          </motion.div>
          <h1 className="text-[42px] font-black tracking-tighter drop-shadow-lg">
            <span className="text-white">BaBi</span>
            <span className="text-[#FFE0B2]">BUS</span>
          </h1>
        </div>
      </motion.div>

      {/* Features Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex-1 px-7 flex flex-col pt-0 -mt-8"
      >
        <div className="text-center mb-auto pt-8">
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[28px] font-black text-foreground mb-3 leading-[1.1] tracking-tight"
          >
            {t('welcome.title_1')}<br/>{t('welcome.title_2')} <span className="text-[#F57C00]">{t('welcome.title_highlight')}</span>
          </motion.h2>
        </div>

        {/* Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full space-y-3 mb-10"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/login?role=user')}
            className="w-full h-14 bg-gradient-to-r from-[#FF9800] via-[#F57C00] to-[#E65100] text-white rounded-2xl font-bold text-[17px] flex items-center justify-center gap-2 shadow-[0_12px_28px_rgba(245,124,0,0.3)] relative overflow-hidden group border border-[#FFB74D]/30"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10 flex items-center gap-2 drop-shadow-sm">
              <Navigation className="w-5 h-5" />
              {t('welcome.login_user')} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/login?role=admin')}
            className="w-full h-14 bg-card text-[#E65100] border-2 border-[#E65100]/20 rounded-2xl font-bold text-[17px] flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:bg-[#E65100]/5 transition-colors"
          >
            <ShieldCheck className="w-5 h-5" />
            {t('welcome.login_admin')}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/register')}
            className="w-full h-12 text-muted-foreground font-semibold text-[15px] flex items-center justify-center gap-2 hover:text-[#F57C00] transition-colors pt-2"
          >
            <UserPlus className="w-4 h-4" />
            {t('welcome.register')}
          </motion.button>
        </motion.div>

        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4" />
      </motion.div>
    </div>
  );
};
