import type { ZoneLivraison } from "../models/livraison-models";

const API_BASE_URL = import.meta.env.VITE_API_URL;

class ZoneService {
  async getZones(boutiqueId?: number): Promise<ZoneLivraison[]> {
    try {
      let url = `${API_BASE_URL}/public/livreurs/zones`;
      if (boutiqueId) {
        url += `?boutiqueId=${boutiqueId}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Erreur chargement zones');

      const zones = await response.json();

      // Mapper les zones de l'API vers le format attendu
      return zones.map((zone: any) => ({
        id: zone.id,
        nom: zone.nom,
        description: zone.description || zone.nom,
        tarifStandard: zone.prixBase || zone.tarif || 0,
        tarifExpress: zone.prixExpress || (zone.tarif * 1.5) || 0,
        tarifUrgent: zone.prixUrgent || (zone.tarif * 2) || 0,
        statut: zone.actif ? 'ACTIF' : 'INACTIF'
      }));
    } catch (error) {
      console.error('Erreur getZones:', error);
      const saved = localStorage.getItem('delivery_zones');
      if (saved) {
        return JSON.parse(saved);
      }
      return [];
    }
  }

  async saveZone(zone: Partial<ZoneLivraison>, boutiqueId?: number): Promise<ZoneLivraison> {
    try {
      const response = await fetch(`${API_BASE_URL}/public/livreurs/zones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...zone, boutiqueId })
      });
      if (!response.ok) throw new Error('Erreur sauvegarde zone');
      const newZone = await response.json();

      // Sauvegarder aussi localement
      const zones = await this.getZones(boutiqueId);
      zones.push(newZone);
      localStorage.setItem('delivery_zones', JSON.stringify(zones));

      return newZone;
    } catch (error) {
      console.error('Erreur saveZone:', error);
      throw error;
    }
  }
}

export const zoneService = new ZoneService();
