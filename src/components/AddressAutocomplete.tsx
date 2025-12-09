import React, { useState, useEffect, useRef } from 'react';
import { getAddressSuggestions, type AddressSuggestion } from '../services/orderService';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (suggestion: AddressSuggestion) => void;
  placeholder?: string;
  className?: string;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Entrez votre adresse...",
  className = ""
}) => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchAddresses = async () => {
      if (value.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await getAddressSuggestions(value, 8);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Erreur lors de la recherche d\'adresses:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchAddresses, 300);
    return () => clearTimeout(timeoutId);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    onChange(suggestion.adresse_complete);
    setShowSuggestions(false);
    onAddressSelect?.(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'text-green-600';
      case 2: return 'text-blue-600';
      case 3: return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'Zone prioritaire';
      case 2: return 'Zone standard';
      case 3: return 'Zone étendue';
      default: return 'Zone inconnue';
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={() => value.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        autoComplete="off"
      />
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${suggestion.nom}-${index}`}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {suggestion.nom}
                    {suggestion.localite && (
                      <span className="text-sm text-gray-500 ml-1">
                        • {suggestion.localite}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {suggestion.adresse_complete}
                  </div>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 ${getPriorityColor(suggestion.zone_priorite)}`}>
                      {getPriorityLabel(suggestion.zone_priorite)}
                    </span>
                    {suggestion.tarif_estime && (
                      <span className="text-xs text-green-600 font-medium">
                        {suggestion.tarif_estime} FCFA
                      </span>
                    )}
                    {suggestion.temps_estime && (
                      <span className="text-xs text-blue-600">
                        {suggestion.temps_estime}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    suggestion.type === 'locality' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {suggestion.type === 'locality' ? 'Localité' : 'Quartier'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};