import React, { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface OrderForm {
  nomComplet: string;
  email: string;
  telephone: string;
  typeRecuperation: 'boutique' | 'domicile';
  adresseLivraison: string;
}

const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, clearCart, getTotalPrice } = useCart();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState<OrderForm>({
    nomComplet: '',
    email: '',
    telephone: '',
    typeRecuperation: 'boutique',
    adresseLivraison: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleOrder = () => {
    setShowOrderModal(true);
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!orderForm.nomComplet.trim()) {
      newErrors.nomComplet = 'Le nom complet est obligatoire';
    }
    
    if (!orderForm.telephone.trim()) {
      newErrors.telephone = 'Le téléphone est obligatoire';
    }
    
    if (orderForm.typeRecuperation === 'domicile' && !orderForm.adresseLivraison.trim()) {
      newErrors.adresseLivraison = 'L\'adresse de livraison est obligatoire';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmOrder = () => {
    if (validateForm()) {
      alert('Commande confirmée ! Merci pour votre achat.');
      clearCart();
      setShowOrderModal(false);
      setOrderForm({
        nomComplet: '',
        email: '',
        telephone: '',
        typeRecuperation: 'boutique',
        adresseLivraison: ''
      });
    }
  };

  const handleInputChange = (field: keyof OrderForm, value: string) => {
    setOrderForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRecuperationChange = (type: 'boutique' | 'domicile') => {
    setOrderForm(prev => ({ 
      ...prev, 
      typeRecuperation: type,
      adresseLivraison: type === 'boutique' ? '' : prev.adresseLivraison
    }));
    if (errors.adresseLivraison && type === 'boutique') {
      setErrors(prev => ({ ...prev, adresseLivraison: '' }));
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Votre panier est vide</h2>
          <p className="text-gray-600">Ajoutez des produits pour commencer vos achats</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">Mon Panier</h1>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b border-gray-200 py-3 sm:py-4 last:border-b-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <img src={item.image} alt={item.name} className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{item.name}</h3>
                  <p className="text-gray-600 text-sm sm:text-base">{item.price ? item.price.toLocaleString() : '0'} FCFA</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="text-right min-w-0">
                  <p className="font-semibold text-gray-800 text-sm sm:text-base">
                    {item.price && item.quantity ? (item.price * item.quantity).toLocaleString() : '0'} FCFA
                  </p>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-1 sm:p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <span className="text-lg sm:text-xl font-bold text-gray-800">Total:</span>
              <span className="text-xl sm:text-2xl font-bold text-blue-600">
                {getTotalPrice() ? getTotalPrice().toLocaleString() : '0'} FCFA
              </span>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleOrder}
                className="flex-1 bg-gradient-to-r from-[#389EBF] to-[#3B82F6] text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
              >
                Finaliser la commande
              </button>
              <button
                onClick={clearCart}
                className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm sm:text-base"
              >
                Vider le panier
              </button>
            </div>
          </div>
        </div>
      </div>

      {showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Finaliser la commande</h2>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={orderForm.nomComplet}
                  onChange={(e) => handleInputChange('nomComplet', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.nomComplet ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Entrez votre nom complet"
                />
                {errors.nomComplet && (
                  <p className="text-red-500 text-sm mt-1">{errors.nomComplet}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (facultatif)
                </label>
                <input
                  type="email"
                  value={orderForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Entrez votre email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={orderForm.telephone}
                  onChange={(e) => handleInputChange('telephone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.telephone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Entrez votre numéro de téléphone"
                />
                {errors.telephone && (
                  <p className="text-red-500 text-sm mt-1">{errors.telephone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode de récupération
                </label>
                <div className="space-y-3">
                  <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    orderForm.typeRecuperation === 'boutique' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <input
                      type="checkbox"
                      checked={orderForm.typeRecuperation === 'boutique'}
                      onChange={() => handleRecuperationChange('boutique')}
                      className="mr-3 w-5 h-5 text-blue-600 rounded"
                    />
                    <span className="font-medium text-gray-800">✅ Récupération en boutique</span>
                  </label>
                  <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    orderForm.typeRecuperation === 'domicile' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <input
                      type="checkbox"
                      checked={orderForm.typeRecuperation === 'domicile'}
                      onChange={() => handleRecuperationChange('domicile')}
                      className="mr-3 w-5 h-5 text-blue-600 rounded"
                    />
                    <span className="font-medium text-gray-800">🚚 Livraison à domicile</span>
                  </label>
                </div>
              </div>

              {orderForm.typeRecuperation === 'domicile' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse de livraison <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={orderForm.adresseLivraison}
                    onChange={(e) => handleInputChange('adresseLivraison', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.adresseLivraison ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Entrez votre adresse complète"
                    rows={3}
                  />
                  {errors.adresseLivraison && (
                    <p className="text-red-500 text-sm mt-1">{errors.adresseLivraison}</p>
                  )}
                </div>
              )}

              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mt-6">
                <p className="text-green-800 text-lg font-bold text-center">
                  💰 Paiement à la livraison
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Total à payer:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {getTotalPrice() ? getTotalPrice().toLocaleString() : '0'} FCFA
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t">
              <button
                onClick={() => setShowOrderModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmOrder}
                className="flex-1 bg-gradient-to-r from-[#389EBF] to-[#3B82F6] text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;