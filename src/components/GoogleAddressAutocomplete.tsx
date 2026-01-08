import React, { useState, useRef, useEffect } from 'react';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';

const libraries: ("places")[] = ["places"];

interface GoogleAddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  rows?: number;
}

const GoogleAddressAutocomplete: React.FC<GoogleAddressAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Entrez votre adresse complète",
  className = "",
  error,
  rows = 3
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || "",
    libraries,
  });

  const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        onChange(place.formatted_address);
      }
    }
  };

  // Fallback si Google Maps n'est pas chargé ou clé manquante
  if (loadError || !apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    return (
      <div>
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
          placeholder={placeholder}
          rows={rows}
        />
        {(!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') && (
          <p className="text-xs text-yellow-600 mt-1">
            ⚠️ Google Maps API non configurée - Saisie manuelle uniquement
          </p>
        )}
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className}
        placeholder="Chargement de l'autocomplétion..."
        rows={rows}
        disabled
      />
    );
  }

  return (
    <Autocomplete
      onLoad={onLoad}
      onPlaceChanged={onPlaceChanged}
      options={{
        componentRestrictions: { country: "sn" }, // Limiter au Sénégal
        types: ["address"], // Limiter aux adresses
      }}
    >
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className}
        placeholder={placeholder}
        rows={rows}
      />
    </Autocomplete>
  );
};

export default GoogleAddressAutocomplete;
