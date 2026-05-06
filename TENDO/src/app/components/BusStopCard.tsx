import React from 'react';
import { motion } from 'motion/react';
import { Bus, MapPin, ChevronRight, Heart } from 'lucide-react';
import { BusStop } from '../data/mockData';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface BusStopCardProps {
  stop: BusStop;
  distance?: number;
  onClick?: () => void;
  onMapAction?: (e: React.MouseEvent) => void;
}

export const BusStopCard = ({ stop, distance, onClick, onMapAction }: BusStopCardProps) => {
  const { t } = useTranslation();
  const { user, addFavorite, removeFavorite } = useAuth();
  
  const isFavorite = user?.favorites?.includes(stop.id.toString()) || false;
  return (
    <motion.div
      onClick={onClick}
      className="bg-card rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-border cursor-pointer relative overflow-hidden group transition-colors duration-300"
      whileHover={{ y: -4, shadow: "0 12px 40px rgba(0,0,0,0.08)" }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#F57C00]/5 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
      
      <div className="flex items-start gap-4 relative z-10">
        <div className="flex flex-col items-center gap-3 flex-shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-[#F57C00]/10 flex items-center justify-center group-hover:bg-[#F57C00] transition-colors duration-300">
            <Bus className="w-6 h-6 text-[#F57C00] group-hover:text-white transition-colors duration-300" />
          </div>
          
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={async (e) => {
              e.stopPropagation();
              if (!user) {
                toast.error(t('auth.login_required') || "Please login");
                return;
              }
              
              try {
                if (isFavorite) {
                  await removeFavorite(stop.id.toString());
                  toast.success(`${stop.name} ${t('favorites.removed')}`);
                } else {
                  await addFavorite(stop.id.toString());
                  toast.success(`${stop.name} ${t('stop_details.added_success')}`);
                }
              } catch (error) {
                toast.error(t('common.error_occurred'));
              }
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isFavorite 
                ? 'bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20' 
                : 'bg-muted text-muted-foreground border border-border'
            } shadow-sm hover:scale-110`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </motion.button>
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <h3 className="font-bold text-[#F57C00] text-[16px] mb-2 truncate group-hover:opacity-80 transition-all duration-300">{stop.name}</h3>

          <div className="flex flex-wrap gap-2 mb-3">
            {stop.lines.map((line) => (
              <span
                key={line}
                className="px-3 py-1 bg-muted text-foreground text-[12px] font-bold rounded-xl border border-border"
              >
                {t('stop_details.line')} {line}
              </span>
            ))}
          </div>

          {distance !== undefined && (
            <div className="flex items-center gap-1 text-[#2E7D32] mb-4">
              <MapPin className="w-4 h-4" />
              <span className="text-[13px] font-bold">
                {distance} {t('bus_card.distance_m')}
              </span>
            </div>
          )}

          {onMapAction && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onMapAction}
              className="w-full py-2.5 bg-[#2E7D32] text-white rounded-[16px] text-[13px] font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#2E7D32]/20 transition-all border border-[#1B5E20]"
            >
              <Bus className="w-4 h-4" />
              {t('stop_details.see_route_map')}
            </motion.button>
          )}
        </div>
        
      </div>
    </motion.div>
  );
};
