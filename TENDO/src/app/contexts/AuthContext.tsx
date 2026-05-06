import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../data/mockData';
import api from '../data/api';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, phone: string) => Promise<User>;
  logout: () => void;
  updateProfile: (name: string, email: string, phone: string) => Promise<void>;
  addFavorite: (stopId: string) => void;
  removeFavorite: (stopId: string) => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('babibus_jwt');
      if (token) {
        try {
          const response = await api.get('/users/me');
          const userData = response.data;
          
          if (!userData) throw new Error('No user data received');

          // Fetch favorites
          let favorites: string[] = [];
          try {
            const favResponse = await api.get('/favorites/');
            if (Array.isArray(favResponse.data)) {
              favorites = favResponse.data
                .filter((fav: any) => fav && fav.arret && fav.arret.id)
                .map((fav: any) => fav.arret.id.toString());
            }
          } catch (e) {
            console.error("Failed to fetch favorites", e);
          }

          setUser({
            id: userData.id?.toString() || '',
            name: userData.nom || 'Utilisateur',
            email: userData.email || '',
            role: (userData.role?.toLowerCase() as 'user' | 'admin') || 'user',
            phone: userData.telephone || '',
            favorites: favorites
          });
        } catch (error) {
          console.error('Failed to load user', error);
          localStorage.removeItem('babibus_jwt');
        }
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const response = await api.post('/auth/login', { email, motDePasse: password });
    const { token } = response.data;
    
    if (!token) throw new Error('No token received');
    localStorage.setItem('babibus_jwt', token);
    
    // Fetch user details
    const userResponse = await api.get('/users/me');
    const userData = userResponse.data;

    if (!userData) throw new Error('Failed to fetch user details after login');

    let favorites: string[] = [];
    try {
      const favResponse = await api.get('/favorites/');
      if (Array.isArray(favResponse.data)) {
        favorites = favResponse.data
          .filter((fav: any) => fav && fav.arret && fav.arret.id)
          .map((fav: any) => fav.arret.id.toString());
      }
    } catch (e) {
      console.error("Failed to fetch favorites", e);
    }

    const user = {
      id: userData.id?.toString() || '',
      name: userData.nom || 'Utilisateur',
      email: userData.email || '',
      role: (userData.role?.toLowerCase() as 'user' | 'admin') || 'user',
      phone: userData.telephone || '',
      favorites: favorites
    };

    setUser(user);
    return user;
  };

  const register = async (name: string, email: string, password: string, phone: string): Promise<User> => {
    const response = await api.post('/auth/register', { 
      nom: name, 
      email, 
      motDePasse: password,
      telephone: phone
    });
    
    const { token } = response.data;
    localStorage.setItem('babibus_jwt', token);
    
    // Fetch user details
    const userResponse = await api.get('/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const userData = userResponse.data;

    if (!userData) throw new Error('Failed to fetch user details after register');

    const user = {
      id: userData.id?.toString() || '',
      name: userData.nom || 'Utilisateur',
      email: userData.email || '',
      role: (userData.role?.toLowerCase() as 'user' | 'admin') || 'user',
      phone: userData.telephone || '',
      favorites: []
    };

    setUser(user);
    return user;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('babibus_jwt');
  };

  const updateProfile = async (name: string, email: string, phone: string) => {
    if (!user) return;

    await api.put('/users/me', { nom: name, email, telephone: phone });

    const updatedUser = { ...user, name, email, phone };
    setUser(updatedUser);
  };

  const addFavorite = async (stopId: string) => {
    if (!user) return;

    try {
      await api.post(`/favorites/`, { arretId: Number(stopId), alias: 'Favori' });
      
      // Re-fetch favorites from server to ensure we have the correct IDs (especially for deletion later)
      const favResponse = await api.get('/favorites/');
      const favorites = favResponse.data.map((fav: any) => fav.arret.id.toString());
      
      setUser({ ...user, favorites: favorites });
    } catch (error) {
      console.error('Failed to add favorite', error);
      toast.error("Erreur lors de l'ajout aux favoris");
    }
  };

  const removeFavorite = async (stopId: string) => {
    if (!user) return;

    try {
      // Find the favorite entry by stopId to get its internal favorite ID
      const favResponse = await api.get('/favorites/');
      const favorite = favResponse.data.find((fav: any) => fav.arret.id.toString() === stopId);
      
      if (favorite) {
        await api.delete(`/favorites/${favorite.id}`);
        const updatedFavorites = user.favorites.filter(id => id !== stopId);
        setUser({ ...user, favorites: updatedFavorites });
      }
    } catch (error) {
      console.error('Failed to remove favorite', error);
      toast.error("Erreur lors de la suppression du favori");
    }
  };

  const forgotPassword = async (email: string) => {
    await api.post('/auth/forgot-password', { email });
  };

  const resetPassword = async (token: string, password: string) => {
    await api.post('/auth/reset-password', { token, newPassword: password });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, addFavorite, removeFavorite, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
