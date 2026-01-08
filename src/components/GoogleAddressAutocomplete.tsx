import React, { useEffect, useRef } from 'react';

// Déclaration globale pour Google Maps
declare global {
  interface Window {
    google: any;
  }
}

interface GoogleAddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

const GoogleAddressAutocomplete: React.FC<GoogleAddressAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Entrez votre adresse complète",
  className = ""
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const autocompleteRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ne charger Google Maps que si la clé API est valide
  const shouldLoadMaps = apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE';

  useEffect(() => {
    if (!shouldLoadMaps) return;

    // Charger le script Google Maps avec le nouveau Extended Component Library
    const loadGoogleMapsScript = () => {
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        initAutocomplete();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&v=weekly`;
      script.async = true;
      script.defer = true;
      script.onload = () => initAutocomplete();
      document.head.appendChild(script);
    };

    const initAutocomplete = async () => {
      if (!inputRef.current) return;

      try {
        // Utiliser la nouvelle API PlaceAutocompleteElement (recommandée par Google)
        const { PlaceAutocompleteElement } = await window.google.maps.importLibrary("places") as any;

        const autocomplete = new PlaceAutocompleteElement({
          componentRestrictions: { country: "sn" },
        });

        autocomplete.addEventListener('gmp-placeselect', async ({ place }: any) => {
          await place.fetchFields({ fields: ['formattedAddress'] });
          if (place.formattedAddress) {
            onChange(place.formattedAddress);
          }
        });

        // Remplacer l'input par le composant autocomplete
        if (inputRef.current.parentNode) {
          autocomplete.className = className;
          autocomplete.placeholder = placeholder;
          inputRef.current.parentNode.replaceChild(autocomplete, inputRef.current);
          autocompleteRef.current = autocomplete;
        }
      } catch (error) {
        console.error('Erreur initialisation Google Maps:', error);
      }
    };

    loadGoogleMapsScript();

    return () => {
      if (autocompleteRef.current) {
        autocompleteRef.current.remove();
      }
    };
  }, [shouldLoadMaps, apiKey, className, placeholder, onChange]);

  // Fallback: input simple si pas de clé API
  if (!shouldLoadMaps) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className}
        placeholder={placeholder}
      />
    );
  }

  // Input initial qui sera remplacé par PlaceAutocompleteElement
  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      placeholder={placeholder}
    />
  );
};

export default GoogleAddressAutocomplete;
