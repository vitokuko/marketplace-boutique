import React from 'react';
import { Truck, Zap, Clock, Gift, Package } from 'lucide-react';
import type { PapsOption, ZonesOption } from '../services/papsDeliveryService';

interface OptionsLivraisonProps {
  papsOption: PapsOption | null;
  zonesOption: ZonesOption | null;
  livraisonGratuiteApplicable: boolean;
  selectedMode: 'paps' | 'zones' | null;
  selectedZoneType: 'STANDARD' | 'EXPRESS' | 'URGENT' | null;
  onOptionSelect: (mode: 'paps' | 'zones', prix: number, zoneType?: 'STANDARD' | 'EXPRESS' | 'URGENT') => void;
}

const OptionsLivraisonComponent: React.FC<OptionsLivraisonProps> = ({
  papsOption,
  zonesOption,
  livraisonGratuiteApplicable,
  selectedMode,
  selectedZoneType,
  onOptionSelect
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'PAPS': return <Package className="w-5 h-5" />;
      case 'STANDARD': return <Truck className="w-5 h-5" />;
      case 'EXPRESS': return <Zap className="w-5 h-5" />;
      case 'URGENT': return <Clock className="w-5 h-5" />;
      default: return <Truck className="w-5 h-5" />;
    }
  };

  const getColorClasses = (type: string, isSelected: boolean) => {
    const baseClasses = "border-2 rounded-lg p-4 cursor-pointer transition-all duration-200";

    if (isSelected) {
      switch (type) {
        case 'PAPS': return `${baseClasses} border-purple-500 bg-purple-50`;
        case 'STANDARD': return `${baseClasses} border-green-500 bg-green-50`;
        case 'EXPRESS': return `${baseClasses} border-blue-500 bg-blue-50`;
        case 'URGENT': return `${baseClasses} border-red-500 bg-red-50`;
        default: return `${baseClasses} border-gray-500 bg-gray-50`;
      }
    }

    return `${baseClasses} border-gray-200 hover:border-gray-300 hover:bg-gray-50`;
  };

  const hasOptions = (papsOption && papsOption.disponible) || (zonesOption && zonesOption.disponible);

  if (!hasOptions) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Options de livraison</h3>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Aucune option de livraison n'est disponible pour cette adresse.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Options de livraison</h3>
        {livraisonGratuiteApplicable && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            <Gift className="w-3 h-3" />
            Livraison gratuite disponible
          </span>
        )}
      </div>

      {/* Section Paps */}
      {papsOption && papsOption.disponible && papsOption.tarif !== null && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Livraison Paps Logistics
          </h4>
          <div
            onClick={() => onOptionSelect('paps', papsOption.tarif!)}
            className={getColorClasses('PAPS', selectedMode === 'paps')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                  {getIcon('PAPS')}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Paps Logistics</div>
                  <div className="text-sm text-gray-600">Livraison rapide avec suivi en temps réel</div>
                  {papsOption.estimatedTime && (
                    <div className="text-sm font-medium text-gray-700">
                      Délai: {papsOption.estimatedTime}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-lg font-bold text-gray-900">
                  {papsOption.tarif.toLocaleString()} FCFA
                </span>
              </div>
            </div>

            {selectedMode === 'paps' && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Option sélectionnée
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section Zones */}
      {zonesOption && zonesOption.disponible && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Livraison Standard - {zonesOption.zone_nom}
          </h4>

          {/* Option STANDARD */}
          {zonesOption.tarif !== null && (
            <div
              onClick={() => onOptionSelect('zones', livraisonGratuiteApplicable ? 0 : zonesOption.tarif, 'STANDARD')}
              className={getColorClasses('STANDARD', selectedMode === 'zones' && selectedZoneType === 'STANDARD')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100 text-green-600">
                    {getIcon('STANDARD')}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Standard</div>
                    <div className="text-sm text-gray-600">Livraison standard dans votre zone</div>
                    {zonesOption.temps_min !== null && zonesOption.temps_max !== null && (
                      <div className="text-sm font-medium text-gray-700">
                        Délai: {zonesOption.temps_min}-{zonesOption.temps_max} min
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  {livraisonGratuiteApplicable ? (
                    <div className="flex items-center gap-1">
                      <Gift className="w-4 h-4 text-green-600" />
                      <span className="text-lg font-bold text-green-600">Gratuit</span>
                    </div>
                  ) : (
                    <span className="text-lg font-bold text-gray-900">
                      {zonesOption.tarif.toLocaleString()} FCFA
                    </span>
                  )}
                </div>
              </div>

              {selectedMode === 'zones' && selectedZoneType === 'STANDARD' && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Option sélectionnée
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Option EXPRESS */}
          {zonesOption.tarif_express !== null && (
            <div
              onClick={() => onOptionSelect('zones', zonesOption.tarif_express!, 'EXPRESS')}
              className={getColorClasses('EXPRESS', selectedMode === 'zones' && selectedZoneType === 'EXPRESS')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                    {getIcon('EXPRESS')}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Express</div>
                    <div className="text-sm text-gray-600">Livraison prioritaire plus rapide</div>
                    {zonesOption.temps_min !== null && zonesOption.temps_max !== null && (
                      <div className="text-sm font-medium text-gray-700">
                        Délai: {Math.floor(zonesOption.temps_min * 0.7)}-{Math.floor(zonesOption.temps_max * 0.7)} min
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900">
                    {zonesOption.tarif_express.toLocaleString()} FCFA
                  </span>
                </div>
              </div>

              {selectedMode === 'zones' && selectedZoneType === 'EXPRESS' && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Option sélectionnée
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Option URGENT */}
          {zonesOption.tarif_urgent !== null && (
            <div
              onClick={() => onOptionSelect('zones', zonesOption.tarif_urgent!, 'URGENT')}
              className={getColorClasses('URGENT', selectedMode === 'zones' && selectedZoneType === 'URGENT')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-red-100 text-red-600">
                    {getIcon('URGENT')}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Urgent</div>
                    <div className="text-sm text-gray-600">Livraison ultra-rapide garantie</div>
                    {zonesOption.temps_min !== null && zonesOption.temps_max !== null && (
                      <div className="text-sm font-medium text-gray-700">
                        Délai: {Math.floor(zonesOption.temps_min * 0.5)}-{Math.floor(zonesOption.temps_max * 0.5)} min
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900">
                    {zonesOption.tarif_urgent.toLocaleString()} FCFA
                  </span>
                </div>
              </div>

              {selectedMode === 'zones' && selectedZoneType === 'URGENT' && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Option sélectionnée
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OptionsLivraisonComponent;