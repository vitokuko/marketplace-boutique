export interface ZoneLivraison {
  id: number;
  nom: string;
  description?: string;
  tarifStandard: number;
  tarifExpress: number;
  tarifUrgent: number;
  statut: 'ACTIF' | 'INACTIF';
}

export interface AdresseLivraison {
  adresseComplete: string;
  quartier?: string;
  ville: string;
  codePostal?: string;
  pays: string;
  latitude?: number;
  longitude?: number;
}

export interface CalculPrixLivraison {
  zoneId: number;
  zoneName: string;
  tarifStandard: number;
  tarifExpress: number;
  tarifUrgent: number;
  distance?: number;
  dureeEstimee?: string;
}

export interface OptionsLivraison {
  type: 'STANDARD' | 'EXPRESS' | 'URGENT';
  prix: number;
  dureeEstimee: string;
  description: string;
}

export interface ConfigurationMarchand {
  id: number;
  livraisonGratuite: boolean;
  seuilLivraisonGratuite?: number;
  zonesCouvertes: number[];
  tarifPersonnalise?: {
    [zoneId: number]: {
      standard: number;
      express: number;
      urgent: number;
    };
  };
}