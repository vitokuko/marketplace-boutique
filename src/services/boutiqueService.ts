import { apiCall } from './api';

export interface BoutiqueData {
  nom: string;
  adresse: string;
  email: string;
  telephone: string;
  secteurActiviteId: string;
}

export interface Boutique {
  id: number;
  nom: string;
  adresse: string;
  email: string;
  telephone: string;
  secteurActiviteId: string;
  dateCreation: string;
}

export const createBoutique = async (boutiqueData: BoutiqueData): Promise<Boutique> => {
  try {
    const response = await apiCall<Boutique>('/boutiques/create', {
      method: 'POST',
      body: JSON.stringify(boutiqueData)
    });
    return response;
  } catch (error) {
    // console.error('Erreur lors de la création de la boutique:', error);
    throw new Error('Impossible de créer la boutique. Veuillez réessayer.');
  }
};

export const getBoutiqueByPhone = async (): Promise<Boutique | null> => {
  try {
    return null;
  } catch (error) {
    console.error('Erreur lors de la recherche de la boutique:', error);
    return null;
  }
};
