import React, { useState, useEffect } from 'react';
import { Truck, Clock, MapPin, Gift } from 'lucide-react';
import { livraisonService } from '../services/livraisonService';
import type { ConfigurationMarchand, ZoneLivraison } from '../models/livraison-models';

interface DeliveryInfoProps {
  className?: string;
}

const DeliveryInfo: React.FC<DeliveryInfoProps> = ({ className = "" }) => {
  const [configMarchand, setConfigMarchand] = useState<ConfigurationMarchand | null>(null);
  const [zones, setZones] = useState<ZoneLivraison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDeliveryInfo = async () => {
      try {
        const [config, zonesData] = await Promise.all([
          livraisonService.getConfigurationMarchand(1),
          livraisonService.getZonesDisponibles()
        ]);
        setConfigMarchand(config);
        setZones(zonesData);
      } catch (error) {
        console.error('Erreur chargement info livraison:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDeliveryInfo();
  }, []);

  if (loading) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const minDeliveryPrice = Math.min(...zones.map(z => z.tarifStandard));

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Truck className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">Informations de livraison</h3>
      </div>

      <div className="space-y-2 text-sm">
        {configMarchand?.livraisonGratuite && configMarchand.seuilLivraisonGratuite && (
          <div className="flex items-center gap-2 text-green-700">
            <Gift className="w-4 h-4" />
            <span>
              <strong>Livraison gratuite</strong> dès {configMarchand.seuilLivraisonGratuite ? configMarchand.seuilLivraisonGratuite.toLocaleString() : '0'} FCFA
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-gray-700">
          <MapPin className="w-4 h-4" />
          <span>À partir de {minDeliveryPrice ? minDeliveryPrice.toLocaleString() : '0'} FCFA</span>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <Clock className="w-4 h-4" />
          <span>Livraison standard: 24-48h | Express: 4-8h</span>
        </div>

        <div className="mt-3 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-1">Zones de livraison:</p>
          <div className="flex flex-wrap gap-1">
            {zones.slice(0, 3).map((zone) => (
              <span 
                key={zone.id}
                className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
              >
                {zone.nom}
              </span>
            ))}
            {zones.length > 3 && (
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{zones.length - 3} autres
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryInfo;