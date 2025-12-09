import { apiCall } from './api';

export interface ClientData {
  nom: string;
  email?: string;
  telephone: string;
  notes?: string;
}

export interface Client {
  id: number;
  nom: string;
  email?: string;
  telephone: string;
  notes?: string;
  dateCreation: string;
}

export const createClient = async (clientData: ClientData): Promise<Client> => {
  try {
    const response = await apiCall<Client>('/clients/create', {
      method: 'POST',
      body: JSON.stringify(clientData)
    });
    return response;
  } catch (error) {
    //console.error('Erreur lors de la création du client:', error);
    throw new Error('Impossible de créer le client. Veuillez réessayer.');
  }
};

export const getClientByPhone = async (telephone: string): Promise<Client | null> => {
  try {
    const response = await apiCall<{ data: Client[] }>('/clients', {
      method: 'GET'
    });

    // Extraire les données du wrapper ApiResponse
    const clients = response.data || [];

    // Chercher le client par téléphone
    const client = clients.find(c => c.telephone === telephone);
    return client || null;
  } catch (error) {
    // console.error('Erreur lors de la recherche du client:', error);
    return null;
  }
};
