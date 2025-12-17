import React, { useState, useEffect } from 'react';
import { getCategories } from '../../services/productService';

interface Category {
  id: number;
  nom: string;
  description?: string;
}

interface CategorieSectionProps {
  selectedCategoryId: number | null;
  onCategorySelect: (id: number) => void;
  boutiqueId?: number | null;
}

const CategorieSection: React.FC<CategorieSectionProps> = ({ selectedCategoryId, onCategorySelect, boutiqueId = null }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories(boutiqueId);
        const allCategories = [{ id: 0, nom: 'Toutes' }, ...data];
        setCategories(allCategories);
      } catch (error) {
        // console.error('Erreur lors du chargement des catégories:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, [boutiqueId]);

  if (loading) {
    return (
      <section className="py-8 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-pulse">Chargement des catégories...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 sm:py-8 md:py-12 lg:py-16 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-8 sm:mb-12 text-center w-full mx-auto">Catégories</h2>

        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 w-fit mx-auto overflow-x-auto md:overflow-visible pb-4 md:pb-0">
          {categories.map((category) => {
            const isSelected = selectedCategoryId === category.id;
            const sizeClass = "w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24";

            return (
              <div
                key={category.id}
                onClick={() => onCategorySelect(category.id)}
                className="cursor-pointer group flex-shrink-0 md:flex-shrink"
              >
                <div
                  className={`${sizeClass} rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#389EBF] to-[#3B82F6] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-semibold text-center px-1 md:px-2 leading-tight">
                    {category.nom}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategorieSection;
