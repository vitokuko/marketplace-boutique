import React, { useState, useEffect } from 'react';
import banniere1 from '../../assets/Banniere 1.png';
import banniere2 from '../../assets/Banniere 2.png';
import banniere3 from '../../assets/Banniere 3.png';
import banniere4 from '../../assets/Banniere 4.png';

const slides = [
  {
    image: banniere1,
    title: 'Produit Premium',
    subtitle: 'Découvrez l\'excellence',
    gradient: 'from-purple-900/30 via-purple-600/25 to-blue-500/20'
  },
  {
    image: banniere2,
    title: 'Collection Élégante',
    subtitle: 'Style et raffinement',
    gradient: 'from-amber-900/30 via-amber-600/25 to-yellow-400/20'
  },
  {
    image: banniere3,
    title: 'Style Moderne',
    subtitle: 'Innovation et design',
    gradient: 'from-indigo-900/30 via-indigo-600/25 to-purple-400/20'
  },
  {
    image: banniere4,
    title: 'Édition Limitée',
    subtitle: 'Exclusivité garantie',
    gradient: 'from-emerald-900/30 via-emerald-600/25 to-teal-400/20'
  }
];

const CarouselSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="carousel-section" className="w-full relative">
      <div className="relative h-[35vh] sm:h-[40vh] md:h-[60vh] lg:h-[70vh] overflow-hidden shadow-2xl bg-gradient-to-br from-gray-200 via-gray-100 to-gray-50">
        
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border border-white/20 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-24 h-24 border border-white/15 rotate-45 animate-bounce" style={{animationDuration: '3s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-ping" style={{animationDuration: '4s'}}></div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-pulse" style={{animationDuration: '6s'}}></div>
        
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentIndex 
                ? 'opacity-100 scale-100 translate-x-0' 
                : index < currentIndex 
                  ? 'opacity-0 scale-95 -translate-x-full' 
                  : 'opacity-0 scale-95 translate-x-full'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} transition-opacity duration-1000`} />
            
            <div className="relative w-full h-full flex flex-col lg:flex-row items-center justify-center px-3 sm:px-4 md:px-8 lg:px-16 z-10 max-w-7xl mx-auto">

              <div className="flex-1 max-w-md text-center lg:text-left mb-6 lg:mb-0">
                <div className={`transform transition-all duration-1000 delay-300 relative z-20 ${
                  index === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}>
                  <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-2xl">
                    {slide.title}
                  </h2>
                  <p className="text-white/90 text-base sm:text-lg md:text-xl mb-6 drop-shadow-lg">
                    {slide.subtitle}
                  </p>
                  <button
                    onClick={() => window.location.href = '/products'}
                    className="bg-white/20 backdrop-blur-sm text-white px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30 cursor-pointer text-sm sm:text-base"
                  >
                    Découvrir
                  </button>
                </div>
              </div>

              <div className="flex-1 max-w-md flex justify-center items-center">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className={`max-w-xs sm:max-w-sm md:max-w-md h-60 sm:h-80 md:h-[40vh] object-contain transition-transform duration-1000 ${
                    index === currentIndex ? 'scale-100 rotate-0' : 'scale-90 rotate-3'
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-8 h-3 bg-white rounded-full' 
                  : 'w-3 h-3 bg-white/50 rounded-full hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarouselSection;