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

// Configuration publique de livraison d'une boutique
export interface ZonePublicInfo {
  id: number;
  nom: string;
  description: string | null;
  tarif: number;
  tarif_express: number | null;
  tarif_urgent: number | null;
  temps_min: number | null;
  temps_max: number | null;
}

export interface DeliveryConfigPublic {
  paps_actif: boolean;
  zones_actif: boolean;
  livraison_gratuite: boolean;
  seuil_livraison_gratuite: number | null;
  zones: ZonePublicInfo[];
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
      const allOptions = await this.getAllDeliveryOptions({
        adresse,
        typeRecuperation: 'domicile',
      });
      return allOptions.paps.disponible || allOptions.zones.disponible;
    } catch (error) {
      console.error('Erreur isDeliveryAvailable:', error);
      return false;
    }
  }

  /**
   * Récupère la configuration de livraison publique d'une boutique
   * Permet de savoir quels modes sont activés (Paps, Zones) et la liste des zones
   */
  async getDeliveryConfig(boutiqueId: number): Promise<DeliveryConfigPublic> {
    try {
      const response = await fetch(`${API_BASE_URL}/public/orders/delivery-config/${boutiqueId}`);

      if (!response.ok) {
        console.error('Erreur getDeliveryConfig:', response.status);
        // Retourner config par défaut en cas d'erreur
        return {
          paps_actif: false,
          zones_actif: false,
          livraison_gratuite: false,
          seuil_livraison_gratuite: null,
          zones: []
        };
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur getDeliveryConfig:', error);
      return {
        paps_actif: false,
        zones_actif: false,
        livraison_gratuite: false,
        seuil_livraison_gratuite: null,
        zones: []
      };
    }
  }

  /**
   * Calcule les frais de livraison Paps pour une adresse
   */
  async calculatePapsDeliveryFee(request: DeliveryCalculationRequest): Promise<PapsOption> {
    try {
      const allOptions = await this.getAllDeliveryOptions(request);
      return allOptions.paps;
    } catch (error) {
      console.error('Erreur calculatePapsDeliveryFee:', error);
      return {
        disponible: false,
        tarif: null,
        estimatedTime: null,
        erreur: 'Erreur lors du calcul'
      };
    }
  }
}

export const papsDeliveryService = new PapsDeliveryService();
