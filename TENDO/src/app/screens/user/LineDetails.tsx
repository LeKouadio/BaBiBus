import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router';
import { Header } from '../../components/Header';
import { Bus, MapPin, ChevronRight, Info } from 'lucide-react';
import api from '../../data/api';
import { useTranslation } from 'react-i18next';

export const LineDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [line, setLine] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lineRes = await api.get(`/lines/${id}`);
        setLine(lineRes.data);
        
        const stopsRes = await api.get(`/lines/${id}/stops`);
        setStops(stopsRes.data);
      } catch (error) {
        console.error('Failed to fetch line details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="size-full bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#F57C00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!line) {
    return (
      <div className="size-full bg-background flex flex-col">
        <Header title={t('line_details.not_found')} showBack />
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <Info className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">{t('line_details.not_found_desc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="size-full bg-background flex flex-col overflow-hidden transition-colors duration-300">
      <Header title={`${t('stop_details.line')} ${line.numero}`} showBack />

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-[34px]">
        {/* Line Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-[32px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-border mb-8"
        >
          <div className="flex items-center gap-5 mb-6">
            <div 
              className="w-16 h-16 rounded-[22px] flex items-center justify-center text-white font-black text-2xl shadow-lg"
              style={{ backgroundColor: line.couleur || '#F57C00' }}
            >
              {line.numero}
            </div>
            <div>
              <h2 className="text-[20px] font-black text-[#1A1A1A] leading-tight">{line.nom}</h2>
              <p className="text-[13px] text-[#757575] font-medium mt-1">{t('line_details.full_itinerary')}</p>
            </div>
          </div>

          <div className="flex items-center justify-between py-4 border-t border-gray-50">
            <div className="text-center flex-1">
              <p className="text-[11px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">{t('home.stops')}</p>
              <p className="text-[18px] font-black text-[#1A1A1A]">{stops.length}</p>
            </div>
            <div className="w-px h-8 bg-muted" />
            <div className="text-center flex-1">
              <p className="text-[11px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">{t('line_details.status')}</p>
              <p className="text-[14px] font-bold text-[#2E7D32]">{t('line_details.in_service')}</p>
            </div>
          </div>
        </motion.div>

        {/* Stops List */}
        <div className="space-y-0 relative">
          <div className="absolute left-[27px] top-4 bottom-4 w-[3px] bg-gradient-to-b from-[#F57C00] to-[#F57C00]/20 rounded-full" />
          
          <h3 className="text-[16px] font-black text-foreground mb-6 px-2 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#F57C00]" />
            {t('line_details.stops_list')}
          </h3>

          {stops.map((stop, index) => (
            <motion.div
              key={stop.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/user/stop/${stop.id}`)}
              className="relative pl-14 pb-8 last:pb-0 group cursor-pointer"
            >
              <div className="absolute left-[21px] top-1 w-[15px] h-[15px] rounded-full bg-background border-[3px] border-[#F57C00] z-10 group-active:scale-125 transition-transform" />
              
              <div className="bg-card rounded-[24px] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-border flex items-center justify-between group-active:bg-muted transition-colors">
                <div>
                  <p className="font-bold text-foreground text-[15px]">{stop.nom}</p>
                  <p className="text-[12px] text-muted-foreground font-medium">{t('line_details.bus_stop')}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#E0E0E0] group-hover:text-[#F57C00] transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
