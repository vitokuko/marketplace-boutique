import React, { useState } from 'react';
import { X, ShoppingCart, Heart,  Truck, Shield, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import DeliveryInfo from './DeliveryInfo';

interface Product {
  id: number;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  currentPrice: number;
  originalPrice?: number;
  description?: string;
}

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  
  if (!isOpen) return null;

  const colors = ['Bleu', 'Rouge', 'Vert', 'Noir'];
  const colorClasses = ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-black'];
  
  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.currentPrice
    });
    alert('Produit ajouté au panier !');
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-2 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl w-full h-auto max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6">
          <h2 className="text-2xl font-bold">Détails du produit</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={product.image}
                alt={product.name}
                className="w-full max-w-md h-80 object-contain bg-gray-50 p-4 rounded-lg"
              />
            </div>
            
            <div className="flex space-x-4 justify-center">
              <button
                onClick={handleAddToCart}
                className="flex-1 max-w-xs bg-[#4A90E2] text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2 hover:shadow-lg transition-shadow"
              >
                <ShoppingCart size={20} />
                <span>Ajouter au panier</span>
              </button>
              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className={`px-6 py-3 border-2 rounded-lg transition-colors ${
                  isFavorite 
                    ? 'border-red-400 text-red-500 bg-red-50' 
                    : 'border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-400'
                }`}
              >
                <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <Truck className="text-blue-500" size={24} />
                <span className="text-sm font-medium">Livraison rapide</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <Shield className="text-green-500" size={24} />
                <span className="text-sm font-medium">Garantie qualité</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <CreditCard className="text-purple-500" size={24} />
                <span className="text-sm font-medium">Paiement sécurisé</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
            
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description || 'Description détaillée du produit avec ses caractéristiques, fonctionnalités et spécifications techniques.'}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-800">{product.currentPrice ? product.currentPrice.toLocaleString() : '0'} FCFA</span>
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through">{product.originalPrice ? product.originalPrice.toLocaleString() : '0'} FCFA</span>
              )}
            </div>
            
            <div>
              <span className="text-green-600 font-medium">Stock : 15 articles disponibles</span>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Couleurs disponibles :</h3>
              <div className="flex space-x-3">
                {colors.map((color, index) => (
                  <div key={color} className="flex flex-col items-center space-y-1">
                    <div className={`w-8 h-8 rounded-full ${colorClasses[index]} border-2 border-gray-300 cursor-pointer hover:border-gray-500`}></div>
                    <span className="text-xs text-gray-600">{color}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <DeliveryInfo className="mt-6" />

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;