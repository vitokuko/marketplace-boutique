import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, Truck, Zap, Clock } from 'lucide-react';
import { livraisonService } from '../services/livraisonService';
import type { AdresseLivraison, CalculPrixLivraison, ZoneLivraison } from '../models/livraison-models';

interface AdresseAutocompleteProps {
  onAdresseSelect: (adresse: AdresseLivraison, calculPrix: CalculPrixLivraison | null) => void;
  placeholder?: string;
  className?: string;
  showZoneTariffs?: boolean;
}

const AdresseAutocomplete: React.FC<AdresseAutocompleteProps> = ({
  onAdresseSelect,
  placeholder = "Entrez votre adresse de livraison...",
  className = "",
  showZoneTariffs = true
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AdresseLivraison[]>([]);
  const [zonesWithDisplay, setZonesWithDisplay] = useState<{zone: ZoneLivraison, displayText: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [calculatingPrice, setCalculatingPrice] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchAddresses = async () => {
      if (query.length === 0) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await livraisonService.rechercherAdresse(query);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (error) {
        //console.error('Erreur recherche adresse:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchAddresses, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    const loadZones = async () => {
      try {
        const zonesData = await livraisonService.getZonesForAutocomplete();
        setZonesWithDisplay(zonesData);
      } catch (error) {
        console.error('Erreur chargement zones:', error);
      }
    };

    loadZones();
  }, []);

  const handleAdresseClick = async (adresse: AdresseLivraison) => {
    setQuery(adresse.adresseComplete);
    setShowSuggestions(false);
    setCalculatingPrice(true);

    try {
      const calculPrix = await livraisonService.calculerPrixLivraison(adresse);

      if (calculPrix) {
        console.log('Prix calculé:', calculPrix);
        onAdresseSelect(adresse, calculPrix);
      } else {
        console.warn('Aucun prix calculé, utilisation des valeurs par défaut');
        const calculPrixDefaut: CalculPrixLivraison = {
          zoneId: 1,
          zoneName: "Zone par défaut",
          tarifStandard: 1500,
          tarifExpress: 2500,
          tarifUrgent: 4000,
          distance: 5,
          dureeEstimee: "30 min"
        };
        onAdresseSelect(adresse, calculPrixDefaut);
      }
    } catch (error) {
      console.error('Erreur sélection zone:', error);
      const calculPrixDefaut: CalculPrixLivraison = {
        zoneId: 1,
        zoneName: "Zone par défaut",
        tarifStandard: 1500,
        tarifExpress: 2500,
        tarifUrgent: 4000,
        distance: 5,
        dureeEstimee: "30 min"
      };
      onAdresseSelect(adresse, calculPrixDefaut);
    } finally {
      setCalculatingPrice(false);
    }
  };



  const getDeliveryIcon = (type: string) => {
    switch (type) {
      case 'express': return <Zap className="w-4 h-4 text-blue-500" />;
      case 'urgent': return <Clock className="w-4 h-4 text-red-500" />;
      default: return <Truck className="w-4 h-4 text-green-500" />;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {(isLoading || calculatingPrice) && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5 animate-spin" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {suggestions.map((suggestion, index) => {
            const zoneData = zonesWithDisplay.find(zd =>
              zd.zone.nom === suggestion.adresseComplete ||
              zd.zone.description === suggestion.quartier
            );

            return (
              <button
                key={index}
                onClick={() => handleAdresseClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{suggestion.adresseComplete}</div>
                      {suggestion.quartier && (
                        <div className="text-sm text-gray-500">{suggestion.quartier}</div>
                      )}
                    </div>
                  </div>

                  {zoneData && showZoneTariffs && zoneData.zone.tarifStandard > 0 && (
                    <div className="ml-4 text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {zoneData.zone.tarifStandard.toLocaleString()} FCFA
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        {getDeliveryIcon('standard')}
                        <span>Standard</span>
                      </div>
                    </div>
                  )}
                </div>

                {zoneData && showZoneTariffs && zoneData.zone.tarifExpress > 0 && zoneData.zone.tarifUrgent > 0 && (
                  <div className="mt-2 flex gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      {getDeliveryIcon('express')}
                      <span>Express: {zoneData.zone.tarifExpress.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getDeliveryIcon('urgent')}
                      <span>Urgent: {zoneData.zone.tarifUrgent.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdresseAutocomplete;
