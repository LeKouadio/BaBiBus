import React from 'react';
import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router';
import { MapPin, Clock, Heart, Navigation, Map as MapIcon } from 'lucide-react';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { BusStop, mockUserPosition, calculateDistance } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import api from '../../data/api';
import { useTranslation } from 'react-i18next';
import { MapComponent } from '../../components/MapComponent';
import { getRoute } from '../../utils/routing';

export const StopDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, addFavorite, removeFavorite } = useAuth();
  const { t } = useTranslation();
  
  const [stop, setStop] = React.useState<BusStop | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [roadRoute, setRoadRoute] = React.useState<[number, number][] | undefined>(undefined);
  const [currentUserPosition, setCurrentUserPosition] = React.useState(mockUserPosition);

  React.useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setCurrentUserPosition({ latitude, longitude });
      }, (error) => {
        console.warn("Geolocation error in StopDetails:", error);
      });
    }
  }, []);

  React.useEffect(() => {
    const fetchStop = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/stops/${id}`);
        const s = response.data;
        
        if (!s) {
          console.error('No stop data found for ID:', id);
          setStop(null);
          return;
        }

        const stopData = {
          id: s.id?.toString() || id || '',
          name: s.nom || 'Arrêt sans nom',
          address: s.adresse || '',
          latitude: !isNaN(Number(s.latitude)) ? Number(s.latitude) : mockUserPosition.latitude,
          longitude: !isNaN(Number(s.longitude)) ? Number(s.longitude) : mockUserPosition.longitude,
          lines: Array.isArray(s.lignes) 
            ? [...new Set(s.lignes.map((l: any) => typeof l === 'object' ? (l.numero || l.nom || String(l)) : String(l)))] 
            : []
        };
        setStop(stopData);
      } catch (error) {
        console.error('Failed to fetch stop', error);
        setStop(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStop();
  }, [id]);

  React.useEffect(() => {
    if (stop && currentUserPosition) {
      getRoute([[currentUserPosition.latitude, currentUserPosition.longitude], [stop.latitude, stop.longitude]], 'walking')
        .then(setRoadRoute);
    }
  }, [stop, currentUserPosition]);

  if (loading) {
    return (
      <div className="size-full bg-background flex items-center justify-center">
        <p>{t('stop_details.loading')}</p>
      </div>
    );
  }

  if (!stop) {
    return (
      <div className="size-full bg-background flex items-center justify-center">
        <p>{t('stop_details.not_found')}</p>
      </div>
    );
  }

  const distance = calculateDistance(
    currentUserPosition.latitude,
    currentUserPosition.longitude,
    stop.latitude,
    stop.longitude
  );

  const isFavorite = user?.favorites?.includes(stop.id) || false;

  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFavorite(stop.id);
      toast.success(t('stop_details.removed_success'));
    } else {
      addFavorite(stop.id);
      toast.success(t('stop_details.added_success'));
    }
  };

  return (
    <div className="size-full bg-background flex flex-col overflow-hidden transition-colors duration-300">
      <Header title={stop.name} showBack />

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-[34px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="h-[200px] bg-card rounded-[32px] mb-6 relative overflow-hidden shadow-inner border border-border"
        >
          <MapComponent 
            center={[stop.latitude, stop.longitude]} 
            zoom={16} 
            markers={[
              { position: [stop.latitude, stop.longitude], label: stop.name },
              { position: [currentUserPosition.latitude, currentUserPosition.longitude], label: t('home.you_are_here'), isUser: true }
            ]}
            route={roadRoute}
          />
          
          <div className="absolute top-4 left-4 z-10 pointer-events-none">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-white/90 backdrop-blur-md shadow-lg px-3 py-1.5 rounded-xl border border-[#2E7D32]/10 flex items-center gap-2"
            >
              <Navigation className="w-3.5 h-3.5 text-[#2E7D32] rotate-45 fill-[#2E7D32]" />
              <span className="text-[13px] font-black text-foreground">{distance} m</span>
            </motion.div>
          </div>

          {stop.lines && stop.lines.length > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="absolute bottom-4 right-4 w-12 h-12 bg-gradient-to-br from-[#F57C00] to-[#E65100] rounded-2xl flex items-center justify-center shadow-lg z-10 border-2 border-white"
            >
              <span className="text-white font-bold text-lg">{stop.lines[0]}</span>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-[20px] border border-border p-5 mb-4"
        >
          <p className="text-[11px] font-bold text-[#2E7D32] uppercase tracking-[0.1em] mb-4 opacity-80">
            {t('stop_details.bus_lines')}
          </p>

          <div className="flex flex-wrap gap-2">
            {stop.lines && stop.lines.length > 0 ? stop.lines.map((line) => (
              <span
                key={line}
                className="px-4 py-2 bg-[#F57C00] text-white font-semibold rounded-[50px]"
              >
                {t('stop_details.line')} <span className="font-bold">{line}</span>
              </span>
            )) : (
              <span className="text-gray-400 text-sm italic">Aucune ligne desservie</span>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-[20px] border border-border p-5 mb-6"
        >
          <p className="text-[11px] font-bold text-[#2E7D32] uppercase tracking-[0.1em] mb-4 opacity-80">
            {t('stop_details.distance_title')}
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#2E7D32]" />
              <span className="text-foreground font-medium">{distance} m {t('stop_details.distance_from_you')}</span>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#F57C00]" />
              <span className="text-[#1A1A1A] font-medium">
                ~{Math.round(distance / 80)} {t('stop_details.walk_min')}
              </span>
            </div>

            <span className="inline-block px-3 py-1 bg-[#E8F5E9] text-[#2E7D32] text-[12px] font-medium rounded-[50px]">
              {t('stop_details.away_min', { min: Math.round(distance / 80) })}
            </span>
          </div>
        </motion.div>

        <div className="space-y-3">
          <Button
            variant="primary"
            fullWidth
            icon={<MapIcon />}
            onClick={() => navigate(`/user/home?map=true&stopId=${stop.id}`)}
          >
            {t('stop_details.see_route_map')}
          </Button>

          <Button
            variant="outline"
            fullWidth
            icon={<Navigation />}
            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=${currentUserPosition.latitude},${currentUserPosition.longitude}&destination=${stop.latitude},${stop.longitude}&travelmode=walking`, '_blank')}
          >
            {t('stop_details.see_route_google_map')}
          </Button>

          <Button
            variant={isFavorite ? 'outline-orange' : 'outline-orange'}
            fullWidth
            icon={<Heart className={isFavorite ? 'fill-current' : ''} />}
            onClick={handleToggleFavorite}
          >
            {isFavorite ? t('stop_details.remove_favorite') : t('stop_details.add_favorite')}
          </Button>
        </div>
      </div>
    </div>
  );
};
