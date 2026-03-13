import './App.css'
import Home from './pages/Home'
import Products from './pages/Products'
import SuiviCommande from './pages/SuiviCommande'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { CategoryProvider } from './context/CategoryContext'
import { ShopProvider } from './context/ShopContext'
import ErrorBoundary from './components/ErrorBoundary'

// Layout avec contexte boutique (pour les pages qui en ont besoin)
function ShopLayout() {
  return (
    <ShopProvider>
      <CategoryProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/:shopSlug" element={<Home />} />
              <Route path="/:shopSlug/products" element={<Products />} />
            </Routes>
          </div>
        </CartProvider>
      </CategoryProvider>
    </ShopProvider>
  )
}

function AppLayout() {
  return (
    <Routes>
      {/* Suivi de commande — sans contexte boutique */}
      <Route path="/suivi" element={<SuiviCommande />} />
      <Route path="/:shopSlug/suivi" element={<SuiviCommande />} />

      {/* Toutes les autres routes avec contexte boutique */}
      <Route path="/*" element={<ShopLayout />} />
    </Routes>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppLayout />
      </Router>
    </ErrorBoundary>
  )
}

export default App
