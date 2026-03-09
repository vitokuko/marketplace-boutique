import React, { useState } from 'react';
import { X, Heart, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface Product {
  id: number;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  currentPrice: number;
  originalPrice?: number;
  description?: string;
  category?: string;
  stock?: number;
}

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const inStock = (product.stock ?? 1) > 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.currentPrice,
      });
    }
    onClose();
  };

  const decrementQty = () => setQuantity(q => Math.max(1, q - 1));
  const incrementQty = () => setQuantity(q => Math.min(product.stock ?? 99, q + 1));

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      {/* Bouton fermer — hors du modal */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors cursor-pointer z-50"
      >
        <X size={24} strokeWidth={1.5} />
      </button>

      <div
        className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-1 md:grid-cols-2">

          {/* Image */}
          <div className="bg-gray-100 flex items-center justify-center p-12 min-h-80">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-72 w-full object-contain"
            />
          </div>

          {/* Infos */}
          <div className="p-8 flex flex-col justify-center">

            {/* Nom + badge stock */}
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-3xl font-bold text-gray-900">{product.name}</h2>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                inStock ? 'bg-blue-50 text-blue-600' : 'bg-red-100 text-red-600'
              }`}>
                {inStock ? 'En stock' : 'Rupture'}
              </span>
            </div>

            {/* Étoiles */}
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  width="16" height="16" viewBox="0 0 24 24"
                  fill={i < Math.floor(product.rating) ? '#F59E0B' : 'none'}
                  stroke="#F59E0B" strokeWidth="1.5"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
              <span className="text-sm text-gray-500 ml-1">{product.reviews} retours</span>
            </div>

            {/* Prix */}
            <p className="text-2xl font-bold text-gray-900 mb-4">
              {product.currentPrice.toLocaleString('fr-FR')} Fcfa
            </p>

            <hr className="border-gray-100 mb-4" />

            {/* Description */}
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              {product.description || 'Produit de qualité premium disponible dans notre boutique.'}
            </p>

            <hr className="border-gray-100 mb-5" />

            {/* Quantité + bouton panier + favori */}
            <div className="flex items-center gap-3">
              {/* Sélecteur quantité */}
              <div className="flex items-center gap-2">
                <button
                  onClick={decrementQty}
                  className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Minus size={14} strokeWidth={1.5} />
                </button>
                <span className="text-sm font-medium text-gray-900 w-6 text-center">{quantity}</span>
                <button
                  onClick={incrementQty}
                  className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Plus size={14} strokeWidth={1.5} />
                </button>
              </div>

              {/* Bouton ajouter au panier */}
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-medium py-3 px-6 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Ajouter au panier
                {/* Icône sac */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </button>

              {/* Favori */}
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`w-10 h-10 flex items-center justify-center border rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                  isFavorite
                    ? 'border-red-300 text-red-500 bg-red-50'
                    : 'border-blue-100 text-blue-400 bg-blue-50 hover:border-blue-300'
                }`}
              >
                <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={1.5} />
              </button>
            </div>

            {/* Catégorie */}
            {product.category && (
              <p className="text-sm text-gray-400 mt-5">
                <span className="font-semibold text-gray-700">Categorie:</span> {product.category}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
