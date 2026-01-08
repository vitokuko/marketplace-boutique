import React, { useEffect, useRef, useState } from 'react';

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

interface Prediction {
  description: string;
  place_id: string;
}

const GoogleAddressAutocomplete: React.FC<GoogleAddressAutocompleteProps> = ({
  value,
  onChange,
  onAddressSelected,
  placeholder = "Entrez votre adresse complète",
  className = ""
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const autocompleteService = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  // Ne charger Google Maps que si la clé API est valide
  const shouldLoadMaps = apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE';

  useEffect(() => {
    if (!shouldLoadMaps) return;

    // Charger le script Google Maps
    const loadGoogleMapsScript = () => {
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        initAutocomplete();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`;
      script.async = true;
      script.defer = true;
      script.onload = () => initAutocomplete();
      document.head.appendChild(script);
    };

    const initAutocomplete = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
      }
    };

    loadGoogleMapsScript();
  }, [shouldLoadMaps, apiKey]);

  // Gérer les clics en dehors pour fermer le dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (!shouldLoadMaps || !autocompleteService.current) {
      return;
    }

    if (newValue.trim().length < 3) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    // Récupérer les prédictions
    autocompleteService.current.getPlacePredictions(
      {
        input: newValue,
        componentRestrictions: { country: 'sn' },
      },
      (results: Prediction[] | null, status: string) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results);
          setShowDropdown(true);
        } else {
          setPredictions([]);
          setShowDropdown(false);
        }
      }
    );
  };

  const handleSelectPrediction = (prediction: Prediction) => {
    onChange(prediction.description);
    setPredictions([]);
    setShowDropdown(false);

    // Déclencher le callback après sélection
    if (onAddressSelected) {
      setTimeout(() => {
        onAddressSelected();
      }, 100);
    }
  };

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

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => {
          if (predictions.length > 0) {
            setShowDropdown(true);
          }
        }}
        className={className}
        placeholder={placeholder}
        autoComplete="off"
      />

      {showDropdown && predictions.length > 0 && (
        <ul
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {predictions.map((prediction) => (
            <li
              key={prediction.place_id}
              onClick={() => handleSelectPrediction(prediction)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700 border-b border-gray-100 last:border-b-0"
            >
              {prediction.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GoogleAddressAutocomplete;
