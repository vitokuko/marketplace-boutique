import React, { useState } from 'react';
import type { AdresseLivraison } from '../models/livraison-models';
import GoogleAddressAutocomplete from './GoogleAddressAutocomplete';

interface AdresseAutocompleteProps {
  onAdresseSelect: (adresse: AdresseLivraison) => void;
  onCalculatingChange?: (isCalculating: boolean) => void;
  placeholder?: string;
  className?: string;
  showZoneTariffs?: boolean;
}

const AdresseAutocomplete: React.FC<AdresseAutocompleteProps> = ({
  onAdresseSelect,
  onCalculatingChange,
  placeholder = "Entrez votre adresse de livraison...",
  className = ""
}) => {
  const [adresse, setAdresse] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastCalculatedAddress, setLastCalculatedAddress] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCalculateFees = async (addressToCalculate: string) => {
    // Éviter de recalculer si l'adresse n'a pas changé
    if (addressToCalculate.trim().length > 5 && addressToCalculate !== lastCalculatedAddress) {
      setIsCalculating(true);
      onCalculatingChange?.(true);
      setError(null);
      try {
        const adresseLivraison: AdresseLivraison = {
          adresseComplete: addressToCalculate,
          quartier: '',
          ville: 'Dakar',
          pays: 'Sénégal'
        };

        onAdresseSelect(adresseLivraison);
        setLastCalculatedAddress(addressToCalculate);
      } catch (error) {
        console.error('Erreur:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la sélection de l\'adresse';
        setError(errorMessage);
      } finally {
        setIsCalculating(false);
        onCalculatingChange?.(false);
      }
    }
  };

  // Note: On ne déclenche plus automatiquement le calcul sur la saisie manuelle
  // Le calcul ne se fait que lors de la sélection d'une suggestion Google Maps

  const handleAddressSelected = (selectedAddress: string) => {
    // Quand une adresse est sélectionnée depuis Google Maps, calculer immédiatement
    handleCalculateFees(selectedAddress);
  };

  return (
    <div>
      <GoogleAddressAutocomplete
        value={adresse}
        onChange={setAdresse}
        onAddressSelected={handleAddressSelected}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      />
      {isCalculating && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <p className="text-sm text-blue-600 font-medium">Calcul des options de livraison en cours...</p>
        </div>
      )}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default AdresseAutocomplete;
