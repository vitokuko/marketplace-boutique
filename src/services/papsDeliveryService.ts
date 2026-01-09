/**
 * Service de livraison utilisant l'API Paps
 * Remplace l'ancien système basé sur les zones
 */

const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface DeliveryFeeResponse {
  fraisLivraison: number;
  zoneDetectee: string | null;
  estimatedTime?: string;
}

export interface DeliveryCalculationRequest {
  adresse: string;
  typeRecuperation: 'boutique' | 'domicile';
  boutiqueId?: number;
}

class PapsDeliveryService {
  /**
   * Calcule les frais de livraison via l'API Paps
   */
  async calculateDeliveryFee(request: DeliveryCalculationRequest): Promise<DeliveryFeeResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/public/orders/calculate-delivery-fee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.detail || 'Impossible de calculer les frais de livraison';

        throw new Error(errorMessage);
      }

      const data = await response.json();
      return {
        fraisLivraison: data.fraisLivraison || 0,
        zoneDetectee: data.zoneDetectee || null,
        estimatedTime: data.tempsEstime || data.estimatedTime,
      };
    } catch (error) {
      console.error('Erreur calculateDeliveryFee:', error);
      // Propager l'erreur pour que le composant puisse l'afficher
      throw error;
    }
  }

  /**
   * Vérifie si la livraison est disponible pour une adresse
   */
  async isDeliveryAvailable(adresse: string): Promise<boolean> {
    try {
      const result = await this.calculateDeliveryFee({
        adresse,
        typeRecuperation: 'domicile',
      });
      return result.fraisLivraison > 0 || result.zoneDetectee !== null;
    } catch (error) {
      console.error('Erreur isDeliveryAvailable:', error);
      return false;
    }
  }
}

export const papsDeliveryService = new PapsDeliveryService();
