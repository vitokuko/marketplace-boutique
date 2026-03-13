import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, CheckCircle, Clock, Package, Truck, XCircle, ChevronRight } from 'lucide-react';
import { trackOrder } from '../services/orderService';
import type { TrackingOrder } from '../services/orderService';

const STATUT_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode; step: number }> = {
  A_PREPARER: {
    label: 'En attente de préparation',
    color: 'text-yellow-700',
    bg: 'bg-yellow-50 border-yellow-200',
    icon: <Clock size={18} />,
    step: 1,
  },
  EN_COURS: {
    label: 'En cours de livraison',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    icon: <Truck size={18} />,
    step: 2,
  },
  LIVREE: {
    label: 'Livrée',
    color: 'text-green-700',
    bg: 'bg-green-50 border-green-200',
    icon: <CheckCircle size={18} />,
    step: 3,
  },
  ANNULEE: {
    label: 'Annulée',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    icon: <XCircle size={18} />,
    step: 0,
  },
};

const STEPS = [
  { key: 'A_PREPARER', label: 'Reçue' },
  { key: 'EN_COURS', label: 'En livraison' },
  { key: 'LIVREE', label: 'Livrée' },
];

export default function SuiviCommande() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('commande') || '');
  const [telephone, setTelephone] = useState(searchParams.get('tel') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackingOrder | null>(null);

  // Lancer la recherche automatiquement si les params sont dans l'URL
  useEffect(() => {
    const id = searchParams.get('commande');
    const tel = searchParams.get('tel');
    if (id && tel) {
      setOrderId(id);
      setTelephone(tel);
      handleSearch(Number(id), tel);
    }
  }, []);

  const handleSearch = async (id?: number, tel?: string) => {
    const resolvedId = id ?? Number(orderId);
    const resolvedTel = tel ?? telephone;

    if (!resolvedId || !resolvedTel.trim()) {
      setError('Veuillez renseigner le numéro de commande et votre téléphone.');
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const result = await trackOrder(resolvedId, resolvedTel.trim());
      setOrder(result);
      setSearchParams({ commande: String(resolvedId), tel: resolvedTel.trim() });
    } catch (e: any) {
      if (e.message?.includes('403')) {
        setError('Numéro de téléphone incorrect pour cette commande.');
      } else if (e.message?.includes('404')) {
        setError('Commande introuvable. Vérifiez le numéro de commande.');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const statut = order ? (STATUT_CONFIG[order.statut] ?? {
    label: order.statut,
    color: 'text-gray-700',
    bg: 'bg-gray-50 border-gray-200',
    icon: <Package size={18} />,
    step: 0,
  }) : null;

  const currentStep = statut?.step ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-lg space-y-6">

        {/* Titre */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Suivi de commande</h1>
          <p className="text-sm text-gray-500 mt-1">Entrez votre numéro de commande et votre téléphone</p>
        </div>

        {/* Formulaire de recherche */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de commande</label>
            <input
              type="number"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Ex : 1234"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone</label>
            <input
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="Ex : 771234567"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-medium py-2.5 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Search size={15} strokeWidth={1.5} />
            {loading ? 'Recherche...' : 'Rechercher'}
          </button>
        </div>

        {/* Résultat */}
        {order && statut && (
          <div className="space-y-4">

            {/* Statut principal */}
            <div className={`rounded-2xl border p-5 flex items-start gap-3 ${statut.bg}`}>
              <span className={statut.color}>{statut.icon}</span>
              <div>
                <p className={`text-sm font-semibold ${statut.color}`}>{statut.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Commande #{order.id} — {new Date(order.dateCreation).toLocaleString('fr-FR', {
                    day: '2-digit', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* Barre de progression (sauf annulée) */}
            {order.statut !== 'ANNULEE' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center">
                  {STEPS.map((step, idx) => {
                    const done = currentStep > idx + 1;
                    const active = currentStep === idx + 1;
                    return (
                      <React.Fragment key={step.key}>
                        <div className="flex flex-col items-center gap-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                            done ? 'bg-gray-900 border-gray-900 text-white'
                            : active ? 'bg-white border-gray-900 text-gray-900'
                            : 'bg-white border-gray-200 text-gray-400'
                          }`}>
                            {done ? <CheckCircle size={14} /> : idx + 1}
                          </div>
                          <span className={`text-xs font-medium ${active ? 'text-gray-900' : done ? 'text-gray-600' : 'text-gray-400'}`}>
                            {step.label}
                          </span>
                        </div>
                        {idx < STEPS.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-2 mb-4 rounded ${done ? 'bg-gray-900' : 'bg-gray-200'}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Infos client + récupération */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Client</span>
                <span className="font-medium text-gray-900">{order.client.nom}</span>
              </div>
              {order.typeRecuperation && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Récupération</span>
                  <span className="font-medium text-gray-900">
                    {order.typeRecuperation === 'domicile' ? '🚚 À domicile' : '🏪 En boutique'}
                  </span>
                </div>
              )}
              {order.adresseLivraison && (
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500 shrink-0">Adresse</span>
                  <span className="font-medium text-gray-900 text-right">{order.adresseLivraison}</span>
                </div>
              )}
            </div>

            {/* Articles */}
            {order.lignes.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Package size={14} strokeWidth={1.5} /> Articles
                </h3>
                <div className="space-y-2">
                  {order.lignes.map((ligne, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {ligne.produitNom}
                        <span className="text-gray-400 ml-1">×{ligne.quantite}</span>
                      </span>
                      <span className="font-medium text-gray-900">
                        {ligne.totalLigne.toLocaleString('fr-FR')} Fcfa
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2 text-sm">
              {order.fraisLivraison != null && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Frais de livraison</span>
                  <span className="text-gray-900">
                    {order.fraisLivraison === 0
                      ? <span className="text-green-600">Gratuit</span>
                      : `${order.fraisLivraison.toLocaleString('fr-FR')} Fcfa`}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-base">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">{order.total.toLocaleString('fr-FR')} Fcfa</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
