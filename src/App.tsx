import './App.css'
import Home from './pages/Home'
import Products from './pages/Products'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { CategoryProvider } from './context/CategoryContext'
import { ShopProvider } from './context/ShopContext'
import ErrorBoundary from './components/ErrorBoundary'

// Layout component qui wrap les providers
function AppLayout() {
  return (
    <ShopProvider>
      <CategoryProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Routes marketplace globales (fallback) */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />

              {/* Routes boutique spécifique */}
              <Route path="/:shopSlug" element={<Home />} />
              <Route path="/:shopSlug/products" element={<Products />} />
            </Routes>
          </div>
        </CartProvider>
      </CategoryProvider>
    </ShopProvider>
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
