import React, { useEffect, useRef } from 'react';
import { Facebook, MessageCircle, Music, Instagram } from 'lucide-react';

interface SharePopupProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: number;
    name: string;
    currentPrice: number;
  };
  position: { top: number; left: number };
}

const SharePopup: React.FC<SharePopupProps> = ({ isOpen, onClose, product, position }) => {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/products?id=${product.id}`;
  const shareText = `Découvrez ${product.name} à ${product.currentPrice ? product.currentPrice.toLocaleString() : '0'} FCFA`;

  const handleShare = (platform: string) => {
    let url = '';
    
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
        break;
      case 'tiktok':
        url = `https://www.tiktok.com/share?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'instagram':
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        alert('Lien copié ! Vous pouvez le coller sur Instagram.');
        return;
    }
    
    window.open(url, '_blank', 'width=600,height=400');
    onClose();
  };

  return (
    <div
      ref={popupRef}
      className="absolute z-50 bg-white rounded-lg shadow-lg p-2 sm:p-3 animate-in fade-in slide-in-from-top-2 duration-200"
      style={{
        top: position.top + 40,
        left: position.left - 80,
      }}
    >
      <div className="flex space-x-3">
        <button
          onClick={() => handleShare('facebook')}
          className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          title="Partager sur Facebook"
        >
          <Facebook size={16} />
        </button>
        <button
          onClick={() => handleShare('whatsapp')}
          className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
          title="Partager sur WhatsApp"
        >
          <MessageCircle size={16} />
        </button>
        <button
          onClick={() => handleShare('tiktok')}
          className="p-2 rounded-full bg-black text-white hover:bg-gray-800 transition-colors"
          title="Partager sur TikTok"
        >
          <Music size={16} />
        </button>
        <button
          onClick={() => handleShare('instagram')}
          className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-colors"
          title="Copier pour Instagram"
        >
          <Instagram size={16} />
        </button>
      </div>
    </div>
  );
};

export default SharePopup;