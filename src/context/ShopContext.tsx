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
  const [lockedSlug, setLockedSlug] = useState<string | null>(null);

  // Extraire le slug manuellement depuis le pathname
  const pathname = location.pathname;
  const shopSlug = pathname.split('/')[1] || undefined;

  // Ignorer les routes système
  const isSystemRoute = shopSlug === 'products' || shopSlug === '';

  // Vérifier si l'utilisateur essaie de changer de boutique
  useEffect(() => {
    // Si un slug est verrouillé et que l'utilisateur essaie d'accéder à un autre slug
    if (lockedSlug && shopSlug && !isSystemRoute && shopSlug !== lockedSlug) {
      // Rediriger vers la boutique verrouillée
      navigate(`/${lockedSlug}`, { replace: true });
    }
  }, [shopSlug, lockedSlug, isSystemRoute, navigate]);

  useEffect(() => {
    const fetchBoutique = async () => {
      // Si c'est une route système ou pas de slug, ne pas charger de boutique
      if (!shopSlug || isSystemRoute) {
        setBoutique(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await getBoutiqueBySlug(shopSlug);
        setBoutique(data);

        // Verrouiller le slug une fois la boutique chargée avec succès
        if (!lockedSlug) {
          setLockedSlug(shopSlug);
        }
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
  }, [shopSlug, isSystemRoute, lockedSlug, navigate]);

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
