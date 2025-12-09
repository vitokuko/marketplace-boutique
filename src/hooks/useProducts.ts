import { useState, useEffect } from 'react';
import { getProducts, getCategories, type Product, type Category } from '../services/productService';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        setError('Erreur lors du chargement des produits');
        //console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { products, categories, loading, error };
};