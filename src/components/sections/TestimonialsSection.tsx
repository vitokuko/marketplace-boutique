import React from 'react';
import { Quote, Star, User } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    text: "Merci pour vos services de qualité, vraiment j'ai aimé les AirPod All day.",
    name: "Moussa Ndoye"
  },
  {
    id: 2,
    text: "Un excellent produit, je suis très satisfait de mes AirPods Pro",
    name: "Amina Diallo"
  },
  {
    id: 3,
    text: "Le son est incroyable, et l'autonomie est impressionnante.",
    name: "Karim Sow"
  }
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Nos clients</h2>
          <p className="text-lg text-gray-600 mb-8">Découvrez ce que nos clients pensent de nous.</p>
          <div className="w-24 h-1 bg-gradient-to-r from-[#389EBF] to-[#3B82F6] mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl hover:border-2 hover:border-[#389EBF] transition-all duration-300 relative border-2 border-transparent"
            >
              <Quote className="text-[#389EBF] mb-4" size={32} />
              
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "{testimonial.text}"
              </p>
              
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-[#389EBF] to-[#3B82F6] rounded-full flex items-center justify-center mr-4">
                  <User className="text-white" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">Client vérifié</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;