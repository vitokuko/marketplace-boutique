import './App.css'
import Home from './pages/Home'
import Products from './pages/Products'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { CategoryProvider } from './context/CategoryContext'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <CategoryProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
              </Routes>
            </div>
          </Router>
        </CartProvider>
      </CategoryProvider>
    </ErrorBoundary>
  )
}

export default App
