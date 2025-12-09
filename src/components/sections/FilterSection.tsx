import React from 'react';
import ProductFilters from '../ProductFilters';

interface FilterSectionProps {
  onSortChange: (sort: string) => void;
  onPriceRangeChange: (min: number, max: number) => void;
  onSearchChange: (search: string) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  onSortChange,
  onPriceRangeChange,
  onSearchChange
}) => {
  return (
    <section className="py-8 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <ProductFilters
          onSortChange={onSortChange}
          onPriceRangeChange={onPriceRangeChange}
          onSearchChange={onSearchChange}
        />
      </div>
    </section>
  );
};

export default FilterSection;
