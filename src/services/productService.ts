import { apiCall } from './api';

export interface Product {
  id: number;
  nom: string;
  description?: string;
  prixUnitaire: number;
  image?: string;
  stock: number;
  actif: boolean;
  categorieId: number;
  categorie?: {
    id: number;
    nom: string;
    description?: string;
  };
  boutique?: {
    id: number;
    nom: string;
  };
}

export interface Category {
  id: number;
  nom: string;
  description?: string;
}

export const getProducts = async (categoryId?: number | null): Promise<Product[]> => {
  try {
    const url = categoryId && categoryId !== 0 ? `/public/products?category_id=${categoryId}` : '/public/products';
    const response = await apiCall<Product[]>(url);
    return response || [];
  } catch (error) {
    // console.error('Error fetching products:', error);
    return [];
  }
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await apiCall<Category[]>('/public/categories');
    return response || [];
  } catch (error) {
    //console.error('Error fetching categories:', error);
    return [];
  }
};

export const getProductById = async (id: number): Promise<Product | null> => {
  try {
    const response = await apiCall<Product>(`/public/products/${id}`);
    return response || null;
  } catch (error) {
    // console.error('Error fetching product by ID:', error);
    return null;
  }
};
