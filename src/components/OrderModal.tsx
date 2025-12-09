import React, { useState } from 'react';
import { X } from 'lucide-react';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (orderData: any) => void;
  totalPrice: number;
}

const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose, onConfirm, totalPrice }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    pickupInStore: false,
    homeDelivery: false,
    deliveryAddress: ''
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        // Si on coche une option, on décoche l'autre
        ...(name === 'pickupInStore' && checked ? { homeDelivery: false } : {}),
        ...(name === 'homeDelivery' && checked ? { pickupInStore: false } : {})
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phone) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    if (!formData.pickupInStore && !formData.homeDelivery) {
      alert('Veuillez choisir un mode de récupération');
      return;
    }
    
    if (formData.homeDelivery && !formData.deliveryAddress) {
      alert('Veuillez saisir votre adresse de livraison');
      return;
    }

    onConfirm(formData);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-3">
          <div className="flex-1"></div>
          <h2 className="text-2xl font-bold text-center">Finaliser la commande</h2>
          <div className="flex-1 flex justify-end">
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom complet <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Mode de récupération <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="pickupInStore"
                  checked={formData.pickupInStore}
                  onChange={handleInputChange}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Récupération en boutique</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="homeDelivery"
                  checked={formData.homeDelivery}
                  onChange={handleInputChange}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Livraison à domicile</span>
              </label>
            </div>
          </div>

          {formData.homeDelivery && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse de livraison <span className="text-red-500">*</span>
              </label>
              <textarea
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Votre adresse complète..."
                required={formData.homeDelivery}
              />
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total à payer :</span>
              <span className="text-xl font-bold text-blue-600">
                {totalPrice ? totalPrice.toLocaleString() : '0'} FCFA
              </span>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
            <p className="text-green-800 font-semibold text-lg">
              💰 Paiement à la livraison
            </p>
            <p className="text-green-600 text-sm mt-1">
              Vous payerez lors de la réception de votre commande
            </p>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#389EBF] to-[#3B82F6] text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
            >
              Confirmer la commande
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;