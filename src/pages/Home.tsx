import { useState, useEffect } from "react";
import Navbar from "../components/navbar/Navbar";
import ProduitsSection from "../components/sections/ProduitsSection";
import Footer from "../components/Footer/Footer";
import { useShop } from "../context/ShopContext";
import { ArrowRight } from "lucide-react";
import { getCategories } from "../services/productService";

const features = [
  {
    label: "Livraison rapide", sub: "24h après commande",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    color: "text-blue-500 bg-blue-50",
  },
  {
    label: "Customer Support 24/7", sub: "Accès instantané au support",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
      </svg>
    ),
    color: "text-blue-500 bg-blue-50",
  },
  {
    label: "Paiement 100% sécurisé", sub: "We ensure your money is safe",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="m9 12 2 2 4-4"/>
      </svg>
    ),
    color: "text-blue-500 bg-blue-50",
  },
  {
    label: "Retours faciles", sub: "30 Days Money-Back Guarantee",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
      </svg>
    ),
    color: "text-blue-500 bg-blue-50",
  },
];

const heroSlides = [
  {
    tag: "BIENVENUE DANS NOTRE BOUTIQUE",
    title: "Des produits\nde qualité",
    highlight: "30%",
    desc: "Découvrez notre sélection soigneusement choisie pour vous offrir le meilleur rapport qualité-prix.",
    bg: "from-gray-900 via-gray-800 to-gray-700",
    illustration: (
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-20">
        <circle cx="320" cy="80" r="120" fill="white" fillOpacity="0.15"/>
        <circle cx="350" cy="200" r="80" fill="white" fillOpacity="0.08"/>
        <rect x="200" y="60" width="140" height="180" rx="16" fill="white" fillOpacity="0.06" transform="rotate(-10 270 150)"/>
        <rect x="240" y="90" width="100" height="130" rx="12" fill="white" fillOpacity="0.06" transform="rotate(-10 290 155)"/>
        <circle cx="260" cy="100" r="30" fill="white" fillOpacity="0.1"/>
        <path d="M180 220 L280 220 L300 160 L160 160 Z" fill="white" fillOpacity="0.05"/>
      </svg>
    ),
  },
  {
    tag: "NOUVELLE COLLECTION",
    title: "Sélection\nExclusive",
    highlight: "25%",
    desc: "Explorez notre nouvelle collection et trouvez les produits qui correspondent à vos besoins.",
    bg: "from-slate-900 via-slate-800 to-zinc-800",
    illustration: (
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-20">
        <rect x="220" y="40" width="160" height="220" rx="20" fill="white" fillOpacity="0.08" transform="rotate(5 300 150)"/>
        <rect x="240" y="60" width="120" height="180" rx="16" fill="white" fillOpacity="0.06" transform="rotate(5 300 150)"/>
        <circle cx="300" cy="240" r="60" fill="white" fillOpacity="0.07"/>
        <circle cx="360" cy="60" r="80" fill="white" fillOpacity="0.06"/>
        <path d="M150 100 Q200 50 250 100 Q300 150 250 200 Q200 250 150 200 Q100 150 150 100Z" fill="white" fillOpacity="0.04"/>
        <circle cx="200" cy="150" r="20" fill="white" fillOpacity="0.12"/>
      </svg>
    ),
  },
  {
    tag: "OFFRE LIMITÉE",
    title: "Prix\nIncroyables",
    highlight: "40%",
    desc: "Profitez de nos meilleures offres avant qu'elles ne disparaissent. Stock limité.",
    bg: "from-neutral-900 via-stone-800 to-neutral-800",
    illustration: (
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-20">
        <polygon points="320,30 390,160 250,160" fill="white" fillOpacity="0.07"/>
        <polygon points="280,80 380,220 180,220" fill="white" fillOpacity="0.05"/>
        <circle cx="310" cy="120" r="90" fill="white" fillOpacity="0.06"/>
        <circle cx="370" cy="200" r="50" fill="white" fillOpacity="0.09"/>
        <rect x="200" y="50" width="60" height="60" rx="8" fill="white" fillOpacity="0.08" transform="rotate(30 230 80)"/>
        <rect x="230" y="150" width="80" height="80" rx="8" fill="white" fillOpacity="0.06" transform="rotate(15 270 190)"/>
      </svg>
    ),
  },
];

interface Category { id: number; nom: string; }

export default function Home() {
  const { boutiqueId, isLoading, error } = useShop();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Chargement des catégories pour la sidebar du hero
  useEffect(() => {
    if (isLoading) return;
    getCategories(boutiqueId).then(data => setCategories(data)).catch(() => {});
  }, [boutiqueId, isLoading]);

  // Auto-slide
  useEffect(() => {
    const t = setInterval(() => setCurrentSlide(i => (i + 1) % heroSlides.length), 5000);
    return () => clearInterval(t);
  }, []);

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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-16">

        {/* ── HERO + SIDEBAR CATÉGORIES ── */}
        <div id="carousel-section" className="max-w-screen-xl mx-auto px-4 lg:px-8 py-4">
          <div className="flex gap-4 items-stretch">

            {/* Sidebar catégories */}
            <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 bg-white border border-gray-100 rounded-xl">
              <div className="px-4 pt-4 pb-3">
                <h3 className="text-base font-bold text-gray-900">Catégorie</h3>
              </div>
              <ul className="flex-1">
                {categories.slice(0, 8).map(cat => (
                  <li key={cat.id} className="border-t border-gray-100">
                    <button
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`flex items-center gap-3 w-full text-left text-sm px-4 py-3 transition-colors ${
                        selectedCategoryId === cat.id
                          ? 'text-gray-900 font-semibold bg-gray-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-gray-400 flex-shrink-0">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                        </svg>
                      </span>
                      {cat.nom}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-100">
                <button
                  onClick={() => window.location.href = '/products'}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg leading-none">+</span>
                  Voir toutes les catégories
                </button>
              </div>
            </aside>

            {/* Hero slider */}
            <div className="flex-1 relative overflow-hidden rounded-xl bg-gray-900 min-h-[400px] lg:min-h-[480px]">
              {heroSlides.map((slide, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 flex items-center transition-opacity duration-700 ${
                    i === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  {/* Fond dégradé */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${slide.bg}`} />
                  {/* Illustration SVG abstraite */}
                  <div className="absolute inset-0 flex items-center justify-end">
                    {slide.illustration}
                  </div>
                  {/* Overlay gauche pour lisibilité du texte */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent z-10" />

                  {/* Texte */}
                  <div className="relative z-20 px-8 lg:px-12 max-w-md">
                    <p className="text-xs text-gray-300 uppercase tracking-widest mb-2">{slide.tag}</p>
                    <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-3 whitespace-pre-line">
                      {slide.title.split('\n')[0]}
                      <br />
                      <span className="text-white">{slide.title.split('\n')[1]}</span>
                    </h2>
                    <p className="text-sm text-gray-300 mb-1">
                      Réduction jusqu'à moins{' '}
                      <span className="text-orange-400 font-bold">{slide.highlight}</span>
                    </p>
                    <p className="text-xs text-gray-400 mb-5 leading-relaxed">{slide.desc}</p>
                    <button
                      onClick={() => window.location.href = '/products'}
                      className="flex items-center gap-2 bg-white text-gray-900 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      Achetez maintenant <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Dots */}
              <div className="absolute bottom-4 left-8 lg:left-12 flex gap-2 z-30">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`transition-all duration-300 rounded-full ${
                      i === currentSlide ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── BANDEAU FEATURES ── */}
        <div className="max-w-screen-xl mx-auto px-4 lg:px-8 mt-4">
          <div className="border border-gray-100 rounded-xl">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
              {features.map(({ icon, label, sub, color }) => (
                <div key={label} className="flex items-center gap-3 px-5 py-4">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${color}`}>
                    {icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{label}</p>
                    <p className="text-xs text-gray-400">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SECTION NOUVEAUTÉS ── */}
        <div id="products-section" className="max-w-screen-xl mx-auto px-4 lg:px-8 pt-10 pb-6">
          <ProduitsSection
            showAll={false}
            sectionTitle="Nouveauté"
            showNewBadge={true}
            selectedCategoryId={selectedCategoryId}
            sortBy="newest"
            priceRange={[0, 10000000]}
            searchTerm=""
            boutiqueId={boutiqueId}
            columns={4}
            limitHome={4}
          />
        </div>

        {/* ── SECTION BOUTIQUE ── */}
        <div className="max-w-screen-xl mx-auto px-4 lg:px-8 pb-10">
          <ProduitsSection
            showAll={false}
            sectionTitle="Boutique"
            showNewBadge={false}
            selectedCategoryId={selectedCategoryId}
            sortBy="popularity"
            priceRange={[0, 10000000]}
            searchTerm=""
            boutiqueId={boutiqueId}
            columns={4}
            limitHome={8}
            showViewAll={true}
          />
        </div>

        {/* ── SECTION COLLECTION DE PRODUIT ── */}
        <CollectionSection categories={categories} />

        <Footer />
      </main>
    </div>
  );
}

/* Bloc Collection — layout asymétrique 2 colonnes */
function CollectionSection({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  const collections = categories.slice(0, 3).map((cat, i) => ({
    nom: cat.nom,
    // couleurs alternées pour les blocs
    bg: i === 0 ? 'bg-gray-100' : 'bg-gray-50',
  }));

  return (
    <div className="max-w-screen-xl mx-auto px-4 lg:px-8 pb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Collection de produit</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Grande carte gauche */}
        {collections[0] && (
          <div className="relative bg-gray-100 rounded-xl overflow-hidden flex items-end min-h-64 cursor-pointer group hover:shadow-md transition-shadow">
            <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity">
              <div className="w-48 h-48 rounded-full bg-gray-300" />
            </div>
            <div className="relative z-10 p-6">
              <h3 className="text-xl font-bold text-gray-900">{collections[0].nom}</h3>
              <button
                onClick={() => window.location.href = '/products'}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mt-1 transition-colors"
              >
                Collection <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* 2 petites cartes droite */}
        <div className="flex flex-col gap-4">
          {collections.slice(1, 3).map(col => (
            <div
              key={col.nom}
              className="relative bg-gray-50 rounded-xl overflow-hidden flex items-end min-h-28 cursor-pointer group hover:shadow-md transition-shadow"
            >
              <div className="absolute inset-0 flex items-center justify-end pr-6 opacity-20 group-hover:opacity-30 transition-opacity">
                <div className="w-24 h-24 rounded-full bg-gray-300" />
              </div>
              <div className="relative z-10 p-4">
                <h3 className="text-base font-bold text-gray-900">{col.nom}</h3>
                <button
                  onClick={() => window.location.href = '/products'}
                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 mt-0.5 transition-colors"
                >
                  Collection <ArrowRight size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
