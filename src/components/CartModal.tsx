import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { livraisonService } from '../services/livraisonService';
import type { ConfigurationMarchand } from '../models/livraison-models';
import OrderForm from './OrderForm';
import FreeDeliveryBanner from './FreeDeliveryBanner';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { items, updateQuantity, removeFromCart, clearCart, getTotalPrice } = useCart();
  const [orderFormOpen, setOrderFormOpen] = useState(false);
  const [configMarchand, setConfigMarchand] = useState<ConfigurationMarchand | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      const config = await livraisonService.getConfigurationMarchand(1);
      setConfigMarchand(config);
    };
    
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOrder = () => {
    setOrderFormOpen(true);
  };
  
  const handleOrderSuccess = (orderId: number) => {
    alert(`Commande #${orderId} créée avec succès ! Merci pour votre achat.`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-sm sm:max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Mon Panier</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Votre panier est vide</h3>
              <p className="text-gray-600">Ajoutez des produits pour commencer vos achats</p>
            </div>
          ) : (
            <>
              {configMarchand?.livraisonGratuite && configMarchand.seuilLivraisonGratuite && (
                <FreeDeliveryBanner
                  currentTotal={getTotalPrice()}
                  freeDeliveryThreshold={configMarchand.seuilLivraisonGratuite || 0}
                  isEligible={getTotalPrice() >= (configMarchand.seuilLivraisonGratuite || 0)}
                />
              )}

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <div className="flex items-center space-x-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                      <div>
                        <h4 className="font-semibold text-gray-800">{item.name}</h4>
                        <p className="text-gray-600">{item.price ? item.price.toLocaleString() : '0'} FCFA</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="text-right min-w-[80px]">
                        <p className="font-semibold text-gray-800">
                          {item.price ? (item.price * item.quantity).toLocaleString() : '0'} FCFA
                        </p>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-800">Total produits:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {getTotalPrice() ? getTotalPrice().toLocaleString() : '0'} FCFA
                    </span>
                  </div>
                  {configMarchand?.livraisonGratuite && configMarchand.seuilLivraisonGratuite &&
                   getTotalPrice() >= (configMarchand.seuilLivraisonGratuite || 0) && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex justify-between items-center text-green-600">
                        <span className="font-medium">Livraison:</span>
                        <span className="font-bold">Gratuite 🎉</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={handleOrder}
                    className="flex-1 bg-gradient-to-r from-[#389EBF] to-[#3B82F6] text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                  >
                    Commander maintenant
                  </button>
                  <button
                    onClick={clearCart}
                    className="px-6 py-3 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Vider
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      <OrderForm
        isOpen={orderFormOpen}
        onClose={() => setOrderFormOpen(false)}
        onSuccess={handleOrderSuccess}
      />
    </div>
  );
};

export default CartModal;