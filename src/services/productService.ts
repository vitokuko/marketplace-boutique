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

export const getProducts = async (
  categoryId?: number | null,
  boutiqueId?: number | null
): Promise<Product[]> => {
  try {
    let url = '/public/products';
    const params = new URLSearchParams();

    if (categoryId && categoryId !== 0) {
      params.append('category_id', categoryId.toString());
    }

    if (boutiqueId) {
      params.append('boutique_id', boutiqueId.toString());
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await apiCall<Product[]>(url);
    return response || [];
  } catch (error) {
    // console.error('Error fetching products:', error);
    return [];
  }
};

export const getCategories = async (boutiqueId?: number | null): Promise<Category[]> => {
  try {
    let url = '/public/categories';
    if (boutiqueId) {
      url += `?boutique_id=${boutiqueId}`;
    }

    const response = await apiCall<Category[]>(url);
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
