'use client';

import { Phone, Globe } from 'lucide-react';

interface Tutor {
  name: string;
  personality: string;
  imageUrl: string;
  color: string;
  voice: string;
  language: string;
  languageCode: string;
  flag: string;
}

interface TutorSelectionProps {
  onSelectTutor: (tutor: { name: string; imageUrl: string }) => void;
}

const tutors: Tutor[] = [
  // English
  {
    name: 'Maya',
    personality: 'Friendly & Patient',
    imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop',
    color: 'from-pink-100 to-rose-100',
    voice: 'nova',
    language: 'English',
    languageCode: 'en-US',
    flag: '🇺🇸',
  },
  {
    name: 'Miles',
    personality: 'Energetic & Fun',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
    color: 'from-blue-100 to-indigo-100',
    voice: 'onyx',
    language: 'English',
    languageCode: 'en-GB',
    flag: '🇬🇧',
  },
  {
    name: 'Sophie',
    personality: 'Professional & Clear',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
    color: 'from-emerald-100 to-teal-100',
    voice: 'shimmer',
    language: 'English',
    languageCode: 'en-US',
    flag: '🇺🇸',
  },
  
  // Spanish
  {
    name: 'Carlos',
    personality: 'Passionate & Expressive',
    imageUrl: 'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=400&h=400&fit=crop',
    color: 'from-amber-100 to-orange-100',
    voice: 'alloy',
    language: 'Spanish',
    languageCode: 'es-ES',
    flag: '🇪🇸',
  },
  {
    name: 'Luna',
    personality: 'Warm & Encouraging',
    imageUrl: 'https://images.unsplash.com/photo-1524638431109-93d95c968f03?w=400&h=400&fit=crop',
    color: 'from-red-100 to-rose-100',
    voice: 'nova',
    language: 'Spanish',
    languageCode: 'es-MX',
    flag: '🇲🇽',
  },
  
  // Portuguese
  {
    name: 'Bruno',
    personality: 'Cheerful & Dynamic',
    imageUrl: 'https://images.unsplash.com/photo-1558222218-b7b54eede3f3?w=400&h=400&fit=crop',
    color: 'from-green-100 to-emerald-100',
    voice: 'onyx',
    language: 'Portuguese',
    languageCode: 'pt-BR',
    flag: '🇧🇷',
  },
  {
    name: 'Isabella',
    personality: 'Friendly & Supportive',
    imageUrl: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&h=400&fit=crop',
    color: 'from-teal-100 to-cyan-100',
    voice: 'shimmer',
    language: 'Portuguese',
    languageCode: 'pt-PT',
    flag: '🇵🇹',
  },
  
  // German
  {
    name: 'Klaus',
    personality: 'Precise & Professional',
    imageUrl: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=400&h=400&fit=crop',
    color: 'from-slate-100 to-gray-200',
    voice: 'onyx',
    language: 'German',
    languageCode: 'de-DE',
    flag: '🇩🇪',
  },
  {
    name: 'Greta',
    personality: 'Patient & Clear',
    imageUrl: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=400&h=400&fit=crop',
    color: 'from-yellow-100 to-amber-100',
    voice: 'nova',
    language: 'German',
    languageCode: 'de-DE',
    flag: '🇩🇪',
  },
  
  // French
  {
    name: 'Pierre',
    personality: 'Charming & Articulate',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    color: 'from-blue-100 to-sky-100',
    voice: 'alloy',
    language: 'French',
    languageCode: 'fr-FR',
    flag: '🇫🇷',
  },
  {
    name: 'Amélie',
    personality: 'Elegant & Encouraging',
    imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop',
    color: 'from-purple-100 to-pink-100',
    voice: 'shimmer',
    language: 'French',
    languageCode: 'fr-FR',
    flag: '🇫🇷',
  },
  
  // Italian
  {
    name: 'Marco',
    personality: 'Expressive & Fun',
    imageUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&h=400&fit=crop',
    color: 'from-green-100 to-lime-100',
    voice: 'alloy',
    language: 'Italian',
    languageCode: 'it-IT',
    flag: '🇮🇹',
  },
  {
    name: 'Giulia',
    personality: 'Warm & Passionate',
    imageUrl: 'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=400&h=400&fit=crop',
    color: 'from-red-100 to-orange-100',
    voice: 'nova',
    language: 'Italian',
    languageCode: 'it-IT',
    flag: '🇮🇹',
  },
  
  // Japanese
  {
    name: 'Kenji',
    personality: 'Polite & Methodical',
    imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop',
    color: 'from-pink-100 to-rose-100',
    voice: 'onyx',
    language: 'Japanese',
    languageCode: 'ja-JP',
    flag: '🇯🇵',
  },
  {
    name: 'Sakura',
    personality: 'Gentle & Patient',
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
    color: 'from-rose-100 to-pink-200',
    voice: 'shimmer',
    language: 'Japanese',
    languageCode: 'ja-JP',
    flag: '🇯🇵',
  },
  
  // Mandarin
  {
    name: 'Wei',
    personality: 'Focused & Clear',
    imageUrl: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=400&h=400&fit=crop',
    color: 'from-red-100 to-yellow-100',
    voice: 'alloy',
    language: 'Mandarin',
    languageCode: 'zh-CN',
    flag: '🇨🇳',
  },
  {
    name: 'Mei',
    personality: 'Encouraging & Sweet',
    imageUrl: 'https://images.unsplash.com/photo-1601288496920-b6154fe3626a?w=400&h=400&fit=crop',
    color: 'from-yellow-100 to-amber-100',
    voice: 'nova',
    language: 'Mandarin',
    languageCode: 'zh-CN',
    flag: '🇨🇳',
  },
  
  // Korean
  {
    name: 'Min-Jun',
    personality: 'Modern & Energetic',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
    color: 'from-blue-100 to-cyan-100',
    voice: 'onyx',
    language: 'Korean',
    languageCode: 'ko-KR',
    flag: '🇰🇷',
  },
  {
    name: 'Ji-Woo',
    personality: 'Friendly & Bright',
    imageUrl: 'https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?w=400&h=400&fit=crop',
    color: 'from-pink-100 to-purple-100',
    voice: 'shimmer',
    language: 'Korean',
    languageCode: 'ko-KR',
    flag: '🇰🇷',
  },
  
  // Russian
  {
    name: 'Dmitri',
    personality: 'Strong & Direct',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
    color: 'from-slate-100 to-blue-100',
    voice: 'alloy',
    language: 'Russian',
    languageCode: 'ru-RU',
    flag: '🇷🇺',
  },
  {
    name: 'Anastasia',
    personality: 'Graceful & Patient',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
    color: 'from-purple-100 to-indigo-100',
    voice: 'nova',
    language: 'Russian',
    languageCode: 'ru-RU',
    flag: '🇷🇺',
  },
  
  // Arabic
  {
    name: 'Omar',
    personality: 'Warm & Welcoming',
    imageUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop',
    color: 'from-amber-100 to-yellow-100',
    voice: 'onyx',
    language: 'Arabic',
    languageCode: 'ar-SA',
    flag: '🇸🇦',
  },
  {
    name: 'Layla',
    personality: 'Kind & Supportive',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    color: 'from-teal-100 to-emerald-100',
    voice: 'shimmer',
    language: 'Arabic',
    languageCode: 'ar-SA',
    flag: '🇸🇦',
  },
];

export default function TutorSelection({ onSelectTutor }: TutorSelectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative">
      
      {/* Login button */}
      <div className="absolute top-6 right-6 z-10">
        <button className="px-6 py-2.5 bg-white text-gray-700 rounded-full shadow-md hover:shadow-lg transition-all border border-gray-200 font-medium text-sm hover:bg-gray-50">
          Sign In
        </button>
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center mb-12">
          <div className="text-7xl mb-4">🦭</div>
          <h1 className="text-5xl font-bold text-gray-800 mb-2">FOCA</h1>
          <p className="text-xl text-gray-600">Focus Talk • Practice English Naturally</p>
        </div>

        <div className="max-w-7xl w-full">
          <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
            Choose Your Conversation Partner
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tutors.map((tutor) => (
              <div
                key={tutor.name}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Image */}
                <div className={`h-48 bg-gradient-to-br ${tutor.color} overflow-hidden relative`}>
                  <img
                    src={tutor.imageUrl}
                    alt={tutor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Language badge */}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                    <span className="text-lg">{tutor.flag}</span>
                    <span className="text-xs font-medium text-gray-700">{tutor.language}</span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {tutor.name}
                  </h3>
                  <p className="text-xs text-gray-600 mb-4">
                    {tutor.personality}
                  </p>
                  
                  {/* Call Button */}
                  <button
                    onClick={() => onSelectTutor({ name: tutor.name, imageUrl: tutor.imageUrl })}
                    className="w-full py-2.5 px-4 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group-hover:scale-105 shadow-md text-sm"
                  >
                    <Phone size={16} />
                    Start Call
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>🎤 Speak naturally • ⚡ Instant feedback • 🌍 Improve fluency</p>
        </div>
      </div>
    </div>
  );
}
