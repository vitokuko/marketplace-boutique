import { useState } from "react";
import Navbar from "../components/navbar/Navbar";
import CategorieSection from "../components/sections/CategorieSection";
import FilterSection from "../components/sections/FilterSection";
import ProduitsSection from "../components/sections/ProduitsSection";
import Footer from "../components/Footer/Footer";

export default function Products() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(0);
  const [sortBy, setSortBy] = useState('popularity');
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange([min, max]);
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
  };

  return (
    <div>
      <Navbar />
      <div className="pt-16">
        <CategorieSection
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={setSelectedCategoryId}
        />
        <FilterSection
          onSortChange={handleSortChange}
          onPriceRangeChange={handlePriceRangeChange}
          onSearchChange={handleSearchChange}
        />
        <ProduitsSection
          showAll={true}
          selectedCategoryId={selectedCategoryId}
          sortBy={sortBy}
          priceRange={priceRange}
          searchTerm={searchTerm}
        />
        <Footer />
      </div>
    </div>
  );
}
