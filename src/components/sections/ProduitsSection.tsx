import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Eye, Heart, Share2, Star } from 'lucide-react';
import { PRODUCT_PLACEHOLDER } from '../../utils/placeholders';
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
  sectionTitle?: string;
  showNewBadge?: boolean;
  columns?: 3 | 4;
  limitHome?: number;
  showViewAll?: boolean;
}

const ProduitsSection: React.FC<ProduitsProps> = ({
  showAll = false,
  selectedCategoryId = 0,
  sortBy = 'popularity',
  priceRange = [0, 10000000],
  searchTerm = '',
  boutiqueId = null,
  sectionTitle,
  showNewBadge = false,
  columns = 3,
  limitHome,
  showViewAll = false,
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
          image: p.image || PRODUCT_PLACEHOLDER,
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
      <section className="py-8">
        <div className="text-center animate-pulse text-gray-400">Chargement des produits...</div>
      </section>
    );
  }

  const productsPerPage = showAll && !limitHome ? 9 : limitHome ?? 4;
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

  const gridCols = columns === 4
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  const displayedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="group bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300">
      {/* Zone image + bouton panier intégré */}
      <div className="relative bg-gray-100 rounded-xl mx-1 mt-1 overflow-hidden">
        {/* Badge NOUVEAU */}
        {showNewBadge && (
          <span className="absolute top-3 left-3 z-10 bg-white text-gray-900 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
            NOUVEAU
          </span>
        )}

        {/* Actions — visibles au hover */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => openModal(product)}
            className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer shadow-sm"
          >
            <Eye size={14} className="text-gray-500" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => toggleFavorite(product.id)}
            className={`w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer shadow-sm ${
              favorites.has(product.id) ? 'text-red-500' : 'text-gray-500'
            }`}
          >
            <Heart size={14} fill={favorites.has(product.id) ? 'currentColor' : 'none'} strokeWidth={1.5} />
          </button>
          <button
            onClick={(e) => handleShare(product, e)}
            className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer shadow-sm"
          >
            <Share2 size={14} className="text-gray-500" strokeWidth={1.5} />
          </button>
        </div>

        {/* Image produit */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-52 object-contain p-6"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = PRODUCT_PLACEHOLDER; }}
        />

        {/* Bouton panier — dans la zone image, pleine largeur, visible au hover */}
        <button
          onClick={() => handleAddToCart(product)}
          disabled={product.stock === 0}
          className="absolute bottom-0 left-0 right-0 bg-gray-900 text-white text-sm font-medium py-2.5 flex items-center justify-center gap-2 hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer opacity-0 group-hover:opacity-100 translate-y-full group-hover:translate-y-0"
        >
          <ShoppingCart size={15} strokeWidth={1.5} />
          <span>{product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}</span>
        </button>
      </div>

      {/* Infos produit */}
      <div className="px-2 pt-3 pb-3">
        <h3 className="text-sm font-bold text-gray-900 mb-1.5 line-clamp-2 leading-snug">
          {product.name}
        </h3>
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={13}
                fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'}
                strokeWidth={1.5}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">{product.rating}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">
            {product.currentPrice ? product.currentPrice.toLocaleString('fr-FR') : '0'} XOF
          </span>
          <span className="text-gray-300 text-sm">/</span>
          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
            {product.category}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <section>
      {/* En-tête section */}
      {sectionTitle && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{sectionTitle}</h2>
          {/* Dots de navigation — visibles seulement si plusieurs pages */}
          {totalPages > 1 && !showAll && (
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    currentPage === i + 1
                      ? 'w-4 h-4 border-2 border-gray-900 bg-white'
                      : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className={`grid ${gridCols} gap-4`}>
        {displayedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filteredAndSortedProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun produit disponible pour le moment</p>
        </div>
      )}

      {/* Bouton Voir tout (home) */}
      {showViewAll && filteredAndSortedProducts.length > productsPerPage && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => window.location.href = '/products'}
            className="px-8 py-3 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Voir tout
          </button>
        </div>
      )}

      {/* Pagination (page /products) */}
      {showAll && !limitHome && totalPages > 1 && (
        <div className="flex items-center justify-between mt-10">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            ← Précédent
          </button>

          <div className="flex items-center gap-1">
            {(() => {
              const pages: (number | string)[] = [];
              if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                pages.push(1, 2, 3, '...', totalPages - 2, totalPages - 1, totalPages);
              }
              return pages.map((p, i) =>
                p === '...' ? (
                  <span key={i} className="px-1 text-gray-400 text-sm">...</span>
                ) : (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(p as number)}
                    className={`w-8 h-8 text-sm rounded transition-colors cursor-pointer ${
                      currentPage === p
                        ? 'bg-gray-900 text-white font-semibold'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                )
              );
            })()}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Suivant →
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
    </section>
  );
};

export default ProduitsSection;