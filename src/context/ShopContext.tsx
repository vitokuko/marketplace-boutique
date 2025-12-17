import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const { shopSlug } = useParams<{ shopSlug?: string }>();
  const navigate = useNavigate();
  const [boutique, setBoutique] = useState<Boutique | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBoutique = async () => {
      if (!shopSlug) {
        setBoutique(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await getBoutiqueBySlug(shopSlug);
        setBoutique(data);
      } catch (err) {
        console.error('Erreur lors du chargement de la boutique:', err);
        setError('Boutique introuvable');
        // Rediriger vers marketplace global après 2s
        setTimeout(() => navigate('/'), 2000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoutique();
  }, [shopSlug, navigate]);

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
