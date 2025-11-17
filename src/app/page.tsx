'use client';

import { useState } from 'react';
import TutorSelection from '@/components/TutorSelection';
import VoiceChat from '@/components/VoiceChat';

interface TutorData {
  name: string;
  imageUrl: string;
}

export default function Home() {
  const [selectedTutor, setSelectedTutor] = useState<TutorData | null>(null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {!selectedTutor ? (
        <TutorSelection onSelectTutor={setSelectedTutor} />
      ) : (
        <VoiceChat 
          tutorName={selectedTutor.name} 
          tutorImage={selectedTutor.imageUrl}
          onBack={() => setSelectedTutor(null)} 
        />
      )}
    </main>
  );
}
