import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  Bell, 
  Heart, 
  Navigation, 
  Clock, 
  ChevronRight, 
  Bus, 
  TrendingUp,
  Map as MapIcon,
  Star,
  Settings,
  History,
  Menu,
  Rss,
  User
} from 'lucide-react';
import { BottomTabBar } from '../../components/BottomTabBar';
import { BusStopCard } from '../../components/BusStopCard';
import { BusStop, mockUserPosition, calculateDistance } from '../../data/mockData';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../data/api';
import { MapComponent } from '../../components/MapComponent';
import { useTranslation } from 'react-i18next';
import { getRoute } from '../../utils/routing';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
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

export const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [isLocating, setIsLocating] = useState(true);
  const [stops, setStops] = useState<BusStop[]>([]);
  const [liveBuses, setLiveBuses] = useState<any[]>([]);
  const [favoriteStops, setFavoriteStops] = useState<(BusStop & { distance: number })[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [selectedLine, setSelectedLine] = useState<any>(null);
  const [selectedStop, setSelectedStop] = useState<BusStop | null>(null);
  const [roadRoute, setRoadRoute] = useState<[number, number][] | undefined>(undefined);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('map') === 'true') {
      setShowMap(true);
      const lineId = params.get('lineId');
      if (lineId) {
        // Fetch line details if specified
        api.get(`/lines/${lineId}`).then(res => {
          setSelectedLine(res.data);
          return api.get(`/lines/${lineId}/stops`);
        }).then(res => {
          const lineStops = res.data.map((s: any) => ({
            id: s.id.toString(),
            name: s.nom,
            address: '',
            latitude: s.latitude,
            longitude: s.longitude,
            lines: []
          }));
          setStops(lineStops);
          
          // If viewing a line, set a path between stops
          if (lineStops.length > 1) {
            getRoute(lineStops.map((s: any) => [s.latitude, s.longitude] as [number, number]))
              .then(setRoadRoute)
              .catch(console.error);
          }
        }).catch(console.error);
      }

      const stopId = params.get('stopId');
      if (stopId) {
        api.get(`/stops/${stopId}`).then(res => {
          const s = res.data;
          const stopData = {
            id: s.id.toString(),
            name: s.nom,
            address: '',
            latitude: s.latitude,
            longitude: s.longitude,
            lines: Array.isArray(s.lignes) ? [...new Set(s.lignes.map((l: any) => typeof l === 'object' ? (l.numero || l.nom || String(l)) : String(l)))] : []
          };
          setSelectedStop(stopData);
        }).catch(console.error);
      }
    }
  }, [location]);

  const [userPosition, setUserPosition] = useState<{ latitude: number, longitude: number } | null>(null);
  const [lastFetchedPos, setLastFetchedPos] = useState<{ latitude: number, longitude: number } | null>(null);

  useEffect(() => {
    let watchId: number;

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      setUserPosition({ latitude, longitude });
      setIsLocating(false);
    };

    const handleError = (error: GeolocationPositionError) => {
      console.warn("Geolocation error:", error);
      // Fallback to mock position if we don't have any position yet
      setUserPosition(prev => prev || mockUserPosition);
      setIsLocating(false);
    };

    if ("geolocation" in navigator) {
      // Try to get current position immediately
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, { enableHighAccuracy: true, timeout: 5000 });
      
      // Then watch for changes
      watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
    } else {
      setUserPosition(mockUserPosition);
      setIsLocating(false);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  useEffect(() => {
    const fetchStops = async (lat: number, lng: number) => {
      try {
        const response = await api.get(`/stops/nearby?lat=${lat}&lng=${lng}&radius=2`);
        const data = response.data.map((s: any) => ({
          id: s.id.toString(),
          name: s.nom,
          address: '',
          latitude: s.latitude,
          longitude: s.longitude,
          lines: Array.isArray(s.lignes) ? [...new Set(s.lignes.map((l: any) => typeof l === 'object' ? (l.numero || l.nom || String(l)) : String(l)))] : []
        }));
        
        setStops(data);
        setLastFetchedPos({ latitude: lat, longitude: lng });
      } catch (e) {
        console.error("API Error fetching stops:", e);
      }
    };

    if (userPosition) {
      if (!lastFetchedPos) {
        fetchStops(userPosition.latitude, userPosition.longitude);
      } else {
        const dist = calculateDistance(
          userPosition.latitude, 
          userPosition.longitude, 
          lastFetchedPos.latitude, 
          lastFetchedPos.longitude
        );
        // Only re-fetch if moved > 200m
        if (dist > 200) {
          fetchStops(userPosition.latitude, userPosition.longitude);
        }
      }
    }
  }, [userPosition, lastFetchedPos]);

  useEffect(() => {
    const fetchFavoritesDetails = async () => {
       if (!user?.favorites?.length) {
         setFavoriteStops([]);
         return;
       }
       try {
          const response = await api.get('/favorites/');
          if (Array.isArray(response.data)) {
            const favData = response.data
              .filter((fav: any) => fav && fav.arret && fav.arret.id)
              .map((fav: any) => ({
                id: fav.arret.id.toString(),
                name: fav.arret.nom,
                address: '',
                latitude: fav.arret.latitude,
                longitude: fav.arret.longitude,
                lines: Array.isArray(fav.arret.lignes) ? [...new Set(fav.arret.lignes.map((l: any) => typeof l === 'object' ? (l.numero || l.nom || String(l)) : String(l)))] : [],
                distance: calculateDistance(userPosition?.latitude || mockUserPosition.latitude, userPosition?.longitude || mockUserPosition.longitude, fav.arret.latitude, fav.arret.longitude)
              }));
            setFavoriteStops(favData);
          }
       } catch (e) {
         console.error(e);
       }
    };
    if (user) {
       fetchFavoritesDetails();
    }
  }, [user]);

  useEffect(() => {
    const fetchLiveBuses = async () => {
      try {
        const response = await api.get('/live/all');
        const data = response.data;
        if (Array.isArray(data) && data.length > 0) {
          setLiveBuses(data);
        } else {
          // Mock simulation fallback if API returns empty
          setLiveBuses([
            { id: 'BUS-01', latitude: 5.3200 + Math.random()*0.01, longitude: -4.0200 + Math.random()*0.01, lineId: 1 },
            { id: 'BUS-05', latitude: 5.3300 + Math.random()*0.01, longitude: -4.0100 + Math.random()*0.01, lineId: 5 },
            { id: 'BUS-11', latitude: 5.3400 + Math.random()*0.01, longitude: -4.0500 + Math.random()*0.01, lineId: 3 },
            { id: 'BUS-22', latitude: 5.3600 + Math.random()*0.01, longitude: -3.9500 + Math.random()*0.01, lineId: 5 },
            { id: 'BUS-40', latitude: 5.3500 + Math.random()*0.01, longitude: -4.0200 + Math.random()*0.01, lineId: 7 },
            { id: 'BUS-81', latitude: 5.3500 + Math.random()*0.01, longitude: -3.8900 + Math.random()*0.01, lineId: 8 },
            { id: 'BUS-91', latitude: 5.4200 + Math.random()*0.01, longitude: -4.0200 + Math.random()*0.01, lineId: 14 },
            { id: 'BUS-50', latitude: 5.3200 + Math.random()*0.01, longitude: -4.0100 + Math.random()*0.01, lineId: 49 }
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch live buses', error);
        // Silent fallback to mock data
        setLiveBuses([
          { id: 'BUS-01', latitude: 5.3200 + Math.random()*0.01, longitude: -4.0200 + Math.random()*0.01, lineId: 1 },
          { id: 'BUS-05', latitude: 5.3300 + Math.random()*0.01, longitude: -4.0100 + Math.random()*0.01, lineId: 5 },
          { id: 'BUS-11', latitude: 5.3400 + Math.random()*0.01, longitude: -4.0500 + Math.random()*0.01, lineId: 3 },
          { id: 'BUS-22', latitude: 5.3600 + Math.random()*0.01, longitude: -3.9500 + Math.random()*0.01, lineId: 5 },
          { id: 'BUS-40', latitude: 5.3500 + Math.random()*0.01, longitude: -4.0200 + Math.random()*0.01, lineId: 7 },
          { id: 'BUS-81', latitude: 5.3500 + Math.random()*0.01, longitude: -3.8900 + Math.random()*0.01, lineId: 8 },
          { id: 'BUS-91', latitude: 5.4200 + Math.random()*0.01, longitude: -4.0200 + Math.random()*0.01, lineId: 14 },
          { id: 'BUS-50', latitude: 5.3200 + Math.random()*0.01, longitude: -4.0100 + Math.random()*0.01, lineId: 49 }
        ]);
      }
    };

    fetchLiveBuses();
    const interval = setInterval(fetchLiveBuses, 3000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (selectedStop && userPosition) {
      getRoute([[userPosition.latitude, userPosition.longitude], [selectedStop.latitude, selectedStop.longitude]], 'walking')
        .then(setRoadRoute);
    } else if (!selectedLine) {
      setRoadRoute(undefined);
    }
  }, [selectedStop, userPosition, selectedLine]);

  const stopsWithDistance = stops.map(stop => ({
    ...stop,
    distance: calculateDistance(
      userPosition?.latitude || mockUserPosition.latitude, 
      userPosition?.longitude || mockUserPosition.longitude, 
      stop.latitude, 
      stop.longitude
    )
  })).sort((a, b) => a.distance - b.distance);

  const veryNearbyStops = stopsWithDistance.filter(s => s.distance <= 500);
  const closeStops = stopsWithDistance.filter(s => s.distance > 500 && s.distance <= 1000);
  const optionalStops = stopsWithDistance.filter(s => s.distance > 1000 && s.distance <= 2000);

  if (showMap) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="size-full bg-card relative overflow-hidden flex flex-col"
      >
        <div className="absolute inset-0 z-0">
          <MapComponent 
            center={
              selectedStop 
                ? [selectedStop.latitude, selectedStop.longitude] 
                : (stops.length > 0 && selectedLine) 
                  ? [stops[0].latitude, stops[0].longitude] 
                  : [userPosition?.latitude || mockUserPosition.latitude, userPosition?.longitude || mockUserPosition.longitude]
            } 
            zoom={selectedStop ? 17 : (selectedLine ? 14 : 15)} 
            markers={[
              { position: [userPosition?.latitude || mockUserPosition.latitude, userPosition?.longitude || mockUserPosition.longitude], label: t('home.you_are_here'), isUser: true },
              ...stops.map(s => ({ 
                position: [s.latitude, s.longitude] as [number, number], 
                label: s.name,
                isStop: true 
              })),
              ...liveBuses.map(b => ({ position: [b.latitude, b.longitude] as [number, number], label: b.id, isBus: true }))
            ]}
            route={roadRoute}
          />
        </div>
        
        {selectedStop && (
          <div className="absolute top-[100px] left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-card/90 backdrop-blur-md shadow-xl px-4 py-2 rounded-2xl border border-[#2E7D32]/20 flex items-center gap-3"
            >
              <Navigation className="w-4 h-4 text-[#2E7D32] rotate-45 fill-[#2E7D32]" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#2E7D32] uppercase tracking-tighter leading-none">{t('stop_details.distance_title')}</span>
                <span className="text-[15px] font-bold text-[#1A1A1A] leading-tight">
                  {userPosition ? calculateDistance(userPosition.latitude, userPosition.longitude, selectedStop.latitude, selectedStop.longitude) : '...'} m
                </span>
              </div>
            </motion.div>
          </div>
        )}

        <div className="absolute top-8 left-5 right-5 z-10 flex items-center justify-between pointer-events-none">
          <button 
            onClick={() => setShowMap(false)}
            className="w-12 h-12 bg-card rounded-full flex items-center justify-center shadow-xl border border-border pointer-events-auto active:scale-90 transition-transform"
          >
            <ChevronRight className="w-6 h-6 text-[#424242] rotate-180" />
          </button>
          
          <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 pointer-events-auto">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </div>
            <span className="text-[12px] font-bold text-white tracking-widest">{t('home.live')}</span>
          </div>
        </div>
        


        <BottomTabBar />
      </motion.div>
    );
  }

  return (
    <div className="size-full bg-background flex flex-col relative overflow-hidden transition-colors duration-300">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 right-0 h-[290px] bg-gradient-to-br from-[#FF9800] via-[#F57C00] to-[#E65100] rounded-b-[48px] shadow-[0_16px_40px_rgba(245,124,0,0.2)] overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 20, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-white/10 rounded-full blur-[60px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            y: [0, 30, 0],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] left-[-10%] w-[200px] h-[200px] bg-[#FFE0B2]/20 rounded-full blur-[40px]" 
        />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] pointer-events-none opacity-40 mix-blend-overlay" />
      </div>
      
      <header className="px-6 pt-12 pb-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <motion.div 
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/user/profile')}
            className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white font-bold text-xl shadow-lg cursor-pointer overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <User className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <p className="text-[13px] text-white/80 font-medium">{t('home.welcome_back')}</p>
            <h1 className="text-[24px] font-black text-white leading-tight tracking-tight">
              {user?.name || t('home.guest')} 👋
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/user/notifications')}
            className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white relative active:scale-90 transition-transform"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#F57C00]" />
          </button>
        </div>
      </header>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 overflow-y-auto px-6 pb-[100px] space-y-7 relative z-10"
      >
        <motion.div variants={itemVariants} className="-mb-2">
          <p className="text-white/90 text-[18px] font-bold">{t('home.where_to')}</p>
        </motion.div>

        {/* Premium Search Bar */}
        <motion.div 
          variants={itemVariants}
          className="relative group mt-2"
          onClick={() => navigate('/user/search')}
        >
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none z-10">
            <Search className="w-5 h-5 text-[#F57C00]" />
          </div>
          <div className="w-full h-[64px] bg-card/95 backdrop-blur-xl border border-border rounded-[24px] pl-14 pr-4 flex items-center text-[15px] text-muted-foreground shadow-[0_12px_30px_rgba(245,124,0,0.12)] cursor-pointer hover:shadow-[0_16px_40px_rgba(245,124,0,0.18)] transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-card/50 to-transparent pointer-events-none" />
            <span className="relative z-10 font-medium">{t('home.search_placeholder')}</span>
          </div>
          <div className="absolute inset-y-0 right-4 flex items-center z-10">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FFB74D] to-[#F57C00] rounded-[16px] flex items-center justify-center shadow-md hover:opacity-90 transition-opacity">
              <MapIcon className="w-5 h-5 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Hero Card */}
        <motion.div
          variants={itemVariants}
          onClick={() => setShowMap(true)}
          className="relative h-[220px] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.08)] cursor-pointer group"
        >
          <motion.img 
            src="/images/premium_hero.png" 
            alt="Hero Bus" 
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ 
              scale: [1.1, 1.15, 1.1],
              rotate: [0, 0.5, 0]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 p-6 flex flex-col justify-between">
            {/* Badge removed */}
            <div className="mt-auto flex items-end justify-between">
              <div className="pb-1">
                <h2 className="text-white text-[26px] font-black leading-[1.1] mb-2 tracking-tight">
                  {t('home.live_tracking_title_1')}<br/>
                  <span className="text-[#FFB74D]">{t('home.live_tracking_title_highlight')}</span>
                </h2>
                <p className="text-white/80 text-[13px] font-medium leading-snug max-w-[200px]">
                  {liveBuses.length > 0 ? t('home.live_buses_count', { count: liveBuses.length }) : t('home.live_tracking_desc')}
                </p>
              </div>
              <motion.button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMap(true);
                }}
                animate={{ 
                  boxShadow: ["0 8px 20px rgba(46,125,50,0.4)", "0 12px 30px rgba(46,125,50,0.6)", "0 8px 20px rgba(46,125,50,0.4)"]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white h-[44px] px-5 rounded-[16px] font-black text-[14px] flex items-center gap-2 active:scale-95 transition-transform shadow-[0_8px_20px_rgba(46,125,50,0.4)] flex-shrink-0"
              >
                <Navigation className="w-4 h-4 fill-white" /> {t('home.start')}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Accès Rapide Section */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F57C00]/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#F57C00]" />
            </div>
            <h3 className="text-[19px] font-bold text-foreground tracking-tight">{t('home.quick_access')}</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: MapPin, label: t('home.stops'), sub: t('home.find_stop'), color: '#4CAF50', path: '/user/search?type=arret' },
              { icon: Clock, label: t('home.history'), sub: t('home.recent_trips'), color: '#673AB7', path: '/user/search?type=historique' }
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => navigate(item.path)}
                className="bg-card p-4 rounded-[24px] shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-border flex flex-col items-center text-center gap-3 active:scale-95 transition-transform"
              >
                <item.icon className="w-7 h-7" style={{ color: item.color }} />
                <div>
                  <h3 className="font-bold text-[14px] text-foreground mb-0.5">{item.label}</h3>
                  <p className="text-[10px] text-gray-500 font-medium leading-tight whitespace-pre-line">{item.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Favorites Section */}
        <AnimatePresence>
          {favoriteStops.length > 0 && (
            <motion.div 
              variants={itemVariants}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#F57C00] to-[#E65100] flex items-center justify-center shadow-md">
                    <Star className="w-4 h-4 text-white fill-white" />
                  </div>
                  <h3 className="text-[19px] font-bold text-foreground tracking-tight letter-spacing-tight">{t('home.favorites')}</h3>
                </div>
                <button 
                  onClick={() => navigate('/user/favorites')}
                  className="text-[#F57C00] text-[13px] font-extrabold hover:underline"
                >
                  {t('home.see_all')}
                </button>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar snap-x">
                {favoriteStops.map((stop) => (
                  <motion.div
                    key={stop.id}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate(`/user/stop/${stop.id}`)}
                    className="flex-shrink-0 w-[170px] bg-card p-5 rounded-[28px] border border-border shadow-[0_8px_24px_rgba(0,0,0,0.04)] active:shadow-md hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all relative overflow-hidden group snap-start cursor-pointer"
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#F57C00]/10 to-transparent rounded-bl-[40px] transition-transform group-hover:scale-110" />
                    <div className="w-11 h-11 rounded-2xl bg-[#F57C00]/10 flex items-center justify-center mb-4 relative z-10 group-hover:bg-[#F57C00] transition-colors duration-300">
                      <Bus className="w-6 h-6 text-[#F57C00] group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h4 className="text-[15px] font-bold text-[#F57C00] line-clamp-1 mb-1 relative z-10 group-hover:opacity-80 transition-all">{stop.name}</h4>
                    <p className="text-[10px] text-[#9E9E9E] font-bold uppercase tracking-wider relative z-10 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[#2E7D32]" />
                      {stop.distance} {t('home.distance')}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nearby Stops Section */}
        <motion.div variants={itemVariants} className="space-y-5 pb-10">
          <div 
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2E7D32]/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-[#2E7D32]" />
              </div>
              <h3 className="text-[19px] font-bold text-foreground tracking-tight">{t('home.nearby_stops_title')}</h3>
            </div>
          </div>

          <div className="space-y-8">
            {isLocating ? (
              <div className="flex flex-col items-center py-14 bg-card rounded-[36px] border-2 border-dashed border-border">
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                  }}
                  className="mb-5"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Navigation className="w-8 h-8 text-[#2E7D32]" />
                  </div>
                </motion.div>
                <p className="text-[15px] text-[#757575] font-bold">{t('home.locating')}</p>
                <p className="text-[12px] text-[#9E9E9E] mt-1">{t('home.please_wait')}</p>
              </div>
            ) : stopsWithDistance.length > 0 ? (
              <>
                {/* Très proches (Priorité) */}
                {veryNearbyStops.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <h4 className="text-[14px] font-black text-[#2E7D32] uppercase tracking-wider">{t('home.very_nearby_stops')}</h4>
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-[#2E7D32]/20 to-transparent" />
                      <span className="px-2 py-0.5 bg-[#2E7D32] text-white text-[10px] font-black rounded-full shadow-lg shadow-[#2E7D32]/20 animate-pulse">
                        {t('home.priority')}
                      </span>
                    </div>
                    {veryNearbyStops.map((stop, index) => (
                      <motion.div
                        key={stop.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                      >
                        <BusStopCard
                          stop={stop}
                          distance={stop.distance}
                          onClick={() => navigate(`/user/stop/${stop.id}`)}
                          onMapAction={(e) => {
                            e.stopPropagation();
                            setSelectedStop(stop);
                            setShowMap(true);
                          }}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Proches */}
                {closeStops.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <h4 className="text-[14px] font-black text-[#2E7D32] uppercase tracking-wider">{t('home.nearby_stops')}</h4>
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-[#2E7D32]/20 to-transparent" />
                    </div>
                    {closeStops.map((stop, index) => (
                      <motion.div
                        key={stop.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.05 }}
                      >
                        <BusStopCard
                          stop={stop}
                          distance={stop.distance}
                          onClick={() => navigate(`/user/stop/${stop.id}`)}
                          onMapAction={(e) => {
                            e.stopPropagation();
                            setSelectedStop(stop);
                            setShowMap(true);
                          }}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Options supplémentaires */}
                {optionalStops.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <h4 className="text-[14px] font-black text-[#2E7D32] uppercase tracking-wider">{t('home.optional_stops')}</h4>
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-[#2E7D32]/20 to-transparent" />
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar snap-x">
                      {optionalStops.map((stop, index) => (
                        <motion.div
                          key={stop.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + index * 0.05 }}
                          className="flex-shrink-0 w-[240px] snap-start"
                        >
                          <BusStopCard
                            stop={stop}
                            distance={stop.distance}
                            onClick={() => navigate(`/user/stop/${stop.id}`)}
                            onMapAction={(e) => {
                              e.stopPropagation();
                              setSelectedStop(stop);
                              setShowMap(true);
                            }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center py-10 bg-card rounded-[36px] border border-border text-center px-4">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                  <MapPin className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-[15px] text-[#757575] font-bold">{t('search.no_results')}</p>
                <p className="text-[12px] text-[#9E9E9E] mt-1">{t('home.find_stop')}</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      <BottomTabBar />
    </div>
  );
};
