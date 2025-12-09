import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface FilterProps {
  onSortChange: (sort: string) => void;
  onPriceRangeChange: (min: number, max: number) => void;
  onSearchChange: (search: string) => void;
}

const ProductFilters: React.FC<FilterProps> = ({ onSortChange, onPriceRangeChange, onSearchChange }) => {
  const [sortBy, setSortBy] = useState('popularity');
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const sortOptions = [
    { value: 'popularity', label: 'Popularité' },
    { value: 'rating', label: 'Mieux notés' },
    { value: 'newest', label: 'Nouveautés' },
    { value: 'price-asc', label: 'Prix croissant' },
    { value: 'price-desc', label: 'Prix décroissant' }
  ];



  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSortChange(value);
    setShowSortDropdown(false);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    const newRange = [priceRange[0], value];
    setPriceRange(newRange);
    onPriceRangeChange(newRange[0], newRange[1]);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchChange(value);
  };

  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-center">

        <div className="relative w-full sm:w-auto">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center justify-between w-full sm:w-48 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">
              {sortOptions.find(opt => opt.value === sortBy)?.label}
            </span>
            <ChevronDown size={16} className="text-gray-500" />
          </button>

          {showSortDropdown && (
            <div className="absolute top-full left-0 mt-1 w-full sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full sm:w-64">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prix: 0 - {priceRange[1] ? priceRange[1].toLocaleString() : '0'} FCFA
          </label>
          <input
            type="range"
            min="0"
            max="200000"
            step="5000"
            value={priceRange[1]}
            onChange={handlePriceChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        <div className="flex-1 relative max-w-md w-full lg:ml-8">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;