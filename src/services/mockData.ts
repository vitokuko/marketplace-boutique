import type { ConfigurationMarchand, ZoneLivraison } from "../models/livraison-models";

export const mockZones: ZoneLivraison[] = [
  {
    id: 1,
    nom: 'Dakar Centre',
    description: 'Plateau, Médina, Fann',
    tarifStandard: 1500,
    tarifExpress: 3000,
    tarifUrgent: 5000,
    statut: 'ACTIF'
  },
  {
    id: 2,
    nom: 'Dakar Banlieue',
    description: 'Pikine, Guédiawaye, Parcelles',
    tarifStandard: 2500,
    tarifExpress: 4500,
    tarifUrgent: 7000,
    statut: 'ACTIF'
  },
  {
    id: 3,
    nom: 'Rufisque',
    description: 'Rufisque et environs',
    tarifStandard: 3500,
    tarifExpress: 6000,
    tarifUrgent: 9000,
    statut: 'ACTIF'
  }
];

export const getMarchandConfig = (): ConfigurationMarchand => {
  const saved = localStorage.getItem('marchand_config');
  if (saved) {
    return JSON.parse(saved);
  }
  
  return {
    id: 1,
    livraisonGratuite: false,
    seuilLivraisonGratuite: 25000,
    zonesCouvertes: [1, 2, 3]
  };
};

export const saveMarchandConfig = (config: ConfigurationMarchand) => {
  localStorage.setItem('marchand_config', JSON.stringify(config));
};

export const calculateDeliveryPrice = async (adresse: string, zones?: any[]) => {
  const adresseLower = adresse.toLowerCase();
  
  const zonesToUse = zones || mockZones;
  
  for (const zone of zonesToUse) {
    if (adresseLower.includes(zone.nom.toLowerCase())) {
      return {
        zoneId: zone.id,
        zoneName: zone.nom,
        tarifStandard: zone.tarifStandard,
        tarifExpress: zone.tarifExpress,
        tarifUrgent: zone.tarifUrgent,
        distance: zone.id * 5,
        dureeEstimee: zone.id === 1 ? '30-45 min' : zone.id === 2 ? '45-60 min' : '60-90 min'
      };
    }
  }
  
  const defaultZone = zonesToUse[0];
  return {
    zoneId: defaultZone.id,
    zoneName: defaultZone.nom,
    tarifStandard: defaultZone.tarifStandard,
    tarifExpress: defaultZone.tarifExpress,
    tarifUrgent: defaultZone.tarifUrgent,
    distance: 8,
    dureeEstimee: '30-45 min'
  };
};