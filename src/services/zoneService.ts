import type { ZoneLivraison } from "../models/livraison-models";

//const API_BASE_URL = 'http://localhost:8000';
const API_BASE_URL = import.meta.env.VITE_API_URL;

class ZoneService {
  async getZones(): Promise<ZoneLivraison[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/livreurs/zones`);
      if (!response.ok) throw new Error('Erreur chargement zones');
      return await response.json();
    } catch (error) {
      // console.error('Erreur getZones, utilisation données locales:', error);
      const saved = localStorage.getItem('delivery_zones');
      if (saved) {
        return JSON.parse(saved);
      }
      return [];
    }
  }

  async saveZone(zone: Partial<ZoneLivraison>): Promise<ZoneLivraison> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/livreurs/zones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(zone)
      });
      if (!response.ok) throw new Error('Erreur sauvegarde zone');
      const newZone = await response.json();
      
      // Sauvegarder aussi localement
      const zones = await this.getZones();
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