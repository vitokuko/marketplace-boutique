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
import { formatPhoneNumber, isValidPhoneNumber } from '../utils/phoneFormatter';

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

  const [deliveryConfig, setDeliveryConfig] = useState<DeliveryConfigPublic | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [selectedDeliveryMode, setSelectedDeliveryMode] = useState<'paps' | 'zones' | null>(null);
  const [adresseLivraison, setAdresseLivraison] = useState<AdresseLivraison | null>(null);
  const [papsOption, setPapsOption] = useState<PapsOption | null>(null);
  const [selectedZone, setSelectedZone] = useState<ZonePublicInfo | null>(null);
  const [selectedZoneType, setSelectedZoneType] = useState<'STANDARD' | 'EXPRESS' | 'URGENT'>('STANDARD');
  const [zoneSearchQuery, setZoneSearchQuery] = useState('');
  const [showZoneDropdown, setShowZoneDropdown] = useState(false);
  const [prixLivraison, setPrixLivraison] = useState<number>(0);
  const [livraisonGratuiteApplicable, setLivraisonGratuiteApplicable] = useState(false);

  useEffect(() => {
    if (isOpen && boutiqueId) {
      loadDeliveryConfig();
    }
  }, [isOpen, boutiqueId]);

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
    if (!formData.clientNom.trim()) newErrors.clientNom = 'Le nom complet est obligatoire';
    if (!formData.clientTelephone.trim()) {
      newErrors.clientTelephone = 'Le téléphone est obligatoire';
    } else if (!isValidPhoneNumber(formData.clientTelephone)) {
      newErrors.clientTelephone = 'Numéro de téléphone invalide (ex: 771234567 ou +221771234567)';
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
    if (!validateForm()) return;
    setLoading(true);
    try {
      setSubmitError(null);
      const formattedPhone = formatPhoneNumber(formData.clientTelephone, 'SN');
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
    setFormData(prev => ({ ...prev, typeRecuperation: type, adresse: type === 'boutique' ? '' : prev.adresse }));
    if (type === 'boutique') resetDeliveryState();
    if (errors.adresse && type === 'boutique') setErrors(prev => ({ ...prev, adresse: '' }));
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
    if (mode === 'paps') { setSelectedZone(null); setZoneSearchQuery(''); setPrixLivraison(0); }
    else { setAdresseLivraison(null); setPapsOption(null); setPrixLivraison(0); }
    setErrors(prev => ({ ...prev, deliveryMode: '', adresse: '', zone: '' }));
  };

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
      if (papsResult.disponible && papsResult.tarif !== null) setPrixLivraison(papsResult.tarif);
      else setPrixLivraison(0);
    } catch (error) {
      console.error('Erreur calcul Paps:', error);
      setPapsOption(null);
      setPrixLivraison(0);
    } finally {
      setIsCalculatingPrice(false);
    }
    if (errors.adresse) setErrors(prev => ({ ...prev, adresse: '' }));
  };

  const handleZoneSelect = (zone: ZonePublicInfo) => {
    setSelectedZone(zone);
    setZoneSearchQuery(zone.nom);
    setShowZoneDropdown(false);
    setSelectedZoneType('STANDARD');
    setPrixLivraison(livraisonGratuiteApplicable ? 0 : zone.tarif);
    if (errors.zone) setErrors(prev => ({ ...prev, zone: '' }));
  };

  const handleZoneTypeChange = (type: 'STANDARD' | 'EXPRESS' | 'URGENT') => {
    setSelectedZoneType(type);
    if (selectedZone) {
      let prix = 0;
      if (!livraisonGratuiteApplicable || type !== 'STANDARD') {
        switch (type) {
          case 'STANDARD': prix = selectedZone.tarif; break;
          case 'EXPRESS': prix = selectedZone.tarif_express || selectedZone.tarif * 1.5; break;
          case 'URGENT': prix = selectedZone.tarif_urgent || selectedZone.tarif * 2; break;
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
    if (!formData.clientNom.trim() || !formData.clientTelephone.trim()) return false;
    if (!isValidPhoneNumber(formData.clientTelephone)) return false;
    if (formData.typeRecuperation === 'domicile') {
      if (!selectedDeliveryMode) return false;
      if (selectedDeliveryMode === 'paps' && (!adresseLivraison || isCalculatingPrice)) return false;
      if (selectedDeliveryMode === 'zones' && !selectedZone) return false;
    }
    return true;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  if (!isOpen) return null;

  const hasMultipleDeliveryModes = deliveryConfig?.paps_actif && deliveryConfig?.zones_actif;
  const hasAnyDeliveryMode = deliveryConfig?.paps_actif || deliveryConfig?.zones_actif;

  const inputClass = (hasError?: boolean) =>
    `w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors ${
      hasError ? 'border-red-400' : 'border-gray-200 focus:border-gray-900'
    }`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Finaliser la commande</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Nom et Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.clientNom}
                onChange={(e) => handleInputChange('clientNom', e.target.value)}
                className={inputClass(!!errors.clientNom)}
                placeholder="Entrez votre nom complet"
              />
              {errors.clientNom && <p className="text-red-500 text-xs mt-1">{errors.clientNom}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email <span className="text-gray-400 font-normal">(facultatif)</span>
              </label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                className={inputClass()}
                placeholder="Entrez votre email"
              />
            </div>
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Téléphone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.clientTelephone}
              onChange={(e) => handleInputChange('clientTelephone', e.target.value)}
              className={inputClass(!!errors.clientTelephone)}
              placeholder="Entrez votre numéro de téléphone"
            />
            {errors.clientTelephone && <p className="text-red-500 text-xs mt-1">{errors.clientTelephone}</p>}
          </div>

          {/* Mode de récupération */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mode de récupération</label>
            <div className="grid grid-cols-2 gap-3">
              {(['boutique', 'domicile'] as const).map((type) => (
                <label
                  key={type}
                  className={`flex items-center gap-2.5 p-3 border rounded-xl cursor-pointer transition-all ${
                    formData.typeRecuperation === type
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.typeRecuperation === type}
                    onChange={() => handleRecuperationChange(type)}
                    className="w-4 h-4 accent-gray-900 rounded"
                  />
                  <span className="text-sm font-medium text-gray-800">
                    {type === 'boutique' ? '🏪 En boutique' : '🚚 À domicile'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Section Livraison à domicile */}
          {formData.typeRecuperation === 'domicile' && (
            <div className="space-y-4 border-t border-gray-100 pt-4">
              {loadingConfig ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-sm text-gray-400 mt-2">Chargement des options de livraison...</p>
                </div>
              ) : (
                <>
                  {hasMultipleDeliveryModes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de livraison <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => handleDeliveryModeChange('paps')}
                          className={`p-3 border rounded-xl text-left transition-all ${
                            selectedDeliveryMode === 'paps' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin size={16} strokeWidth={1.5} className="text-gray-600" />
                            <span className="text-sm font-semibold text-gray-900">Livraison Paps</span>
                          </div>
                          <p className="text-xs text-gray-400">Adresse exacte pour livraison à domicile</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeliveryModeChange('zones')}
                          className={`p-3 border rounded-xl text-left transition-all ${
                            selectedDeliveryMode === 'zones' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Package size={16} strokeWidth={1.5} className="text-gray-600" />
                            <span className="text-sm font-semibold text-gray-900">Livraison par zone</span>
                          </div>
                          <p className="text-xs text-gray-400">Sélectionnez parmi les zones définies</p>
                        </button>
                      </div>
                      {errors.deliveryMode && <p className="text-red-500 text-xs mt-1">{errors.deliveryMode}</p>}
                    </div>
                  )}

                  {/* Interface PAPS */}
                  {selectedDeliveryMode === 'paps' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Adresse de livraison <span className="text-red-500">*</span>
                        </label>
                        <AdresseAutocomplete
                          onAdresseSelect={handleAdresseSelect}
                          onCalculatingChange={setIsCalculatingPrice}
                          placeholder="Recherchez votre adresse..."
                          className={errors.adresse ? 'border-red-400' : ''}
                        />
                        {errors.adresse && <p className="text-red-500 text-xs mt-1">{errors.adresse}</p>}
                      </div>
                      {papsOption && papsOption.disponible && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex justify-between items-center">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Livraison Paps</p>
                            {papsOption.estimatedTime && (
                              <p className="text-xs text-gray-500">Délai estimé : {papsOption.estimatedTime}</p>
                            )}
                          </div>
                          <p className="text-sm font-bold text-gray-900">{papsOption.tarif?.toLocaleString('fr-FR')} Fcfa</p>
                        </div>
                      )}
                      {papsOption && !papsOption.disponible && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                          <p className="text-sm text-red-700">{papsOption.erreur || 'Livraison Paps non disponible pour cette adresse'}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Interface ZONES */}
                  {selectedDeliveryMode === 'zones' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Zone de livraison <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
                            className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 ${
                              errors.zone ? 'border-red-400' : 'border-gray-200 focus:border-gray-900'
                            }`}
                            placeholder="Recherchez votre zone..."
                          />
                          {showZoneDropdown && filteredZones.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                              {filteredZones.map((zone) => (
                                <button
                                  key={zone.id}
                                  type="button"
                                  onClick={() => handleZoneSelect(zone)}
                                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                    selectedZone?.id === zone.id ? 'bg-gray-50' : ''
                                  }`}
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{zone.nom}</p>
                                      {zone.description && <p className="text-xs text-gray-400">{zone.description}</p>}
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-semibold text-gray-900">
                                        {livraisonGratuiteApplicable ? (
                                          <span className="text-green-600">Gratuit</span>
                                        ) : (
                                          `${zone.tarif.toLocaleString('fr-FR')} Fcfa`
                                        )}
                                      </p>
                                      {zone.temps_min && zone.temps_max && (
                                        <p className="text-xs text-gray-400">{zone.temps_min}-{zone.temps_max} min</p>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                          {showZoneDropdown && filteredZones.length === 0 && zoneSearchQuery && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center text-sm text-gray-400">
                              Aucune zone trouvée pour "{zoneSearchQuery}"
                            </div>
                          )}
                        </div>
                        {errors.zone && <p className="text-red-500 text-xs mt-1">{errors.zone}</p>}
                      </div>

                      {selectedZone && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Options de livraison</label>
                          {/* Standard */}
                          <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${
                            selectedZoneType === 'STANDARD' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:bg-gray-50'
                          }`}>
                            <div className="flex items-center gap-3">
                              <input type="radio" name="zoneType" checked={selectedZoneType === 'STANDARD'} onChange={() => handleZoneTypeChange('STANDARD')} className="accent-gray-900" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Standard</p>
                                <p className="text-xs text-gray-400">Délai : {selectedZone.temps_min || 30}-{selectedZone.temps_max || 90} min</p>
                              </div>
                            </div>
                            <p className="text-sm font-bold text-gray-900">
                              {livraisonGratuiteApplicable ? <span className="text-green-600">Gratuit</span> : `${selectedZone.tarif.toLocaleString('fr-FR')} Fcfa`}
                            </p>
                          </label>
                          {selectedZone.tarif_express && (
                            <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${
                              selectedZoneType === 'EXPRESS' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:bg-gray-50'
                            }`}>
                              <div className="flex items-center gap-3">
                                <input type="radio" name="zoneType" checked={selectedZoneType === 'EXPRESS'} onChange={() => handleZoneTypeChange('EXPRESS')} className="accent-gray-900" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Express</p>
                                  <p className="text-xs text-gray-400">Livraison prioritaire plus rapide</p>
                                </div>
                              </div>
                              <p className="text-sm font-bold text-gray-900">{selectedZone.tarif_express.toLocaleString('fr-FR')} Fcfa</p>
                            </label>
                          )}
                          {selectedZone.tarif_urgent && (
                            <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${
                              selectedZoneType === 'URGENT' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:bg-gray-50'
                            }`}>
                              <div className="flex items-center gap-3">
                                <input type="radio" name="zoneType" checked={selectedZoneType === 'URGENT'} onChange={() => handleZoneTypeChange('URGENT')} className="accent-gray-900" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Urgent</p>
                                  <p className="text-xs text-gray-400">Livraison ultra-rapide garantie</p>
                                </div>
                              </div>
                              <p className="text-sm font-bold text-gray-900">{selectedZone.tarif_urgent.toLocaleString('fr-FR')} Fcfa</p>
                            </label>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {!hasAnyDeliveryMode && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                      <p className="text-sm text-gray-600">La livraison à domicile n'est pas disponible. Veuillez choisir la récupération en boutique.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Commentaire */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Commentaire <span className="text-gray-400 font-normal">(facultatif)</span>
            </label>
            <textarea
              value={formData.commentaire}
              onChange={(e) => handleInputChange('commentaire', e.target.value)}
              className={inputClass()}
              placeholder="Ajoutez un commentaire pour votre commande..."
              rows={2}
            />
          </div>

          {/* Paiement à la livraison */}
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <span className="text-lg">💰</span>
            <p className="text-sm font-semibold text-gray-900">Paiement à la livraison</p>
          </div>

          {/* Récapitulatif */}
          <div className="border border-gray-100 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Sous-total produits</span>
              <span className="font-medium text-gray-900">{getTotalPrice() ? getTotalPrice().toLocaleString('fr-FR') : '0'} Fcfa</span>
            </div>
            {formData.typeRecuperation === 'domicile' && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Frais de livraison</span>
                <span className="font-medium text-gray-900">
                  {prixLivraison === 0 ? <span className="text-green-600">Gratuit</span> : `${prixLivraison.toLocaleString('fr-FR')} Fcfa`}
                </span>
              </div>
            )}
            <div className="border-t border-gray-100 pt-2 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-900">Total à payer</span>
              <span className="text-base font-bold text-gray-900">
                {(getTotalPrice() + prixLivraison).toLocaleString('fr-FR')} Fcfa
              </span>
            </div>
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="flex-1 bg-gray-900 text-white text-sm font-medium py-2.5 px-4 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Traitement...' : isCalculatingPrice ? 'Calcul en cours...' : 'Confirmer la commande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;
