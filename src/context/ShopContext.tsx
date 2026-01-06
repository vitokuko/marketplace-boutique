import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getBoutiqueBySlug } from '../services/boutiqueService';
import type { Boutique } from '../services/boutiqueService';

interface ShopContextType {
  boutique: Boutique | null;
  boutiqueId: number | null;
  isLoading: boolean;
  error: string | null;
}

const ShopContext = createContext<ShopContextType>({
  boutique: null,
  boutiqueId: null,
  isLoading: false,
  error: null
});

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [boutique, setBoutique] = useState<Boutique | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extraire le slug manuellement depuis le pathname
  const pathname = location.pathname;
  const shopSlug = pathname.split('/')[1] || undefined;

  // Ignorer les routes système
  const isSystemRoute = shopSlug === 'products' || shopSlug === '';

  // Debug logging
  console.log('🔍 ShopContext - pathname:', pathname);
  console.log('🔍 ShopContext - extracted shopSlug:', shopSlug);
  console.log('🔍 ShopContext - isSystemRoute:', isSystemRoute);
  console.log('🔍 ShopContext - Current URL:', window.location.href);

  useEffect(() => {
    console.log('🔄 ShopContext useEffect triggered with shopSlug:', shopSlug);
    console.log('🔄 ShopContext useEffect - isSystemRoute:', isSystemRoute);

    const fetchBoutique = async () => {
      // Si c'est une route système ou pas de slug, ne pas charger de boutique
      if (!shopSlug || isSystemRoute) {
        console.log('⚠️ ShopContext - No shopSlug or system route, clearing boutique');
        setBoutique(null);
        return;
      }

      console.log('📡 ShopContext - Fetching boutique for slug:', shopSlug);
      setIsLoading(true);
      setError(null);

      try {
        const data = await getBoutiqueBySlug(shopSlug);
        console.log('✅ ShopContext - Boutique loaded:', data);
        setBoutique(data);
      } catch (err) {
        console.error('❌ ShopContext - Error loading boutique:', err);
        setError('Boutique introuvable');
        // Rediriger vers marketplace global après 2s
        setTimeout(() => navigate('/'), 2000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoutique();
  }, [shopSlug, isSystemRoute, navigate]);

  return (
    <ShopContext.Provider
      value={{
        boutique,
        boutiqueId: boutique?.id || null,
        isLoading,
        error
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);
