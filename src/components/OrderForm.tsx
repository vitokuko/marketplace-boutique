import React, { useState, useEffect } from 'react';
import { X, MapPin, Package, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useShop } from '../context/ShopContext';
import { createOrder, convertCartToOrderItems } from '../services/orderService';
import type { OrderData } from '../services/orderService';
import { papsDeliveryService } from '../services/papsDeliveryService';
import type { PapsOption, DeliveryConfigPublic, ZonePublicInfo } from '../services/papsDeliveryService';
import type { AdresseLivraison } from '../models/livraison-models';
import AdresseAutocomplete from './AdresseAutocomplete';
import { formatPhoneNumber } from '../utils/phoneFormatter';

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderId: number) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { boutiqueId } = useShop();
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

  // Configuration de livraison de la boutique
  const [deliveryConfig, setDeliveryConfig] = useState<DeliveryConfigPublic | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);

  // Mode de livraison sélectionné
  const [selectedDeliveryMode, setSelectedDeliveryMode] = useState<'paps' | 'zones' | null>(null);

  // Pour Paps
  const [adresseLivraison, setAdresseLivraison] = useState<AdresseLivraison | null>(null);
  const [papsOption, setPapsOption] = useState<PapsOption | null>(null);

  // Pour Zones
  const [selectedZone, setSelectedZone] = useState<ZonePublicInfo | null>(null);
  const [selectedZoneType, setSelectedZoneType] = useState<'STANDARD' | 'EXPRESS' | 'URGENT'>('STANDARD');
  const [zoneSearchQuery, setZoneSearchQuery] = useState('');
  const [showZoneDropdown, setShowZoneDropdown] = useState(false);

  // Prix final de livraison
  const [prixLivraison, setPrixLivraison] = useState<number>(0);
  const [livraisonGratuiteApplicable, setLivraisonGratuiteApplicable] = useState(false);

  // Charger la configuration de livraison au démarrage
  useEffect(() => {
    if (isOpen && boutiqueId) {
      loadDeliveryConfig();
    }
  }, [isOpen, boutiqueId]);

  // Effect pour sélectionner auto le mode si un seul est actif
  useEffect(() => {
    if (deliveryConfig && formData.typeRecuperation === 'domicile') {
      if (deliveryConfig.paps_actif && !deliveryConfig.zones_actif) {
        setSelectedDeliveryMode('paps');
      } else if (deliveryConfig.zones_actif && !deliveryConfig.paps_actif) {
        setSelectedDeliveryMode('zones');
      }
    }
  }, [deliveryConfig, formData.typeRecuperation]);

  const loadDeliveryConfig = async () => {
    if (!boutiqueId) return;

    setLoadingConfig(true);
    try {
      const config = await papsDeliveryService.getDeliveryConfig(boutiqueId);
      setDeliveryConfig(config);

      // Vérifier livraison gratuite
      if (config.livraison_gratuite && config.seuil_livraison_gratuite) {
        setLivraisonGratuiteApplicable(getTotalPrice() >= config.seuil_livraison_gratuite);
      }
    } catch (error) {
      console.error('Erreur chargement config livraison:', error);
    } finally {
      setLoadingConfig(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.clientNom.trim()) {
      newErrors.clientNom = 'Le nom complet est obligatoire';
    }

    if (!formData.clientTelephone.trim()) {
      newErrors.clientTelephone = 'Le téléphone est obligatoire';
    }

    if (formData.typeRecuperation === 'domicile') {
      if (!selectedDeliveryMode) {
        newErrors.deliveryMode = 'Veuillez sélectionner un mode de livraison';
      } else if (selectedDeliveryMode === 'paps' && !adresseLivraison) {
        newErrors.adresse = 'Veuillez saisir votre adresse de livraison';
      } else if (selectedDeliveryMode === 'zones' && !selectedZone) {
        newErrors.zone = 'Veuillez sélectionner une zone de livraison';
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

      const formattedPhone = formatPhoneNumber(formData.clientTelephone, 'SN');

      // Déterminer l'adresse selon le mode
      let adresseFinale = '';
      if (formData.typeRecuperation === 'domicile') {
        if (selectedDeliveryMode === 'paps') {
          adresseFinale = adresseLivraison?.adresseComplete || '';
        } else if (selectedDeliveryMode === 'zones' && selectedZone) {
          adresseFinale = selectedZone.nom;
        }
      }

      const orderData: OrderData = {
        clientNom: formData.clientNom,
        clientEmail: formData.clientEmail,
        clientTelephone: formattedPhone,
        adresse: adresseFinale,
        typeRecuperation: formData.typeRecuperation,
        commentaire: formData.commentaire,
        items: convertCartToOrderItems(items),
        total: getTotalPrice() + prixLivraison,
        fraisLivraison: formData.typeRecuperation === 'domicile' ? prixLivraison : 0,
        modeLivraison: selectedDeliveryMode || undefined,
        typeLivraisonZone: selectedDeliveryMode === 'zones' ? selectedZoneType : undefined
      };

      const order = await createOrder(orderData);
      clearCart();
      onSuccess(order.id);
      onClose();
    } catch (error) {
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
      resetDeliveryState();
    }

    if (errors.adresse && type === 'boutique') {
      setErrors(prev => ({ ...prev, adresse: '' }));
    }
  };

  const resetDeliveryState = () => {
    setAdresseLivraison(null);
    setPapsOption(null);
    setSelectedZone(null);
    setSelectedZoneType('STANDARD');
    setPrixLivraison(0);
    setZoneSearchQuery('');
    setSelectedDeliveryMode(null);
  };

  const handleDeliveryModeChange = (mode: 'paps' | 'zones') => {
    setSelectedDeliveryMode(mode);
    // Reset les données de l'autre mode
    if (mode === 'paps') {
      setSelectedZone(null);
      setZoneSearchQuery('');
      setPrixLivraison(0);
    } else {
      setAdresseLivraison(null);
      setPapsOption(null);
      setPrixLivraison(0);
    }
    setErrors(prev => ({ ...prev, deliveryMode: '', adresse: '', zone: '' }));
  };

  // Gestion Paps
  const handleAdresseSelect = async (adresse: AdresseLivraison) => {
    setAdresseLivraison(adresse);
    setIsCalculatingPrice(true);

    try {
      const papsResult = await papsDeliveryService.calculatePapsDeliveryFee({
        adresse: adresse.adresseComplete,
        typeRecuperation: 'domicile',
        boutiqueId: boutiqueId || undefined,
        totalCommande: getTotalPrice()
      });

      setPapsOption(papsResult);

      if (papsResult.disponible && papsResult.tarif !== null) {
        setPrixLivraison(papsResult.tarif);
      } else {
        setPrixLivraison(0);
      }
    } catch (error) {
      console.error('Erreur calcul Paps:', error);
      setPapsOption(null);
      setPrixLivraison(0);
    } finally {
      setIsCalculatingPrice(false);
    }

    if (errors.adresse) {
      setErrors(prev => ({ ...prev, adresse: '' }));
    }
  };

  // Gestion Zones
  const handleZoneSelect = (zone: ZonePublicInfo) => {
    setSelectedZone(zone);
    setZoneSearchQuery(zone.nom);
    setShowZoneDropdown(false);
    setSelectedZoneType('STANDARD');

    // Calculer le prix selon le type et la livraison gratuite
    const prix = livraisonGratuiteApplicable ? 0 : zone.tarif;
    setPrixLivraison(prix);

    if (errors.zone) {
      setErrors(prev => ({ ...prev, zone: '' }));
    }
  };

  const handleZoneTypeChange = (type: 'STANDARD' | 'EXPRESS' | 'URGENT') => {
    setSelectedZoneType(type);

    if (selectedZone) {
      let prix = 0;
      if (!livraisonGratuiteApplicable || type !== 'STANDARD') {
        switch (type) {
          case 'STANDARD':
            prix = selectedZone.tarif;
            break;
          case 'EXPRESS':
            prix = selectedZone.tarif_express || selectedZone.tarif * 1.5;
            break;
          case 'URGENT':
            prix = selectedZone.tarif_urgent || selectedZone.tarif * 2;
            break;
        }
      }
      setPrixLivraison(prix);
    }
  };

  const filteredZones = deliveryConfig?.zones.filter(zone =>
    zone.nom.toLowerCase().includes(zoneSearchQuery.toLowerCase()) ||
    (zone.description && zone.description.toLowerCase().includes(zoneSearchQuery.toLowerCase()))
  ) || [];

  const isFormValid = () => {
    if (!formData.clientNom.trim() || !formData.clientTelephone.trim()) {
      return false;
    }

    if (formData.typeRecuperation === 'domicile') {
      if (!selectedDeliveryMode) return false;
      if (selectedDeliveryMode === 'paps' && (!adresseLivraison || isCalculatingPrice)) return false;
      if (selectedDeliveryMode === 'zones' && !selectedZone) return false;
    }

    return true;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  const hasMultipleDeliveryModes = deliveryConfig?.paps_actif && deliveryConfig?.zones_actif;
  const hasAnyDeliveryMode = deliveryConfig?.paps_actif || deliveryConfig?.zones_actif;

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
          {/* Nom et Email */}
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

          {/* Téléphone */}
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

          {/* Mode de récupération */}
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

          {/* Section Livraison à domicile */}
          {formData.typeRecuperation === 'domicile' && (
            <div className="space-y-4 border-t pt-4">
              {loadingConfig ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Chargement des options de livraison...</p>
                </div>
              ) : (
                <>
                  {/* Sélection du mode de livraison si les deux sont disponibles */}
                  {hasMultipleDeliveryModes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de livraison <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => handleDeliveryModeChange('paps')}
                          className={`p-4 border-2 rounded-lg text-left transition-all ${
                            selectedDeliveryMode === 'paps'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin size={20} className="text-blue-600" />
                            <span className="font-semibold">Livraison Paps</span>
                          </div>
                          <p className="text-xs text-gray-500">Saisissez votre adresse exacte pour une livraison à domicile</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeliveryModeChange('zones')}
                          className={`p-4 border-2 rounded-lg text-left transition-all ${
                            selectedDeliveryMode === 'zones'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Package size={20} className="text-green-600" />
                            <span className="font-semibold">Livraison par zone</span>
                          </div>
                          <p className="text-xs text-gray-500">Sélectionnez votre zone parmi les zones définies</p>
                        </button>
                      </div>
                      {errors.deliveryMode && (
                        <p className="text-red-500 text-sm mt-1">{errors.deliveryMode}</p>
                      )}
                    </div>
                  )}

                  {/* Interface PAPS */}
                  {selectedDeliveryMode === 'paps' && (
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

                      {/* Affichage option Paps */}
                      {papsOption && papsOption.disponible && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-blue-800">Livraison Paps</p>
                              {papsOption.estimatedTime && (
                                <p className="text-sm text-blue-600">Délai estimé: {papsOption.estimatedTime}</p>
                              )}
                            </div>
                            <p className="text-xl font-bold text-blue-800">
                              {papsOption.tarif?.toLocaleString()} FCFA
                            </p>
                          </div>
                        </div>
                      )}

                      {papsOption && !papsOption.disponible && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-red-800">{papsOption.erreur || 'Livraison Paps non disponible pour cette adresse'}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Interface ZONES */}
                  {selectedDeliveryMode === 'zones' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Zone de livraison <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={zoneSearchQuery}
                              onChange={(e) => {
                                setZoneSearchQuery(e.target.value);
                                setShowZoneDropdown(true);
                                if (selectedZone && e.target.value !== selectedZone.nom) {
                                  setSelectedZone(null);
                                  setPrixLivraison(0);
                                }
                              }}
                              onFocus={() => setShowZoneDropdown(true)}
                              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.zone ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="Recherchez votre zone..."
                            />
                          </div>

                          {/* Dropdown des zones */}
                          {showZoneDropdown && filteredZones.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {filteredZones.map((zone) => (
                                <button
                                  key={zone.id}
                                  type="button"
                                  onClick={() => handleZoneSelect(zone)}
                                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                    selectedZone?.id === zone.id ? 'bg-blue-50' : ''
                                  }`}
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="font-medium text-gray-800">{zone.nom}</p>
                                      {zone.description && (
                                        <p className="text-sm text-gray-500">{zone.description}</p>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold text-blue-600">
                                        {livraisonGratuiteApplicable ? (
                                          <span className="text-green-600">Gratuit</span>
                                        ) : (
                                          `${zone.tarif.toLocaleString()} FCFA`
                                        )}
                                      </p>
                                      {zone.temps_min && zone.temps_max && (
                                        <p className="text-xs text-gray-500">{zone.temps_min}-{zone.temps_max} min</p>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}

                          {showZoneDropdown && filteredZones.length === 0 && zoneSearchQuery && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
                              Aucune zone trouvée pour "{zoneSearchQuery}"
                            </div>
                          )}
                        </div>
                        {errors.zone && (
                          <p className="text-red-500 text-sm mt-1">{errors.zone}</p>
                        )}
                      </div>

                      {/* Options de tarif pour la zone sélectionnée */}
                      {selectedZone && (
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700">
                            Options de livraison
                          </label>
                          <div className="space-y-2">
                            {/* Standard */}
                            <label className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all ${
                              selectedZoneType === 'STANDARD' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                            }`}>
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  name="zoneType"
                                  checked={selectedZoneType === 'STANDARD'}
                                  onChange={() => handleZoneTypeChange('STANDARD')}
                                  className="mr-3"
                                />
                                <div>
                                  <p className="font-medium">Standard</p>
                                  <p className="text-sm text-gray-500">
                                    Délai: {selectedZone.temps_min || 30}-{selectedZone.temps_max || 90} min
                                  </p>
                                </div>
                              </div>
                              <p className="font-bold text-lg">
                                {livraisonGratuiteApplicable ? (
                                  <span className="text-green-600">Gratuit</span>
                                ) : (
                                  `${selectedZone.tarif.toLocaleString()} FCFA`
                                )}
                              </p>
                            </label>

                            {/* Express */}
                            {selectedZone.tarif_express && (
                              <label className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                selectedZoneType === 'EXPRESS' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:bg-gray-50'
                              }`}>
                                <div className="flex items-center">
                                  <input
                                    type="radio"
                                    name="zoneType"
                                    checked={selectedZoneType === 'EXPRESS'}
                                    onChange={() => handleZoneTypeChange('EXPRESS')}
                                    className="mr-3"
                                  />
                                  <div>
                                    <p className="font-medium">Express</p>
                                    <p className="text-sm text-gray-500">Livraison prioritaire plus rapide</p>
                                  </div>
                                </div>
                                <p className="font-bold text-lg">
                                  {selectedZone.tarif_express.toLocaleString()} FCFA
                                </p>
                              </label>
                            )}

                            {/* Urgent */}
                            {selectedZone.tarif_urgent && (
                              <label className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                selectedZoneType === 'URGENT' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:bg-gray-50'
                              }`}>
                                <div className="flex items-center">
                                  <input
                                    type="radio"
                                    name="zoneType"
                                    checked={selectedZoneType === 'URGENT'}
                                    onChange={() => handleZoneTypeChange('URGENT')}
                                    className="mr-3"
                                  />
                                  <div>
                                    <p className="font-medium">Urgent</p>
                                    <p className="text-sm text-gray-500">Livraison ultra-rapide garantie</p>
                                  </div>
                                </div>
                                <p className="font-bold text-lg">
                                  {selectedZone.tarif_urgent.toLocaleString()} FCFA
                                </p>
                              </label>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message si aucun mode de livraison n'est disponible */}
                  {!hasAnyDeliveryMode && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800">
                        La livraison à domicile n'est pas disponible pour cette boutique.
                        Veuillez choisir la récupération en boutique.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Commentaire */}
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

          {/* Paiement */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mt-6">
            <p className="text-green-800 text-lg font-bold text-center">
              💰 Paiement à la livraison
            </p>
          </div>

          {/* Récapitulatif */}
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

          {/* Boutons */}
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
