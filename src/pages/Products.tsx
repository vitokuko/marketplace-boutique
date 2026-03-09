import { useState } from "react";
import Navbar from "../components/navbar/Navbar";
import ProduitsSection from "../components/sections/ProduitsSection";
import Footer from "../components/Footer/Footer";
import { useShop } from "../context/ShopContext";
import SidebarFiltre from "../components/sections/SidebarFiltre";
import { ChevronDown } from "lucide-react";

const sortOptions = [
  { value: 'popularity', label: 'Plus populaire' },
  { value: 'rating', label: 'Mieux notés' },
  { value: 'newest', label: 'Nouveautés' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
];

export default function Products() {
  const { boutiqueId, isLoading, error } = useShop();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(0);
  const [sortBy, setSortBy] = useState('popularity');
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [searchTerm] = useState('');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Erreur : {error}</p>
      </div>
    );
  }

  const currentLabel = sortOptions.find(o => o.value === sortBy)?.label ?? 'Plus populaire';

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-16">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-8 py-8">

          {/* En-tête page */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Boutique</h1>
            <div className="flex items-center gap-4">
              {/* Dropdown tri */}
              <div className="relative">
                <button
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"
                >
                  Filtrer par : <span className="font-semibold text-gray-900">{currentLabel}</span>
                  <ChevronDown size={14} />
                </button>
                {sortDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-44">
                    {sortOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setSortDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          sortBy === opt.value ? 'font-semibold text-gray-900' : 'text-gray-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Layout sidebar + grille */}
          <div className="flex gap-8">
            {/* Sidebar filtre */}
            <aside className="hidden lg:block w-52 flex-shrink-0">
              <SidebarFiltre
                boutiqueId={boutiqueId}
                selectedCategoryId={selectedCategoryId}
                onCategorySelect={setSelectedCategoryId}
                priceMax={priceRange[1]}
                onPriceChange={(max) => setPriceRange([0, max])}
              />
            </aside>

            {/* Grille produits */}
            <div className="flex-1 min-w-0">
              <ProduitsSection
                showAll={true}
                selectedCategoryId={selectedCategoryId}
                sortBy={sortBy}
                priceRange={priceRange}
                searchTerm={searchTerm}
                boutiqueId={boutiqueId}
                columns={3}
              />
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}
