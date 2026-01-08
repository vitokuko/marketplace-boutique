import React, { useState } from 'react';
import { papsDeliveryService } from '../services/papsDeliveryService';
import type { AdresseLivraison, CalculPrixLivraison } from '../models/livraison-models';
import GoogleAddressAutocomplete from './GoogleAddressAutocomplete';

interface AdresseAutocompleteProps {
  onAdresseSelect: (adresse: AdresseLivraison, calculPrix: CalculPrixLivraison | null) => void;
  placeholder?: string;
  className?: string;
  showZoneTariffs?: boolean;
}

const AdresseAutocomplete: React.FC<AdresseAutocompleteProps> = ({
  onAdresseSelect,
  placeholder = "Entrez votre adresse de livraison...",
  className = ""
}) => {
  const [adresse, setAdresse] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastCalculatedAddress, setLastCalculatedAddress] = useState('');

  const handleCalculateFees = async () => {
    // Éviter de recalculer si l'adresse n'a pas changé
    if (adresse.trim().length > 10 && adresse !== lastCalculatedAddress) {
      setIsCalculating(true);
      try {
        const result = await papsDeliveryService.calculateDeliveryFee({
          adresse: adresse,
          typeRecuperation: 'domicile',
          boutiqueId: 1
        });

        const adresseLivraison: AdresseLivraison = {
          adresseComplete: adresse,
          quartier: result.zoneDetectee || '',
          ville: 'Dakar',
          pays: 'Sénégal'
        };

        const calculPrix: CalculPrixLivraison = {
          zoneId: 1,
          zoneName: result.zoneDetectee || 'Zone détectée',
          tarifStandard: result.fraisLivraison,
          tarifExpress: result.fraisLivraison * 1.5,
          tarifUrgent: result.fraisLivraison * 2,
          distance: 0,
          dureeEstimee: result.estimatedTime || '30-60 min'
        };

        onAdresseSelect(adresseLivraison, calculPrix);
        setLastCalculatedAddress(adresse);
      } catch (error) {
        console.error('Erreur calcul frais:', error);
      } finally {
        setIsCalculating(false);
      }
    }
  };

  return (
    <div>
      <GoogleAddressAutocomplete
        value={adresse}
        onChange={setAdresse}
        onAddressSelected={handleCalculateFees}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      />
      {isCalculating && (
        <p className="text-sm text-blue-600 mt-1">Calcul des frais de livraison en cours...</p>
      )}
    </div>
  );
};

export default AdresseAutocomplete;
