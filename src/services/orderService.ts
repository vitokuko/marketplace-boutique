import { apiCall } from './api';
import type { CartItem } from '../context/CartContext';

export interface OrderData {
  clientNom: string;
  clientEmail?: string;
  clientTelephone: string;
  adresse: string;
  typeRecuperation: 'boutique' | 'domicile';
  commentaire?: string;
  items: {
    produitId: number;
    quantite: number;
    prixUnitaire: number;
  }[];
  total: number;
  fraisLivraison?: number;
}

export interface DeliveryFeeRequest {
  adresse: string;
  typeRecuperation: 'boutique' | 'domicile';
  boutiqueId?: number;
}

export interface DeliveryFeeResponse {
  fraisLivraison: number;
  zoneDetectee: string;
  tempsEstime: string;
  methode: string;
}

export interface AddressSuggestion {
  type: string;
  nom: string;
  localite?: string;
  adresse_complete: string;
  zone_priorite: number;
  tarif_estime?: number;
  temps_estime?: string;
}

export interface Order {
  id: number;
  dateCreation: string;
  statut: string;
  total: number;
  fraisLivraison?: number;
  zoneDetectee?: string;
  client: {
    nom: string;
    telephone: string;
  };
}

export const createOrder = async (orderData: OrderData): Promise<Order> => {
  try {
    const backendOrderData = {
      clientNom: orderData.clientNom,
      clientEmail: orderData.clientEmail || '',
      clientTelephone: orderData.clientTelephone,
      adresse: orderData.adresse,
      typeRecuperation: orderData.typeRecuperation,
      commentaire: orderData.commentaire,
      items: orderData.items.map(item => ({
        produitId: item.produitId,
        quantite: item.quantite,
        prixUnitaire: item.prixUnitaire
      })),
      total: orderData.total,
      fraisLivraison: orderData.fraisLivraison
    };

    //console.log('Données envoyées à l\'API:', backendOrderData);

    const response = await apiCall<any>('/public/orders/', {
      method: 'POST',
      body: JSON.stringify(backendOrderData)
    });

    // console.log('Réponse de l\'API:', response);

    if (response.success && response.data) {
      return response.data;
    } else if (response.id) {
      return response;
    } else {
      throw new Error('Format de réponse inattendu');
    }
  } catch (error) {
    //console.error('Erreur lors de la création de la commande:', error);
    throw new Error('Impossible de créer la commande. Veuillez réessayer.');
  }
};

export const calculateDeliveryFee = async (request: DeliveryFeeRequest): Promise<DeliveryFeeResponse> => {
  try {
    const response = await apiCall<DeliveryFeeResponse>('/public/orders/calculate-delivery-fee', {
      method: 'POST',
      body: JSON.stringify(request)
    });
    
    return response;
  } catch (error) {
    // console.error('Erreur lors du calcul des frais de livraison:', error);
    throw new Error('Impossible de calculer les frais de livraison.');
  }
};

export const getAddressSuggestions = async (query: string, limit: number = 10): Promise<AddressSuggestion[]> => {
  try {
    if (!query || query.length < 2) {
      return [];
    }
    
    const response = await apiCall<AddressSuggestion[]>(`/public/orders/address-suggestions?q=${encodeURIComponent(query)}&limit=${limit}`, {
      method: 'GET'
    });
    
    return response;
  } catch (error) {
    //console.error('Erreur lors de la recherche d\'adresses:', error);
    return [];
  }
};

export const convertCartToOrderItems = (cartItems: CartItem[]) => {
  return cartItems.map(item => ({
    produitId: item.id,
    quantite: item.quantity,
    prixUnitaire: item.price
  }));
};
