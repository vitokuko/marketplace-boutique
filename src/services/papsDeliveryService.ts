/**
 * Service de livraison unifié (Paps + Zones)
 * Gère le calcul des frais de livraison via les deux systèmes
 */

const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface PapsOption {
  disponible: boolean;
  tarif: number | null;
  estimatedTime: string | null;
  erreur: string | null;
}

export interface ZonesOption {
  disponible: boolean;
  zone_nom: string | null;
  zone_id: number | null;
  tarif: number | null;
  tarif_express: number | null;
  tarif_urgent: number | null;
  temps_min: number | null;
  temps_max: number | null;
  erreur: string | null;
}

export interface AllDeliveryOptionsResponse {
  paps: PapsOption;
  zones: ZonesOption;
  livraison_gratuite_applicable: boolean;
}

// Ancienne interface pour rétrocompatibilité
export interface DeliveryFeeResponse {
  fraisLivraison: number;
  zoneDetectee: string | null;
  estimatedTime?: string;
}

export interface DeliveryCalculationRequest {
  adresse: string;
  typeRecuperation: 'boutique' | 'domicile';
  boutiqueId?: number;
  totalCommande?: number;
}

class PapsDeliveryService {
  /**
   * Récupère toutes les options de livraison disponibles (Paps + Zones)
   */
  async getAllDeliveryOptions(request: DeliveryCalculationRequest): Promise<AllDeliveryOptionsResponse> {
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

      const data: AllDeliveryOptionsResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur getAllDeliveryOptions:', error);
      throw error;
    }
  }

  /**
   * Calcule les frais de livraison via l'API Paps (méthode legacy pour rétrocompatibilité)
   * @deprecated Utilisez getAllDeliveryOptions() à la place
   */
  async calculateDeliveryFee(request: DeliveryCalculationRequest): Promise<DeliveryFeeResponse> {
    try {
      const allOptions = await this.getAllDeliveryOptions(request);

      // Retourner l'option Paps par défaut si disponible, sinon Zones
      if (allOptions.paps.disponible && allOptions.paps.tarif !== null) {
        return {
          fraisLivraison: allOptions.paps.tarif,
          zoneDetectee: 'Paps Logistics',
          estimatedTime: allOptions.paps.estimatedTime || undefined,
        };
      } else if (allOptions.zones.disponible && allOptions.zones.tarif !== null) {
        return {
          fraisLivraison: allOptions.zones.tarif,
          zoneDetectee: allOptions.zones.zone_nom,
          estimatedTime: allOptions.zones.temps_min && allOptions.zones.temps_max
            ? `${allOptions.zones.temps_min}-${allOptions.zones.temps_max} min`
            : undefined,
        };
      }

      return {
        fraisLivraison: 0,
        zoneDetectee: null,
        estimatedTime: undefined,
      };
    } catch (error) {
      console.error('Erreur calculateDeliveryFee:', error);
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
