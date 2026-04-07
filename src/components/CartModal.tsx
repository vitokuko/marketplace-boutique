import React, { useState } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { PRODUCT_PLACEHOLDER } from '../utils/placeholders';
import OrderForm from './OrderForm';
import OrderTracking from './OrderTracking';
import type { Order } from '../services/orderService';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { items, updateQuantity, removeFromCart, clearCart, getTotalPrice } = useCart();
  const [orderFormOpen, setOrderFormOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    order: Order;
    items: { name: string; quantity: number; price: number }[];
    typeRecuperation: 'boutique' | 'domicile';
  } | null>(null);

  if (!isOpen) return null;

  if (confirmedOrder) {
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
        <div className="flex justify-end px-4 pt-4">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>
        <OrderTracking
          order={confirmedOrder.order}
          items={confirmedOrder.items}
          typeRecuperation={confirmedOrder.typeRecuperation}
        />
      </div>
    );
  }

  const handleOrder = () => {
    setOrderFormOpen(true);
  };

  const handleOrderSuccess = (order: Order, typeRecuperation: 'boutique' | 'domicile') => {
    const snapshot = items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));
    setConfirmedOrder({ order, items: snapshot, typeRecuperation });
    setOrderFormOpen(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-end z-50"
      onClick={onClose}
    >
      <div
        className="bg-white h-full w-full max-w-md flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Mon Panier</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <ShoppingBag size={48} strokeWidth={1} className="text-gray-300 mb-4" />
              <h3 className="text-base font-semibold text-gray-700 mb-1">Votre panier est vide</h3>
              <p className="text-sm text-gray-400">Ajoutez des produits pour commencer vos achats</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
                  {/* Image */}
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center">
                    <img src={item.image || PRODUCT_PLACEHOLDER} alt={item.name} className="w-full h-full object-contain p-1 rounded-xl" onError={(e) => { (e.currentTarget as HTMLImageElement).src = PRODUCT_PLACEHOLDER; }} />
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{item.name}</h4>
                    <p className="text-sm text-gray-500 mt-0.5">{item.price ? item.price.toLocaleString('fr-FR') : '0'} Fcfa</p>

                    {/* Quantité */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded-full text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <Minus size={11} strokeWidth={1.5} />
                      </button>
                      <span className="text-sm font-medium text-gray-900 w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded-full text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <Plus size={11} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>

                  {/* Prix total + supprimer */}
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-sm font-bold text-gray-900">
                      {item.price ? (item.price * item.quantity).toLocaleString('fr-FR') : '0'} Fcfa
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 size={15} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer — total + actions */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-gray-100">
            <div className="flex justify-between items-center mb-5">
              <span className="text-sm text-gray-500">Total</span>
              <span className="text-lg font-bold text-gray-900">
                {getTotalPrice() ? getTotalPrice().toLocaleString('fr-FR') : '0'} Fcfa
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleOrder}
                className="flex-1 bg-gray-900 text-white text-sm font-medium py-3 rounded-full hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Commander
              </button>
              <button
                onClick={clearCart}
                className="px-5 py-3 border border-gray-200 text-gray-500 text-sm rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Vider
              </button>
            </div>
          </div>
        )}
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
