import React from 'react';
import { CheckCircle, Package, Phone, Clock, ShoppingBag, Truck, ExternalLink } from 'lucide-react';
import type { Order } from '../services/orderService';

interface OrderTrackingItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderTrackingProps {
  order: Order;
  items: OrderTrackingItem[];
  typeRecuperation?: 'boutique' | 'domicile';
}

const STATUT_LABELS: Record<string, { label: string; color: string }> = {
  EN_ATTENTE: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMEE: { label: 'Confirmée', color: 'bg-blue-100 text-blue-800' },
  EN_PREPARATION: { label: 'En préparation', color: 'bg-purple-100 text-purple-800' },
  EN_LIVRAISON: { label: 'En livraison', color: 'bg-orange-100 text-orange-800' },
  LIVREE: { label: 'Livrée', color: 'bg-green-100 text-green-800' },
  ANNULEE: { label: 'Annulée', color: 'bg-red-100 text-red-800' },
};

const OrderTracking: React.FC<OrderTrackingProps> = ({ order, items, typeRecuperation }) => {
  const statut = STATUT_LABELS[order.statut] ?? { label: order.statut, color: 'bg-gray-100 text-gray-700' };
  const sousTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const fraisLivraison = order.fraisLivraison ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-10 px-4">
      <div className="w-full max-w-lg space-y-4">

        {/* En-tête succès */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="flex justify-center mb-3">
            <CheckCircle size={48} strokeWidth={1.5} className="text-green-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Commande confirmée !</h1>
          <p className="text-sm text-gray-500">Merci pour votre achat. Votre commande a bien été enregistrée.</p>

          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="text-2xl font-bold text-gray-900">#{order.id}</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statut.color}`}>
              {statut.label}
            </span>
          </div>

          <p className="text-xs text-gray-400 mt-2">
            <Clock size={12} className="inline mr-1" />
            {new Date(order.dateCreation).toLocaleString('fr-FR', {
              day: '2-digit', month: 'long', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>

        {/* Infos client */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Phone size={15} strokeWidth={1.5} />
            Informations client
          </h2>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Nom</span>
              <span className="font-medium text-gray-900">{order.client.nom}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Téléphone</span>
              <span className="font-medium text-gray-900">{order.client.telephone}</span>
            </div>
            {typeRecuperation && (
              <div className="flex justify-between">
                <span className="text-gray-500">Récupération</span>
                <span className="font-medium text-gray-900 flex items-center gap-1">
                  {typeRecuperation === 'boutique' ? (
                    <><Package size={13} strokeWidth={1.5} /> En boutique</>
                  ) : (
                    <><Truck size={13} strokeWidth={1.5} /> À domicile</>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Articles */}
        {items.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <ShoppingBag size={15} strokeWidth={1.5} />
              Articles commandés
            </h2>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">
                    {item.name}
                    <span className="text-gray-400 ml-1">×{item.quantity}</span>
                  </span>
                  <span className="font-medium text-gray-900">
                    {(item.price * item.quantity).toLocaleString('fr-FR')} Fcfa
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Sous-total</span>
              <span className="text-gray-900">{sousTotal.toLocaleString('fr-FR')} Fcfa</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Frais de livraison</span>
              <span className="text-gray-900">
                {fraisLivraison === 0 ? (
                  <span className="text-green-600">Gratuit</span>
                ) : (
                  `${fraisLivraison.toLocaleString('fr-FR')} Fcfa`
                )}
              </span>
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-base">
              <span className="text-gray-900">Total payé</span>
              <span className="text-gray-900">{order.total.toLocaleString('fr-FR')} Fcfa</span>
            </div>
          </div>
        </div>

        {/* Lien vers suivi permanent */}
        <div className="text-center pb-4 space-y-1">
          <a
            href={`/suivi?commande=${order.id}&tel=${encodeURIComponent(order.client.telephone)}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-700 font-medium underline underline-offset-2 hover:text-gray-900"
          >
            <ExternalLink size={14} strokeWidth={1.5} />
            Suivre ma commande plus tard
          </a>
          <p className="text-xs text-gray-400">
            Notez votre numéro <strong>#{order.id}</strong> — cette page disparaît si vous fermez l'onglet.
          </p>
        </div>

      </div>
    </div>
  );
};

export default OrderTracking;
