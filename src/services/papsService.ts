import { apiCall } from './api';

export interface PapsRateRequest {
  destination: string;
  origin: string;
  weight: number;
  height?: number;
  length?: number;
  width?: number;
  deliveryType?: string;
  activationESIM?: boolean;
}

export interface PapsRateResponse {
  distance: number;
  price: number;
  packageSize: string;
  size: number;
}

export interface PapsReceiver {
  firstname: string;
  lastname: string;
  phoneNumber: string;
  email: string;
  entreprise: string;
  address: string;
  specificationAddress: string;
}

export interface PapsParcel {
  packageSize: string;
  description: string;
  additionalInfo: string;
  Reference: string;
  price: number;
  amountCollect: number;
}

export interface PapsCreateTaskRequest {
  type: string;
  datePickup?: string;
  timePickup?: string;
  vehicleType: string;
  address?: string;
  receiver: PapsReceiver;
  parcels: PapsParcel[];
}

export const calculatePapsDeliveryRate = async (request: PapsRateRequest): Promise<PapsRateResponse> => {
  try {
    const response = await apiCall<{ success: boolean; data: PapsRateResponse; message: string }>(
      '/paps/calculate-rate',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );

    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Impossible de calculer le tarif de livraison Paps');
    }
  } catch (error) {
    console.error('Erreur lors du calcul du tarif Paps:', error);
    throw new Error('Impossible de calculer le tarif de livraison Paps. Veuillez réessayer.');
  }
};

export const createPapsDeliveryTask = async (request: PapsCreateTaskRequest): Promise<any> => {
  try {
    const response = await apiCall<{ success: boolean; data: any; message: string }>(
      '/paps/create-task',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );

    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Impossible de créer la tâche de livraison Paps');
    }
  } catch (error) {
    console.error('Erreur lors de la création de la tâche Paps:', error);
    throw new Error('Impossible de créer la tâche de livraison Paps. Veuillez réessayer.');
  }
};
