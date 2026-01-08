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
      const response = await fetch(`${API_BASE_URL}/public/orders/calculate-fee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Erreur lors du calcul des frais: ${response.status}`);
      }

      const data = await response.json();
      return {
        fraisLivraison: data.fraisLivraison || 0,
        zoneDetectee: data.zoneDetectee || null,
        estimatedTime: data.estimatedTime,
      };
    } catch (error) {
      console.error('Erreur calculateDeliveryFee:', error);
      // Retourner des frais par défaut en cas d'erreur
      return {
        fraisLivraison: 0,
        zoneDetectee: null,
      };
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
