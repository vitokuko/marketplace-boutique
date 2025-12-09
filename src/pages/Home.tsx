import { useState } from "react";
import Navbar from "../components/navbar/Navbar";
import CarouselSection from "../components/sections/CarouselSection";
import CategorieSection from "../components/sections/CategorieSection";
import FilterSection from "../components/sections/FilterSection";
import ProduitsSection from "../components/sections/ProduitsSection";
import TestimonialsSection from "../components/sections/TestimonialsSection";
import Footer from "../components/Footer/Footer";

export default function Home() {
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
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-16 md:pt-20">
        <div className="space-y-1 sm:space-y-1 lg:space-y-2">
          <CarouselSection />
          <CategorieSection
            selectedCategoryId={selectedCategoryId}
            onCategorySelect={setSelectedCategoryId}
          />
          <FilterSection
            onSortChange={handleSortChange}
            onPriceRangeChange={handlePriceRangeChange}
            onSearchChange={handleSearchChange}
          />
          <div id="products-section">
            <ProduitsSection
              showAll={false}
              selectedCategoryId={selectedCategoryId}
              sortBy={sortBy}
              priceRange={priceRange}
              searchTerm={searchTerm}
            />
            <ProduitsSection
              showAll={true}
              selectedCategoryId={selectedCategoryId}
              sortBy={sortBy}
              priceRange={priceRange}
              searchTerm={searchTerm}
            />
          </div>
          <TestimonialsSection />
        </div>
        <Footer />
      </main>
    </div>
  );
}
