import React from 'react';
import { Truck, Gift } from 'lucide-react';

interface FreeDeliveryBannerProps {
  currentTotal: number;
  freeDeliveryThreshold: number;
  isEligible: boolean;
}

const FreeDeliveryBanner: React.FC<FreeDeliveryBannerProps> = ({
  currentTotal,
  freeDeliveryThreshold,
  isEligible
}) => {
  const remainingAmount = freeDeliveryThreshold - currentTotal;
  const progressPercentage = Math.min((currentTotal / freeDeliveryThreshold) * 100, 100);

  if (isEligible) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500 rounded-full">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-green-800">🎉 Livraison gratuite débloquée !</h3>
            <p className="text-sm text-green-700">
              Votre commande est éligible à la livraison gratuite
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-blue-500 rounded-full">
          <Truck className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-800">Livraison gratuite disponible</h3>
          <p className="text-sm text-blue-700">
            Plus que <span className="font-bold">{remainingAmount ? remainingAmount.toLocaleString() : '0'} FCFA</span> pour la livraison gratuite
          </p>
        </div>
      </div>
      
      <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between text-xs text-blue-600">
        <span>{currentTotal ? currentTotal.toLocaleString() : '0'} FCFA</span>
        <span>{freeDeliveryThreshold ? freeDeliveryThreshold.toLocaleString() : '0'} FCFA</span>
      </div>
    </div>
  );
};

export default FreeDeliveryBanner;