import { useState } from "react";
import Navbar from "../components/navbar/Navbar";
import CarouselSection from "../components/sections/CarouselSection";
import CategorieSection from "../components/sections/CategorieSection";
import FilterSection from "../components/sections/FilterSection";
import ProduitsSection from "../components/sections/ProduitsSection";
import TestimonialsSection from "../components/sections/TestimonialsSection";
import Footer from "../components/Footer/Footer";
import { useShop } from "../context/ShopContext";

export default function Home() {
  const { boutiqueId, isLoading, error } = useShop();
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la boutique...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <p className="text-red-600">Erreur : {error}</p>
          <p className="text-gray-500 text-sm mt-2">Redirection vers la marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-16 md:pt-20">
        <div className="space-y-1 sm:space-y-1 lg:space-y-2">
          <CarouselSection />
          <CategorieSection
            selectedCategoryId={selectedCategoryId}
            onCategorySelect={setSelectedCategoryId}
            boutiqueId={boutiqueId}
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
              boutiqueId={boutiqueId}
            />
            <ProduitsSection
              showAll={true}
              selectedCategoryId={selectedCategoryId}
              sortBy={sortBy}
              priceRange={priceRange}
              searchTerm={searchTerm}
              boutiqueId={boutiqueId}
            />
          </div>
          <TestimonialsSection />
        </div>
        <Footer />
      </main>
    </div>
  );
}
