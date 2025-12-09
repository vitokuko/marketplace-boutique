import React from 'react';
import { Truck, Zap, Clock, Gift } from 'lucide-react';
import type { OptionsLivraison } from '../models/livraison-models';

interface OptionsLivraisonProps {
  options: OptionsLivraison[];
  selectedOption: string;
  onOptionSelect: (type: string, prix: number) => void;
  showFreeDeliveryBadge?: boolean;
}

const OptionsLivraisonComponent: React.FC<OptionsLivraisonProps> = ({
  options,
  selectedOption,
  onOptionSelect,
  showFreeDeliveryBadge = false
}) => {
  const getIcon = (type: string) => {
    switch (type) {
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
        case 'STANDARD': return `${baseClasses} border-green-500 bg-green-50`;
        case 'EXPRESS': return `${baseClasses} border-blue-500 bg-blue-50`;
        case 'URGENT': return `${baseClasses} border-red-500 bg-red-50`;
        default: return `${baseClasses} border-gray-500 bg-gray-50`;
      }
    }
    
    return `${baseClasses} border-gray-200 hover:border-gray-300 hover:bg-gray-50`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Options de livraison</h3>
        {showFreeDeliveryBadge && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            <Gift className="w-3 h-3" />
            Livraison gratuite disponible
          </span>
        )}
      </div>

      {options.map((option) => (
        <div
          key={option.type}
          onClick={() => onOptionSelect(option.type, option.prix)}
          className={getColorClasses(option.type, selectedOption === option.type)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                option.type === 'STANDARD' ? 'bg-green-100 text-green-600' :
                option.type === 'EXPRESS' ? 'bg-blue-100 text-blue-600' :
                'bg-red-100 text-red-600'
              }`}>
                {getIcon(option.type)}
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  {option.type === 'STANDARD' ? 'Standard' :
                   option.type === 'EXPRESS' ? 'Express' : 'Urgent'}
                </div>
                <div className="text-sm text-gray-600">{option.description}</div>
                <div className="text-sm font-medium text-gray-700">
                  Délai: {option.dureeEstimee}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              {option.prix === 0 ? (
                <div className="flex items-center gap-1">
                  <Gift className="w-4 h-4 text-green-600" />
                  <span className="text-lg font-bold text-green-600">Gratuit</span>
                </div>
              ) : (
                <span className="text-lg font-bold text-gray-900">
                  {option.prix ? option.prix.toLocaleString() : '0'} FCFA
                </span>
              )}
            </div>
          </div>
          
          {selectedOption === option.type && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Option sélectionnée
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OptionsLivraisonComponent;