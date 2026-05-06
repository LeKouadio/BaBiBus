import React from 'react';
import { motion } from 'motion/react';
import { Home, Search, Heart, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';

export const BottomTabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const tabs = [
    { id: 'home', label: t('bottom_tabs.home'), icon: Home, path: '/user/home' },
    { id: 'search', label: t('bottom_tabs.search'), icon: Search, path: '/user/search' },
    { id: 'favorites', label: t('bottom_tabs.favorites'), icon: Heart, path: '/user/favorites' },
    { id: 'profile', label: t('bottom_tabs.profile'), icon: User, path: '/user/profile' }
  ];

  return (
    <div className="absolute bottom-6 left-6 right-6 bg-card/80 backdrop-blur-xl border border-border shadow-[0_16px_40px_rgba(0,0,0,0.12)] rounded-[32px] h-[72px] flex items-center justify-around z-50 px-2 transition-colors duration-300">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.path || location.pathname.startsWith(`${tab.path}?`);

        return (
          <motion.button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className="relative flex flex-col items-center justify-center w-[60px] h-[60px] group"
            whileTap={{ scale: 0.9 }}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabBackground"
                className="absolute inset-0 bg-[#F57C00]/10 rounded-2xl"
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              />
            )}
            
            <motion.div
              animate={isActive ? { y: -2 } : { y: 0 }}
              transition={{ duration: 0.2 }}
              className="relative z-10"
            >
              <Icon
                className={`w-[22px] h-[22px] transition-colors duration-300 ${isActive ? 'text-[#F57C00] drop-shadow-md' : 'text-[#9E9E9E] group-hover:text-[#F57C00]/60'}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </motion.div>

            <span
              className={`text-[10px] font-bold mt-1 transition-all duration-300 relative z-10 ${isActive ? 'text-[#F57C00] opacity-100' : 'text-[#9E9E9E] opacity-0 group-hover:opacity-100 absolute -bottom-4'}`}
            >
              {tab.label}
            </span>

            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute -top-[6px] w-8 h-1 bg-[#F57C00] rounded-b-lg"
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};
