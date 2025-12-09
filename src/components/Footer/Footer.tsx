import React, { useState } from 'react';
import { Phone, Mail, HelpCircle, Clock, Facebook, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import FooterImage from '../../assets/Footer.png';
import Logo from '../../assets/Logo';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    //console.log('Newsletter subscription:', { name, email });
    setName('');
    setEmail('');
  };

  return (
    <footer
      id="footer"
      className="text-white relative"
      style={{
        backgroundImage: `url(${FooterImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 "></div>
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-16">

        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold mb-4 text-white">Newsletter</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Abonnez-vous à notre newsletter pour recevoir nos promos et nouveautés.
          </p>
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
              <input
                type="text"
                placeholder="Nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex-1 max-w-xs w-full sm:w-auto"
                required
              />
              <input
                type="email"
                placeholder="Adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex-1 max-w-xs w-full sm:w-auto"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-300 whitespace-nowrap"
              >
                S'abonner
              </button>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">

          <div className="flex flex-col items-center md:items-start">
            <div className="w-24 h-auto mb-4">
              <Logo />
            </div>
            <p className="text-gray-300 leading-relaxed text-center md:text-left">
              Profitez d'une expérience d'achat en ligne simplifiée et entièrement sécurisée, de la commande à la livraison.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-center md:text-left text-white">Navigation rapide</h4>
            <div className="w-[1.4cm] h-[0.1cm] bg-blue-600 mb-4 rounded-full"></div>
            <ul className="space-y-2 text-center md:text-left">
              <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Accueil</Link></li>
              <li><Link to="/products" className="text-gray-300 hover:text-white transition-colors">Produits</Link></li>
              <li><Link to="/fonctionnalites" className="text-gray-300 hover:text-white transition-colors">Fonctionnalités</Link></li>
              <li><Link to="/politique-confidentialite" className="text-gray-300 hover:text-white transition-colors">Politique de confidentialité</Link></li>
              <li><Link to="/conditions-generales" className="text-gray-300 hover:text-white transition-colors">Conditions générales de vente (CGV)</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-center md:text-left text-white">Support et Contact</h4>
            <div className="w-[1.4cm] h-[0.1cm] bg-blue-600 mb-4 rounded-full"></div>
            <div className="space-y-3 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <Phone size={16} className="text-gray-300" />
                <span className="text-gray-300">Téléphone (+221 00 000 00 00)</span>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <Phone size={16} className="text-gray-300" />
                <span className="text-gray-300">WhatsApp (+221 00 000 00 00)</span>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <Mail size={16} className="text-gray-300" />
                <span className="text-gray-300">Email support</span>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <HelpCircle size={16} className="text-gray-300" />
                <span className="text-gray-300">FAQ</span>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <Clock size={16} className="text-gray-300" />
                <span className="text-gray-300">Horaires d'assistance 08H - 17H</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-center md:text-left text-white">Suivez - nous</h4>
            <div className="w-[1.4cm] h-[0.1cm] bg-blue-600 mb-4 rounded-full"></div>
            <div className="flex flex-col justify-center md:justify-start space-y-3">
              <a href="#" className="flex items-center space-x-2 text-gray-300 hover:text-blue-500 transition-colors transform hover:scale-105">
                <Facebook size={20} />
                <span>Facebook</span>
              </a>
              <a href="#" className="flex items-center space-x-2 text-gray-300 hover:text-pink-500 transition-colors transform hover:scale-105">
                <Instagram size={20} />
                <span>Instagram</span>
              </a>
              <a href="#" className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors transform hover:scale-105">
                <Twitter size={20} />
                <span>X</span>
              </a>
              <a href="#" className="flex items-center space-x-2 text-gray-300 hover:text-black transition-colors transform hover:scale-105">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
                <span>TikTok</span>
              </a>
            </div>
          </div>
        </div>

        <div className="text-center pt-8 border-t border-white/20">
          <p className="text-gray-400 text-sm">
            © 2025 Pap's Market - Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;