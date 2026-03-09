import React, { useState, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { getCategories } from '../../services/productService';

interface Category {
  id: number;
  nom: string;
}

interface SidebarFiltreProps {
  boutiqueId?: number | null;
  selectedCategoryId: number | null;
  onCategorySelect: (id: number) => void;
  priceMax: number;
  onPriceChange: (max: number) => void;
}

const SidebarFiltre: React.FC<SidebarFiltreProps> = ({
  boutiqueId,
  selectedCategoryId,
  onCategorySelect,
  priceMax,
  onPriceChange,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCategories(boutiqueId ?? null);
        setCategories(data);
      } catch {
        setCategories([]);
      }
    };
    load();
  }, [boutiqueId]);

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-900 text-sm">Filtre</span>
        <SlidersHorizontal size={16} className="text-gray-500" strokeWidth={1.5} />
      </div>

      {/* Catégories */}
      <div>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => onCategorySelect(0)}
              className={`w-full text-left text-sm py-1 transition-colors ${
                selectedCategoryId === 0 || selectedCategoryId === null
                  ? 'text-gray-900 font-semibold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Toutes
            </button>
          </li>
          {categories.map(cat => (
            <li key={cat.id}>
              <button
                onClick={() => onCategorySelect(cat.id)}
                className={`w-full text-left text-sm py-1 transition-colors ${
                  selectedCategoryId === cat.id
                    ? 'text-gray-900 font-semibold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {cat.nom}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Filtre prix */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-3">Prix</p>
        <input
          type="range"
          min={0}
          max={200000}
          step={5000}
          value={priceMax}
          onChange={(e) => onPriceChange(Number(e.target.value))}
          className="w-full h-1 bg-gray-200 rounded appearance-none cursor-pointer accent-gray-900"
        />
        <p className="text-xs text-gray-500 mt-2">
          {priceMax.toLocaleString()} Fcfa
        </p>
        <button
          onClick={() => onPriceChange(priceMax)}
          className="mt-4 w-full py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors cursor-pointer"
        >
          Appliquer
        </button>
      </div>
    </div>
  );
};

export default SidebarFiltre;
