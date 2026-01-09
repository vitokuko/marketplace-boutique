import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createOrder, convertCartToOrderItems } from '../services/orderService';
import type { OrderData } from '../services/orderService';
import { livraisonService } from '../services/livraisonService';
import type { AdresseLivraison, CalculPrixLivraison, OptionsLivraison, ConfigurationMarchand } from '../models/livraison-models';
import AdresseAutocomplete from './AdresseAutocomplete';
import OptionsLivraisonComponent from './OptionsLivraison';

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderId: number) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const { items, getTotalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    clientNom: '',
    clientEmail: '',
    clientTelephone: '',
    adresse: '',
    typeRecuperation: 'boutique' as 'boutique' | 'domicile',
    commentaire: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const [adresseLivraison, setAdresseLivraison] = useState<AdresseLivraison | null>(null);
  const [calculPrixLivraison, setCalculPrixLivraison] = useState<CalculPrixLivraison | null>(null);
  const [optionsLivraison, setOptionsLivraison] = useState<OptionsLivraison[]>([]);
  const [selectedLivraisonType, setSelectedLivraisonType] = useState<string>('STANDARD');
  const [prixLivraison, setPrixLivraison] = useState<number>(0);
  const [configMarchand, setConfigMarchand] = useState<ConfigurationMarchand | null>(null);
  const [showFreeDeliveryInfo, setShowFreeDeliveryInfo] = useState(false);

  useEffect(() => {
    const loadMarchandConfig = async () => {
      const config = await livraisonService.getConfigurationMarchand(1);
      setConfigMarchand(config);
      
      if (config?.livraisonGratuite && config.seuilLivraisonGratuite) {
        setShowFreeDeliveryInfo(getTotalPrice() >= (config.seuilLivraisonGratuite || 0));
      }
    };
    
    if (isOpen) {
      loadMarchandConfig();
    }
  }, [isOpen, getTotalPrice]);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.clientNom.trim()) {
      newErrors.clientNom = 'Le nom complet est obligatoire';
    }
    
    if (!formData.clientTelephone.trim()) {
      newErrors.clientTelephone = 'Le téléphone est obligatoire';
    }
    
    if (formData.typeRecuperation === 'domicile') {
      if (!adresseLivraison) {
        newErrors.adresse = 'Veuillez sélectionner une adresse de livraison';
      }
      if (!calculPrixLivraison) {
        newErrors.adresse = 'Impossible de calculer le prix de livraison';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      setSubmitError(null);
      const orderData: OrderData = {
        clientNom: formData.clientNom,
        clientEmail: formData.clientEmail,
        clientTelephone: formData.clientTelephone,
        adresse: formData.typeRecuperation === 'domicile' ? adresseLivraison?.adresseComplete || '' : '',
        typeRecuperation: formData.typeRecuperation,
        commentaire: formData.commentaire,
        items: convertCartToOrderItems(items),
        total: getTotalPrice() + prixLivraison,
        fraisLivraison: formData.typeRecuperation === 'domicile' ? prixLivraison : 0
      };

      const order = await createOrder(orderData);
      clearCart();
      onSuccess(order.id);
      onClose();
    } catch (error) {
      //console.error('Erreur lors de la création de la commande:', error);
      setSubmitError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleRecuperationChange = (type: 'boutique' | 'domicile') => {
    setFormData(prev => ({ 
      ...prev, 
      typeRecuperation: type,
      adresse: type === 'boutique' ? '' : prev.adresse
    }));
    
    if (type === 'boutique') {
      setAdresseLivraison(null);
      setCalculPrixLivraison(null);
      setOptionsLivraison([]);
      setPrixLivraison(0);
    }
    
    if (errors.adresse && type === 'boutique') {
      setErrors(prev => ({ ...prev, adresse: '' }));
    }
  };

  const handleAdresseSelect = async (adresse: AdresseLivraison, calculPrix: CalculPrixLivraison | null) => {
    setAdresseLivraison(adresse);
    setCalculPrixLivraison(calculPrix);

    if (calculPrix) {
      const options = livraisonService.getOptionsLivraison(calculPrix, configMarchand || undefined, getTotalPrice());
      setOptionsLivraison(options);

      const standardOption = options.find(opt => opt.type === 'STANDARD');
      if (standardOption) {
        setSelectedLivraisonType('STANDARD');
        setPrixLivraison(standardOption.prix);
      } else {
        setPrixLivraison(calculPrix.tarifStandard);
      }
    } else {
      try {
        const zonesData = await livraisonService.getZonesForAutocomplete();
        if (zonesData.length > 0) {
          const defaultZone = zonesData[0];
          setPrixLivraison(defaultZone.zone.tarifStandard);
        } else {
          setPrixLivraison(1500);
        }
      } catch (error) {
        //console.error('Error getting zones data:', error);
        setPrixLivraison(1500);
      }
    }

    if (errors.adresse) {
      setErrors(prev => ({ ...prev, adresse: '' }));
    }
  };

  // Vérifier si le formulaire est valide
  const isFormValid = () => {
    if (!formData.clientNom.trim() || !formData.clientTelephone.trim()) {
      return false;
    }

    if (formData.typeRecuperation === 'domicile') {
      if (!adresseLivraison || !calculPrixLivraison || isCalculatingPrice) {
        return false;
      }
    }

    return true;
  };

  const handleLivraisonOptionSelect = (type: string, prix: number) => {
    setSelectedLivraisonType(type);
    setPrixLivraison(prix);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6">
          <div className="flex-1"></div>
          <h2 className="text-2xl font-bold text-gray-800 text-center">Finaliser la commande</h2>
          <div className="flex-1 flex justify-end">
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.clientNom}
                onChange={(e) => handleInputChange('clientNom', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.clientNom ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Entrez votre nom complet"
              />
              {errors.clientNom && (
                <p className="text-red-500 text-sm mt-1">{errors.clientNom}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (facultatif)
              </label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Entrez votre email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.clientTelephone}
              onChange={(e) => handleInputChange('clientTelephone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.clientTelephone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Entrez votre numéro de téléphone"
            />
            {errors.clientTelephone && (
              <p className="text-red-500 text-sm mt-1">{errors.clientTelephone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode de récupération
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center p-2 border-2 rounded-lg cursor-pointer transition-all ${
                formData.typeRecuperation === 'boutique' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <input
                  type="checkbox"
                  checked={formData.typeRecuperation === 'boutique'}
                  onChange={() => handleRecuperationChange('boutique')}
                  className="mr-2 w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-800">✅ En boutique</span>
              </label>
              <label className={`flex items-center p-2 border-2 rounded-lg cursor-pointer transition-all ${
                formData.typeRecuperation === 'domicile' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <input
                  type="checkbox"
                  checked={formData.typeRecuperation === 'domicile'}
                  onChange={() => handleRecuperationChange('domicile')}
                  className="mr-2 w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-800">🚚 À domicile</span>
              </label>
            </div>
          </div>

          {formData.typeRecuperation === 'domicile' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse de livraison <span className="text-red-500">*</span>
                </label>
                <AdresseAutocomplete
                  onAdresseSelect={handleAdresseSelect}
                  onCalculatingChange={setIsCalculatingPrice}
                  placeholder="Recherchez votre adresse..."
                  className={errors.adresse ? 'border-red-500' : ''}
                />
                {errors.adresse && (
                  <p className="text-red-500 text-sm mt-1">{errors.adresse}</p>
                )}
              </div>

              {optionsLivraison.length > 0 && (
                <div>
                  <OptionsLivraisonComponent
                    options={optionsLivraison}
                    selectedOption={selectedLivraisonType}
                    onOptionSelect={handleLivraisonOptionSelect}
                    showFreeDeliveryBadge={showFreeDeliveryInfo}
                  />
                </div>
              )}

              {showFreeDeliveryInfo && configMarchand?.seuilLivraisonGratuite && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 text-sm">
                    🎉 Félicitations ! Votre commande est éligible à la livraison gratuite
                    (minimum {configMarchand.seuilLivraisonGratuite ? configMarchand.seuilLivraisonGratuite.toLocaleString() : '0'} FCFA atteint)
                  </p>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commentaire (facultatif)
            </label>
            <textarea
              value={formData.commentaire}
              onChange={(e) => handleInputChange('commentaire', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ajoutez un commentaire pour votre commande..."
              rows={2}
            />
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mt-6">
            <p className="text-green-800 text-lg font-bold text-center">
              💰 Paiement à la livraison
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Sous-total produits:</span>
              <span className="font-medium">{getTotalPrice() ? getTotalPrice().toLocaleString() : '0'} FCFA</span>
            </div>
            
            {formData.typeRecuperation === 'domicile' && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Frais de livraison:</span>
                <span className="font-medium">
                  {prixLivraison === 0 ? (
                    <span className="text-green-600 font-semibold">Gratuit</span>
                  ) : (
                    `${prixLivraison ? prixLivraison.toLocaleString() : '0'} FCFA`
                  )}
                </span>
              </div>
            )}
            
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900">Total à payer:</span>
                <span className="text-xl font-bold text-blue-600">
                  {(getTotalPrice() + prixLivraison) ? (getTotalPrice() + prixLivraison).toLocaleString() : '0'} FCFA
                </span>
              </div>
            </div>
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{submitError}</p>
            </div>
          )}

          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="flex-1 bg-gradient-to-r from-[#389EBF] to-[#3B82F6] text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Traitement...' : isCalculatingPrice ? 'Calcul en cours...' : 'Confirmer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;