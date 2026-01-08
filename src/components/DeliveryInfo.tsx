import React from 'react';
import { Truck, Clock, MapPin } from 'lucide-react';

interface DeliveryInfoProps {
  className?: string;
}

const DeliveryInfo: React.FC<DeliveryInfoProps> = ({ className = "" }) => {
  return (
    <div className={`bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Truck className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">Informations de livraison</h3>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-700">
          <MapPin className="w-4 h-4" />
          <span>Livraison disponible partout à Dakar</span>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <Clock className="w-4 h-4" />
          <span>Livraison rapide via Paps</span>
        </div>

        <div className="mt-3 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            💰 Paiement à la livraison | 📦 Frais calculés selon votre adresse
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryInfo;
