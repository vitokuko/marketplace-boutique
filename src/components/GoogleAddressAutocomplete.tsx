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
  onAddressSelected?: () => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

const GoogleAddressAutocomplete: React.FC<GoogleAddressAutocompleteProps> = ({
  value,
  onChange,
  onAddressSelected,
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
            // Déclencher le callback pour calculer le prix
            setTimeout(() => {
              if (onAddressSelected) {
                onAddressSelected();
              }
              // Déclencher aussi l'événement blur comme fallback
              const event = new Event('blur', { bubbles: true });
              autocomplete.dispatchEvent(event);
            }, 100);
          }
        });

        // Appliquer les styles directement au web component
        autocomplete.style.width = '100%';

        // Remplacer l'input par le composant autocomplete
        if (inputRef.current.parentNode) {
          inputRef.current.parentNode.replaceChild(autocomplete, inputRef.current);
          autocompleteRef.current = autocomplete;

          // Appliquer les styles via les propriétés CSS personnalisées de Google Maps
          // et les styles globaux pour cibler le shadow DOM
          if (!document.querySelector('#gmp-autocomplete-styles')) {
            const style = document.createElement('style');
            style.id = 'gmp-autocomplete-styles';
            style.textContent = `
              gmp-place-autocomplete {
                width: 100%;
                display: block;
              }

              /* Styles pour l'input dans le shadow DOM */
              gmp-place-autocomplete::part(input) {
                width: 100%;
                padding: 0.5rem 0.75rem;
                border: 1px solid #d1d5db;
                border-radius: 0.5rem;
                font-size: 1rem;
                line-height: 1.5rem;
                color: #1f2937;
                background-color: white;
                outline: none;
              }

              gmp-place-autocomplete::part(input):focus {
                border-color: #3b82f6;
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
              }

              /* Fallback pour navigateurs qui ne supportent pas ::part() */
              gmp-place-autocomplete input {
                width: 100% !important;
                padding: 0.5rem 0.75rem !important;
                border: 1px solid #d1d5db !important;
                border-radius: 0.5rem !important;
                font-size: 1rem !important;
                line-height: 1.5rem !important;
                color: #1f2937 !important;
                background-color: white !important;
                outline: none !important;
                box-sizing: border-box !important;
              }

              gmp-place-autocomplete input:focus {
                border-color: #3b82f6 !important;
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5) !important;
              }
            `;
            document.head.appendChild(style);
          }
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
