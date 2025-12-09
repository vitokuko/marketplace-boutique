const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success?: boolean;
}

export async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    //console.log(`Appel API vers: ${API_BASE_URL}${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    // console.log(`Réponse API status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      // console.error(`Erreur API ${response.status}:`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    // console.log('Données reçues:', data);
    return data;
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    throw error;
  }
}