import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Eye, Heart, Share2, Star } from 'lucide-react';
import produit1 from '../../assets/Produit 1.png';
import ProductModal from '../ProductModal';
import SharePopup from '../SharePopup';
import { useCart } from '../../context/CartContext';
import { getProducts } from '../../services/productService';

interface Product {
  id: number;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  currentPrice: number;
  category: string;
  boutique: string;
  tags: string[];
  stock: number;
  categoryId: number;
  description?: string;
}

interface ProduitsProps {
  showAll?: boolean;
  selectedCategoryId?: number | null;
  sortBy?: string;
  priceRange?: number[];
  searchTerm?: string;
  boutiqueId?: number | null;
}

const ProduitsSection: React.FC<ProduitsProps> = ({
  showAll = false,
  selectedCategoryId = 0,
  sortBy = 'popularity',
  priceRange = [0, 200000],
  searchTerm = '',
  boutiqueId = null
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sharePopup, setSharePopup] = useState<{ isOpen: boolean; product: Product | null; position: { top: number; left: number } }>({ isOpen: false, product: null, position: { top: 0, left: 0 } });
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts(selectedCategoryId, boutiqueId);
        const displayProducts: Product[] = data.map(p => ({
          id: p.id,
          name: p.nom,
          image: p.image || produit1,
          rating: 4.5,
          reviews: Math.floor(Math.random() * 200) + 10,
          currentPrice: p.prixUnitaire,
          category: p.categorie?.nom || 'Autre',
          boutique: p.boutique?.nom || 'Boutique inconnue',
          tags: [p.categorie?.nom || 'Produit'],
          stock: p.stock,
          categoryId: p.categorieId,
          description: p.description
        }));
        setProducts(displayProducts);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [selectedCategoryId, boutiqueId]);
  
  const filteredAndSortedProducts = useMemo(() => {
    if (products.length === 0) return [];

    let filtered = [...products];

    filtered = filtered.filter(product =>
      product.currentPrice >= priceRange[0] && product.currentPrice <= priceRange[1]
    );

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.boutique.toLowerCase().includes(term)
      );
    }

    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'price-asc':
        filtered.sort((a, b) => a.currentPrice - b.currentPrice);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.currentPrice - a.currentPrice);
        break;
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
        break;
      case 'popularity':
      default:
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
    }

    return filtered;
  }, [products, selectedCategoryId, sortBy, priceRange, searchTerm]);

  if (loading) {
    return (
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-pulse">Chargement des produits...</div>
        </div>
      </section>
    );
  }
  
  const productsPerPage = showAll ? 9 : 3;
  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage);
  
  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.currentPrice
    });
  };
  
  const handleShare = (product: Product, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setSharePopup({
      isOpen: true,
      product,
      position: {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX
      }
    });
  };
  
  const toggleFavorite = (productId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl hover:bg-gray-100 transition-all duration-300 cursor-pointer">
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-56 object-contain bg-gray-50 p-2 group-hover:scale-110 transition-transform duration-300"
        />
        {product.stock <= 5 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
            Stock faible
          </span>
        )}
        <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => openModal(product)}
            className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 cursor-pointer"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => toggleFavorite(product.id)}
            className={`bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors cursor-pointer ${
              favorites.has(product.id) ? 'text-red-500' : 'text-gray-600'
            }`}
          >
            <Heart size={16} fill={favorites.has(product.id) ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={(e) => handleShare(product, e)}
            className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 cursor-pointer"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2">{product.name}</h3>

        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'} />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">
            {product.rating}
          </span>
        </div>

        <div className="flex items-center mb-3">
          <span className="text-lg font-bold text-gray-800">{product.currentPrice ? product.currentPrice.toLocaleString() : '0'} XOF</span>
          <span className="text-sm text-gray-500 ml-2">Stock: {product.stock}</span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{product.category}</span>
          <span className="text-xs text-gray-500 italic">| {product.boutique}</span>
        </div>

        <button
          onClick={() => handleAddToCart(product)}
          disabled={product.stock === 0}
          className="w-full bg-gradient-to-r from-[#389EBF] to-[#3B82F6] text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <ShoppingCart size={18} />
          <span>{product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <section className="py-4 sm:py-6 lg:py-8 px-3 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 sm:mb-8 text-center">
          {showAll ? 'TOUS NOS PRODUITS' : 'NOUVEAUX PRODUITS'}
        </h2>

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6`}>
          {filteredAndSortedProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {filteredAndSortedProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aucun produit trouvé</p>
            <p className="text-gray-400 text-sm mt-2">Aucun produit disponible pour le moment</p>
          </div>
        )}
        
        {showAll && totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-[#389EBF] text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            isOpen={isModalOpen}
            onClose={closeModal}
          />
        )}
        
        <SharePopup
          isOpen={sharePopup.isOpen}
          onClose={() => setSharePopup({ ...sharePopup, isOpen: false })}
          product={sharePopup.product!}
          position={sharePopup.position}
        />
      </div>
    </section>
  );
};

export default ProduitsSection;