import type { ZoneLivraison, AdresseLivraison, CalculPrixLivraison, OptionsLivraison, ConfigurationMarchand } from '../models/livraison-models';
import { mockZones, getMarchandConfig, calculateDeliveryPrice } from './mockData';


const API_BASE_URL = import.meta.env.VITE_API_URL;

class LivraisonService {
  async getZonesDisponibles(): Promise<ZoneLivraison[]> {
    try {
      //console.log('Récupération des zones depuis l\'API...');
      const response = await fetch(`${API_BASE_URL}/zones`);
      if (!response.ok) {
        //console.error('Erreur API:', response.status, response.statusText);
        throw new Error(`Erreur lors du chargement des zones: ${response.status}`);
      }

      const zones = await response.json();
      // console.log('Réponse API reçue:', zones);

      
      if (!Array.isArray(zones) || zones.length === 0) {
        //console.warn('Aucune zone trouvée dans la réponse API, utilisation des données locales');
        return this._getZonesFromStorage();
      }

      const mappedZones: ZoneLivraison[] = zones.map((zone: {
        id: number;
        nom: string;
        description?: string;
        prixBase: number;
        prixExpress?: number;
        prixUrgent?: number;
        actif: boolean;
      }) => {
        //console.log('Mapping zone:', zone);

        const prixBase = Number(zone.prixBase) || 1500;
        const prixExpress = Number(zone.prixExpress) || (prixBase * 1.5);
        const prixUrgent = Number(zone.prixUrgent) || (prixBase * 2.0);

        return {
          id: zone.id,
          nom: zone.nom || 'Zone inconnue',
          description: zone.description || zone.nom || 'Zone de livraison',
          tarifStandard: prixBase,
          tarifExpress: prixExpress,
          tarifUrgent: prixUrgent,
          statut: zone.actif ? 'ACTIF' : 'INACTIF'
        };
      });

      //console.log('Zones mappées:', mappedZones);

      localStorage.setItem('delivery_zones', JSON.stringify(mappedZones));
      return mappedZones;
    } catch (error) {
      //console.error('Erreur getZonesDisponibles, utilisation des données locales:', error);
      return this._getZonesFromStorage();
    }
  }

  private async _getZonesFromStorage(): Promise<ZoneLivraison[]> {
    try {
      const saved = localStorage.getItem('delivery_zones');
      if (saved) {
        const zones = JSON.parse(saved);
        // console.log('Zones chargées depuis localStorage:', zones);

        const validZones = zones.filter((zone: ZoneLivraison) =>
          zone &&
          zone.id &&
          zone.nom &&
          zone.tarifStandard > 0
        );

        if (validZones.length > 0) {
          return validZones;
        }
      }
    } catch (error) {
      //console.error('Erreur lors du chargement depuis localStorage:', error);
    }

    // console.log('Utilisation des zones mock par défaut');
    return mockZones;
  }

  async calculerPrixLivraison(adresse: AdresseLivraison): Promise<CalculPrixLivraison | null> {
    try {
      const zones = await this.getZonesDisponibles();

      const adresseLower = adresse.adresseComplete.toLowerCase();
      let zoneTrouvee = zones[0]; 

      for (const zone of zones) {
        if (adresseLower.includes(zone.nom.toLowerCase())) {
          zoneTrouvee = zone;
          break;
        }
      }

      return {
        zoneId: zoneTrouvee.id,
        zoneName: zoneTrouvee.nom,
        tarifStandard: zoneTrouvee.tarifStandard,
        tarifExpress: zoneTrouvee.tarifExpress,
        tarifUrgent: zoneTrouvee.tarifUrgent,
        distance: zoneTrouvee.id * 5,
        dureeEstimee: zoneTrouvee.id === 1 ? '30-45 min' : zoneTrouvee.id === 2 ? '45-60 min' : '60-90 min'
      };
    } catch (error) {
      //console.error('Erreur calculerPrixLivraison, utilisation des données locales:', error);
      return calculateDeliveryPrice(adresse.adresseComplete, mockZones);
    }
  }

  async getConfigurationMarchand(marchandId: number): Promise<ConfigurationMarchand | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/marchands/${marchandId}/livraison-config`);
      if (!response.ok) throw new Error('Configuration non trouvée');
      return await response.json();
    } catch (error) {
      //console.error('Erreur getConfigurationMarchand, utilisation de la config locale:', error);
      return getMarchandConfig();
    }
  }

  getOptionsLivraison(calculPrix: CalculPrixLivraison, config?: ConfigurationMarchand, totalCommande?: number): OptionsLivraison[] {
    const options: OptionsLivraison[] = [];
    
    const livraisonGratuite = config?.livraisonGratuite && 
      totalCommande && 
      config.seuilLivraisonGratuite && 
      totalCommande >= config.seuilLivraisonGratuite;

    options.push({
      type: 'STANDARD',
      prix: livraisonGratuite ? 0 : calculPrix.tarifStandard,
      dureeEstimee: '24-48h',
      description: livraisonGratuite ? 'Livraison gratuite (commande éligible)' : 'Livraison standard'
    });

    options.push({
      type: 'EXPRESS',
      prix: calculPrix.tarifExpress,
      dureeEstimee: '4-8h',
      description: 'Livraison express (même jour)'
    });

    options.push({
      type: 'URGENT',
      prix: calculPrix.tarifUrgent,
      dureeEstimee: '1-2h',
      description: 'Livraison urgente'
    });

    return options;
  }

  async rechercherAdresse(query: string): Promise<AdresseLivraison[]> {
    const zones = await this.getZonesDisponibles();

    // Si la query est vide, retourner toutes les zones disponibles
    if (query.length === 0) {
      const suggestions: AdresseLivraison[] = zones.map(zone => ({
        adresseComplete: zone.nom,
        quartier: zone.description || zone.nom,
        ville: 'Dakar',
        pays: 'Sénégal'
      }));

      return new Promise(resolve => {
        setTimeout(() => resolve(suggestions), 300);
      });
    }

    const queryLower = query.toLowerCase();
    const filteredZones = zones.filter(zone => {
      const searchableText = `${zone.nom} ${zone.description || ''}`.toLowerCase();

      const queryWords = queryLower.split(' ').filter(word => word.length > 0);

      return queryWords.every(word =>
        searchableText.includes(word)
      );
    });

    let suggestions: AdresseLivraison[];
    if (filteredZones.length === 0) {
      const similarZones = zones.filter(zone => {
        const searchableText = `${zone.nom} ${zone.description || ''}`.toLowerCase();
        return searchableText.includes(queryLower) ||
               queryLower.split(' ').some(word =>
                 word.length > 2 && searchableText.includes(word)
               );
      });

      suggestions = similarZones.map(zone => ({
        adresseComplete: zone.nom,
        quartier: zone.description || zone.nom,
        ville: 'Dakar',
        pays: 'Sénégal'
      }));
    } else {
      suggestions = filteredZones.map(zone => ({
        adresseComplete: zone.nom,
        quartier: zone.description || zone.nom,
        ville: 'Dakar',
        pays: 'Sénégal'
      }));
    }

    return new Promise(resolve => {
      setTimeout(() => resolve(suggestions), 300);
    });
  }

  async getZonesForAutocomplete(): Promise<{zone: ZoneLivraison, displayText: string}[]> {
    const zones = await this.getZonesDisponibles();
    return zones
      .filter(zone => zone && zone.tarifStandard > 0)
      .map(zone => {
        const tarif = zone.tarifStandard || 0;
        return {
          zone,
          displayText: `${zone.nom} - ${tarif.toLocaleString()} FCFA`
        };
      });
  }
}

export const livraisonService = new LivraisonService();