import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search as SearchIcon, ChevronRight } from 'lucide-react';
import { Header } from '../../components/Header';
import { BottomTabBar } from '../../components/BottomTabBar';
import { BusStopCard } from '../../components/BusStopCard';
import { BusStop, mockUserPosition, calculateDistance, mockBusLines } from '../../data/mockData';
import { useNavigate, useLocation } from 'react-router';
import api from '../../data/api';
import { useTranslation } from 'react-i18next';

export const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState<string[]>(JSON.parse(localStorage.getItem('searchHistory') || '[]'));

  const addToHistory = (query: string) => {
    if (!query.trim()) return;
    const newHistory = [query, ...history.filter(h => h !== query)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  // Get search type from query params
  const queryParams = new URLSearchParams(location.search);
  const searchType = queryParams.get('type') || 'arret';

  const getPlaceholder = () => {
    switch (searchType) {
      case 'ligne': return t('search.placeholder_line');
      case 'numero': return t('search.placeholder_number');
      case 'historique': return t('search.placeholder_history');
      default: return t('search.placeholder_default');
    }
  };

  const getHelperText = () => {
    switch (searchType) {
      case 'ligne': return t('search.helper_line');
      case 'numero': return t('search.helper_number');
      case 'historique': return t('search.helper_history');
      default: return t('search.helper_default');
    }
  };

  const [filteredStops, setFilteredStops] = useState<(BusStop & { distance: number })[]>([]);
  const [lines, setLines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [currentUserPosition, setCurrentUserPosition] = useState(mockUserPosition);

  React.useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setCurrentUserPosition({ latitude, longitude });
      }, (error) => {
        console.warn("Geolocation error in Search:", error);
      });
    }
  }, []);

  React.useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchType === 'ligne' && !searchQuery.trim()) {
        // Fetch all lines if it's the "Voir toutes les lignes" case
        try {
          setIsLoading(true);
          const response = await api.get('/lines/');
          let linesData = [];
          
          if (Array.isArray(response.data)) {
            linesData = response.data;
          } else if (response.data && Array.isArray(response.data.content)) {
            linesData = response.data.content;
          }

          let sortedLines = [];
          if (linesData.length > 0) {
            sortedLines = linesData.sort((a: any, b: any) => 
              a.numero.localeCompare(b.numero, undefined, { numeric: true })
            );
          } else {
            // Fallback to mock data only if API returns nothing
            sortedLines = mockBusLines.map(l => ({
              id: l.id,
              numero: l.number,
              nom: l.name,
              couleur: l.color
            }));
          }
          setLines(sortedLines);
          setIsLoading(false);
        } catch (error) {
          console.error('Failed to fetch lines', error);
          // Fallback to mock data on error
          const fallbackLines = mockBusLines.map(l => ({
            id: l.id,
            numero: l.number,
            nom: l.name,
            couleur: l.color
          }));
          setLines(fallbackLines);
          setIsLoading(false);
        }
        return;
      }

      if (!searchQuery.trim()) {
        setFilteredStops([]);
        return;
      }
      try {
        addToHistory(searchQuery);
        const response = await api.get(`/stops/search?name=${searchQuery}`);
        // Handle both paginated and array responses for stops
        const stopsData = Array.isArray(response.data) 
          ? response.data 
          : (response.data?.content || []);

        const data = stopsData.map((s: any) => ({
          id: s.id?.toString() || Math.random().toString(),
          name: s.nom || 'Arrêt sans nom',
          address: s.adresse || '',
          latitude: !isNaN(Number(s.latitude)) ? Number(s.latitude) : mockUserPosition.latitude,
          longitude: !isNaN(Number(s.longitude)) ? Number(s.longitude) : mockUserPosition.longitude,
          lines: Array.isArray(s.lignes) 
            ? [...new Set(s.lignes.map((l: any) => typeof l === 'object' ? (l.numero || l.nom || String(l)) : String(l)))] 
            : [],
          distance: calculateDistance(
            currentUserPosition.latitude,
            currentUserPosition.longitude,
            Number(s.latitude) || mockUserPosition.latitude,
            Number(s.longitude) || mockUserPosition.longitude
          )
        })).sort((a: any, b: any) => a.distance - b.distance);
        setFilteredStops(data);
      } catch (error) {
        console.error('Failed to fetch search results', error);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchType, currentUserPosition]); // Added currentUserPosition to deps

  return (
    <div className="size-full bg-background flex flex-col overflow-hidden transition-colors duration-300">
      <Header title={searchType === 'ligne' ? t('admin.manage_lines') : t('search.title')} />

      <div className="flex-1 overflow-y-auto px-6 pt-5 pb-[100px]">
        {searchType !== 'historique' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5"
          >
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={getPlaceholder()}
                className="w-full h-[52px] rounded-[50px] px-5 pl-12 bg-input-background border border-border focus:border-[#F57C00] transition-all text-foreground"
                autoFocus
              />
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#F57C00]" />
            </div>
          </motion.div>
        )}

        {searchType === 'ligne' ? (
          <div className="grid grid-cols-2 gap-4">
            {isLoading ? (
              <div className="col-span-2 flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-[#F57C00] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : lines.filter(l => 
                  l.numero.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  l.nom.toLowerCase().includes(searchQuery.toLowerCase())
                ).length > 0 ? lines.filter(l => 
                  l.numero.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  l.nom.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((line, index) => (
              <motion.div
                key={line.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => navigate(`/user/home?map=true&lineId=${line.id}`)}
                className="bg-card rounded-[32px] p-6 shadow-[0_8px_25px_rgba(0,0,0,0.04)] border border-border flex flex-col items-center text-center gap-4 active:scale-95 transition-all cursor-pointer group"
              >
                <div 
                  className="w-16 h-16 rounded-[22px] flex items-center justify-center text-white font-black text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: line.couleur || '#F57C00' }}
                >
                  {line.numero}
                </div>
                <div>
                  <h3 className="font-extrabold text-[#F57C00] text-[15px] leading-tight line-clamp-1 h-[18px]">{line.nom}</h3>
                  <p className="text-[10px] text-[#2E7D32] font-bold mt-1">{line.type || 'Standard'}</p>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full group-hover:bg-[#F57C00]/10 transition-colors">
                    <span className="text-[10px] font-black text-muted-foreground group-hover:text-[#F57C00] uppercase tracking-wider">{t('stop_details.see_route')}</span>
                    <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-[#F57C00]" />
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-2 flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                  <SearchIcon className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="text-foreground font-bold">{t('search.no_lines_found')}</p>
                <p className="text-[13px] text-muted-foreground mt-1">{t('search.lines_will_appear')}</p>
              </div>
            )}
          </div>
        ) : searchQuery === '' ? (
          <div className="space-y-6">
            {history.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[16px] font-bold text-foreground">{t('search.recent_searches')}</h3>
                  <button 
                    onClick={() => {
                      setHistory([]);
                      localStorage.removeItem('searchHistory');
                    }}
                    className="text-muted-foreground text-[12px] font-medium"
                  >
                    {t('search.clear')}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {history.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => setSearchQuery(h)}
                      className="px-4 py-2 bg-muted border border-border rounded-[50px] text-[13px] text-foreground font-medium active:scale-95 transition-transform"
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-center py-10">
              <div className="text-center">
                <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-[14px]">
                  {getHelperText()}
                </p>
              </div>
            </div>
          </div>
        ) : filteredStops.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <SearchIcon className="w-16 h-16 text-[#9E9E9E] mx-auto mb-3" />
              </motion.div>
              <p className="text-foreground font-semibold mb-1">
                {t('search.no_results')}
              </p>
              <p className="text-muted-foreground text-[14px]">
                {t('search.try_another')}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredStops.map((stop, index) => (
              <motion.div
                key={stop.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <BusStopCard
                  stop={stop}
                  distance={stop.distance}
                  onClick={() => navigate(`/user/stop/${stop.id}`)}
                  onMapAction={(e) => {
                    e.stopPropagation();
                    navigate(`/user/home?map=true&stopId=${stop.id}`);
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BottomTabBar />
    </div>
  );
};
