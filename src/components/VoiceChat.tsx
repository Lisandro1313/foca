'use client';

import { useState, useRef, useEffect } from 'react';
import { Phone, PhoneOff, Volume2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface VoiceChatProps {
  tutorName: string;
  tutorImage: string;
  onBack: () => void;
}

const tutorConfig: Record<string, { 
  color: string; 
  voiceName: string; 
  gender: 'female' | 'male';
  language: string;
  languageCode: string;
}> = {
  // English
  Maya: { color: 'from-pink-400 to-purple-500', voiceName: 'Microsoft Zira', gender: 'female', language: 'English', languageCode: 'en-US' },
  Miles: { color: 'from-blue-400 to-cyan-500', voiceName: 'Microsoft David', gender: 'male', language: 'English', languageCode: 'en-GB' },
  Sophie: { color: 'from-green-400 to-emerald-500', voiceName: 'Google UK English Female', gender: 'female', language: 'English', languageCode: 'en-US' },
  
  // Spanish
  Carlos: { color: 'from-amber-400 to-orange-500', voiceName: 'Microsoft Pablo', gender: 'male', language: 'Spanish', languageCode: 'es-ES' },
  Luna: { color: 'from-red-400 to-rose-500', voiceName: 'Microsoft Helena', gender: 'female', language: 'Spanish', languageCode: 'es-MX' },
  
  // Portuguese
  Bruno: { color: 'from-green-400 to-emerald-500', voiceName: 'Google português do Brasil', gender: 'male', language: 'Portuguese', languageCode: 'pt-BR' },
  Isabella: { color: 'from-teal-400 to-cyan-500', voiceName: 'Google português do Brasil', gender: 'female', language: 'Portuguese', languageCode: 'pt-PT' },
  
  // German
  Klaus: { color: 'from-slate-400 to-gray-500', voiceName: 'Google Deutsch', gender: 'male', language: 'German', languageCode: 'de-DE' },
  Greta: { color: 'from-yellow-400 to-amber-500', voiceName: 'Google Deutsch', gender: 'female', language: 'German', languageCode: 'de-DE' },
  
  // French
  Pierre: { color: 'from-blue-400 to-sky-500', voiceName: 'Google français', gender: 'male', language: 'French', languageCode: 'fr-FR' },
  Amélie: { color: 'from-purple-400 to-pink-500', voiceName: 'Google français', gender: 'female', language: 'French', languageCode: 'fr-FR' },
  
  // Italian
  Marco: { color: 'from-green-400 to-lime-500', voiceName: 'Google italiano', gender: 'male', language: 'Italian', languageCode: 'it-IT' },
  Giulia: { color: 'from-red-400 to-orange-500', voiceName: 'Google italiano', gender: 'female', language: 'Italian', languageCode: 'it-IT' },
  
  // Japanese
  Kenji: { color: 'from-pink-400 to-rose-500', voiceName: 'Google 日本語', gender: 'male', language: 'Japanese', languageCode: 'ja-JP' },
  Sakura: { color: 'from-rose-400 to-pink-500', voiceName: 'Google 日本語', gender: 'female', language: 'Japanese', languageCode: 'ja-JP' },
  
  // Mandarin
  Wei: { color: 'from-red-400 to-yellow-500', voiceName: 'Google 普通话（中国大陆）', gender: 'male', language: 'Mandarin', languageCode: 'zh-CN' },
  Mei: { color: 'from-yellow-400 to-amber-500', voiceName: 'Google 普通话（中国大陆）', gender: 'female', language: 'Mandarin', languageCode: 'zh-CN' },
  
  // Korean
  'Min-Jun': { color: 'from-blue-400 to-cyan-500', voiceName: 'Google 한국의', gender: 'male', language: 'Korean', languageCode: 'ko-KR' },
  'Ji-Woo': { color: 'from-pink-400 to-purple-500', voiceName: 'Google 한국의', gender: 'female', language: 'Korean', languageCode: 'ko-KR' },
  
  // Russian
  Dmitri: { color: 'from-slate-400 to-blue-500', voiceName: 'Google русский', gender: 'male', language: 'Russian', languageCode: 'ru-RU' },
  Anastasia: { color: 'from-purple-400 to-indigo-500', voiceName: 'Google русский', gender: 'female', language: 'Russian', languageCode: 'ru-RU' },
  
  // Arabic
  Omar: { color: 'from-amber-400 to-yellow-500', voiceName: 'Microsoft Arabic', gender: 'male', language: 'Arabic', languageCode: 'ar-SA' },
  Layla: { color: 'from-teal-400 to-emerald-500', voiceName: 'Microsoft Arabic', gender: 'female', language: 'Arabic', languageCode: 'ar-SA' },
};

export default function VoiceChat({ tutorName, tutorImage, onBack }: VoiceChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInCall, setIsInCall] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [userName, setUserName] = useState<string>('');
  const [showTranslator, setShowTranslator] = useState(false);
  const [translatorText, setTranslatorText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [fromLang, setFromLang] = useState('es');
  const [toLang, setToLang] = useState('en');
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const isProcessingRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastTranscriptRef = useRef<string>('');
  const conversationContextRef = useRef<string[]>([]);
  const isInCallRef = useRef(false);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userNameRef = useRef<string>('');

  const config = tutorConfig[tutorName] || tutorConfig.Maya;

  useEffect(() => {
    // Initialize speech synthesis
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
      
      // Load voices
      const loadVoices = () => {
        const allVoices = synthRef.current?.getVoices() || [];
        voicesRef.current = allVoices;
        console.log('Available voices:', allVoices.map(v => v.name));
      };
      
      loadVoices();
      if (synthRef.current) {
        synthRef.current.onvoiceschanged = loadVoices;
      }

      // Initialize speech recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true; // Para ver texto en tiempo real
        recognitionRef.current.lang = config.languageCode; // Usar el idioma del tutor
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onresult = (event: any) => {
          // IGNORAR si la IA está hablando
          if (isSpeaking) {
            console.log('Ignoring recognition while AI is speaking');
            return;
          }
          
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += transcript;
            } else {
              interim += transcript;
            }
          }

          console.log('Speech recognition result - interim:', interim, 'final:', final);

          // Mostrar texto temporal mientras hablas
          if (interim) {
            setInterimTranscript(interim);
            lastTranscriptRef.current = interim; // Guardar el último texto
            
            // Resetear timer de silencio
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
            }
            // Nuevo timer: si no hablas por 3.5 segundos, procesar
            silenceTimerRef.current = setTimeout(() => {
              const textToProcess = lastTranscriptRef.current.trim();
              if (textToProcess.length > 0 && !isProcessingRef.current) {
                console.log('Processing after silence:', textToProcess);
                handleUserSpeech(textToProcess);
                setInterimTranscript('');
                lastTranscriptRef.current = '';
              }
            }, 3500); // 3.5 segundos de silencio
          }

          // Texto final (cuando detecta pausa natural)
          if (final && final.trim().length > 0) {
            console.log('Final result:', final);
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
            }
            setInterimTranscript('');
            if (!isProcessingRef.current) {
              handleUserSpeech(final);
            }
            lastTranscriptRef.current = '';
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            alert('Microphone access denied. Please allow microphone access in your browser settings.');
            setIsInCall(false);
            isInCallRef.current = false;
          }
        };

        recognitionRef.current.onend = () => {
          console.log('Recognition ended. isInCallRef:', isInCallRef.current, 'isProcessingRef:', isProcessingRef.current, 'isSpeaking:', isSpeaking);
          // Reiniciar automáticamente si está en llamada Y NO está hablando la IA
          if (isInCallRef.current && !isProcessingRef.current && !isSpeaking) {
            setTimeout(() => {
              if (recognitionRef.current && isInCallRef.current && !isSpeaking) {
                try {
                  recognitionRef.current.start();
                  setIsListening(true);
                  console.log('Recognition restarted');
                } catch (e) {
                  console.log('Recognition already started or error:', e);
                }
              }
            }, 100);
          } else {
            setIsListening(false);
          }
        };
      }
    }

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      // Reiniciar reconocimiento cuando termina de hablar
      if (isInCallRef.current && recognitionRef.current) {
        setTimeout(() => {
          try {
            recognitionRef.current.start();
            setIsListening(true);
            console.log('Recognition restarted after speech stop');
          } catch (e) {
            console.log('Recognition already running:', e);
          }
        }, 300);
      }
    }
  };

  // Detectar cuando el usuario empieza a hablar mientras la IA habla
  useEffect(() => {
    if (interimTranscript && isSpeaking) {
      // Interrumpir a la IA
      stopSpeaking();
    }
  }, [interimTranscript, isSpeaking]);

  const startCall = async () => {
    try {
      if (!recognitionRef.current) {
        alert('Speech recognition is not supported. Please use Chrome or Edge.');
        return;
      }
      
      console.log('Starting call...');
      setIsInCall(true);
      isInCallRef.current = true;
      setCallDuration(0);
      
      // Iniciar contador de tiempo
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      
      // Saludo inicial
      const greeting = getGreeting(tutorName);
      const assistantMessage: Message = { role: 'assistant', content: greeting };
      setMessages([assistantMessage]);
      
      console.log('Speaking greeting:', greeting);
      await speakText(greeting);
      
      // Iniciar escucha después del saludo
      console.log('Starting speech recognition...');
      try {
        await recognitionRef.current.start();
        setIsListening(true);
        console.log('Speech recognition started successfully');
      } catch (startError: any) {
        console.error('Error starting recognition:', startError);
        if (startError.message && startError.message.includes('already started')) {
          console.log('Recognition already started, continuing...');
          setIsListening(true);
        } else {
          throw startError;
        }
      }
      
    } catch (error) {
      console.error('Error starting call:', error);
      alert('Please allow microphone access. Check browser settings if needed.');
      setIsInCall(false);
      isInCallRef.current = false;
    }
  };

  const endCall = () => {
    setIsInCall(false);
    isInCallRef.current = false;
    setIsListening(false);
    setIsSpeaking(false);
    setInterimTranscript('');
    isProcessingRef.current = false;
    lastTranscriptRef.current = '';
    userNameRef.current = '';
    setUserName('');
    
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    stopSpeaking();
    
    // Volver después de 1 segundo
    setTimeout(() => {
      onBack();
    }, 1000);
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUserSpeech = async (transcript: string) => {
    const cleanTranscript = transcript.trim();
    
    console.log('handleUserSpeech called with:', cleanTranscript);
    console.log('isProcessingRef.current:', isProcessingRef.current);
    
    if (!cleanTranscript || isProcessingRef.current) {
      console.log('Skipping - empty or already processing');
      return;
    }

    // Interrumpir si la IA está hablando
    if (isSpeaking) {
      console.log('Stopping AI speech');
      stopSpeaking();
    }

    isProcessingRef.current = true;
    setIsListening(false);

    // Agregar mensaje del usuario
    const userMessage: Message = { role: 'user', content: cleanTranscript };
    console.log('Adding user message:', userMessage);
    setMessages(prev => [...prev, userMessage]);

    // Guardar en contexto de conversación
    conversationContextRef.current.push(`User said: "${cleanTranscript}"`);
    if (conversationContextRef.current.length > 10) {
      conversationContextRef.current.shift();
    }

    try {
      // Pequeña pausa natural
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Obtener respuesta de IA usando la API real
      const reply = await getAIResponseFromAPI(messages.concat(userMessage), tutorName);
      console.log('AI reply:', reply);
      
      const assistantMessage: Message = { role: 'assistant', content: reply };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Guardar respuesta de IA en contexto
      conversationContextRef.current.push(`AI replied: "${reply}"`);

      // Pausar reconocimiento mientras la AI habla
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop();
          setIsListening(false);
        } catch (e) {
          console.log('Error stopping recognition:', e);
        }
      }

      // Hablar la respuesta
      console.log('Speaking reply...');
      await speakText(reply);

      // Reanudar reconocimiento después de hablar
      if (recognitionRef.current && isInCallRef.current) {
        try {
          await new Promise(resolve => setTimeout(resolve, 300)); // Pausa breve
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.log('Error restarting recognition:', e);
        }
      }
      
    } catch (error) {
      console.error('Error processing speech:', error);
      // Fallback a respuesta predefinida
      const fallbackReply = "Sorry, I had a connection issue. Can you repeat that?";
      const assistantMessage: Message = { role: 'assistant', content: fallbackReply };
      setMessages(prev => [...prev, assistantMessage]);
      await speakText(fallbackReply);
      
      // Reintentar reconocimiento si hay error
      if (recognitionRef.current && isInCallRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {}
      }
    } finally {
      isProcessingRef.current = false;
      lastTranscriptRef.current = '';
    }
  };

  // Nueva función para llamar a la API real
  const getAIResponseFromAPI = async (allMessages: Message[], tutor: string): Promise<string> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: allMessages,
          tutorName: tutor,
          conversationHistory: conversationContextRef.current,
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      return data.reply || "Sorry, I didn't catch that.";
    } catch (error) {
      console.error('API call failed:', error);
      // Fallback a respuesta genérica
      return getAIResponse('', tutor);
    }
  };

  const getAIResponse = (userText: string, tutor: string): string => {
    const lower = userText.toLowerCase();
    const tutorLanguage = config.language;
    
    // Guardar en contexto
    conversationContextRef.current.push(userText);
    if (conversationContextRef.current.length > 10) {
      conversationContextRef.current.shift();
    }
    
    // Respuestas por idioma
    if (tutorLanguage === 'English') {
      return getEnglishResponse(userText, lower, tutor);
    } else if (tutorLanguage === 'Spanish') {
      return getSpanishResponse(userText, lower, tutor);
    } else if (tutorLanguage === 'Portuguese') {
      return getPortugueseResponse(userText, lower, tutor);
    } else if (tutorLanguage === 'German') {
      return getGermanResponse(userText, lower, tutor);
    } else if (tutorLanguage === 'French') {
      return getFrenchResponse(userText, lower, tutor);
    } else if (tutorLanguage === 'Italian') {
      return getItalianResponse(userText, lower, tutor);
    } else if (tutorLanguage === 'Japanese') {
      return getJapaneseResponse(userText, lower, tutor);
    } else if (tutorLanguage === 'Mandarin') {
      return getMandarinResponse(userText, lower, tutor);
    } else if (tutorLanguage === 'Korean') {
      return getKoreanResponse(userText, lower, tutor);
    } else if (tutorLanguage === 'Russian') {
      return getRussianResponse(userText, lower, tutor);
    } else if (tutorLanguage === 'Arabic') {
      return getArabicResponse(userText, lower, tutor);
    }
    
    return getEnglishResponse(userText, lower, tutor);
  };

  const translateText = async (text: string, from: string, to: string): Promise<string> => {
    if (!text.trim()) return '';
    
    try {
      // Usar la API pública de Google Translate (sin clave)
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      // La respuesta es un array complejo, extraer la traducción
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        let translation = data[0].map((item: any) => item[0]).join('');
        
        // Si el idioma destino usa caracteres especiales, agregar pronunciación
        if (['ja', 'zh', 'ko', 'ru', 'ar'].includes(to)) {
          // Obtener romanización si está disponible
          if (data[0][0][3]) {
            translation += ` (${data[0][0][3]})`;
          }
        }
        
        return translation;
      }
      
      return 'Translation error';
    } catch (error) {
      console.error('Translation error:', error);
      return 'Translation service unavailable';
    }
  };

  const getEnglishResponse = (userText: string, lower: string, tutor: string): string => {
    // Guardar en contexto
    conversationContextRef.current.push(userText);
    if (conversationContextRef.current.length > 10) {
      conversationContextRef.current.shift();
    }
    
    // Obtener último mensaje del AI
    const lastAIMessage = messages.length > 0 ? messages[messages.length - 1].content.toLowerCase() : '';
    const hasBeenTalking = conversationContextRef.current.length > 2;
    
    // DETECTAR BUCLES - si el usuario repite lo que el AI dice
    const lastThreeUserMessages = conversationContextRef.current.slice(-3).join(' ').toLowerCase();
    if (lastThreeUserMessages.includes('interesting') && lastThreeUserMessages.split('interesting').length > 3) {
      return "I think we're stuck in a loop! Let's change topics. What's your favorite thing to do in your free time?";
    }
    
    if (lastThreeUserMessages.includes('nice') && lastThreeUserMessages.split('nice').length > 3) {
      return "Hmm, let's talk about something different! Tell me, what are your hobbies?";
    }
    
    if (lastThreeUserMessages.includes('i see') && lastThreeUserMessages.split('i see').length > 3) {
      return "Let's start fresh! What do you do for work or study?";
    }
    
    if (lastThreeUserMessages.includes('cool') && lastThreeUserMessages.split('cool').length > 3) {
      return "Okay, new topic! What kind of music do you like?";
    }
    
    // DETECTAR NOMBRE - solo con "my name is", "I'm", "call me"
    if (!userNameRef.current) {
      const namePatterns = [
        /(?:my name is|my name's|call me)\s+([A-Z][a-z]{2,15})/i,
      ];
      
      for (const pattern of namePatterns) {
        const nameMatch = userText.match(pattern);
        if (nameMatch && nameMatch[1]) {
          const detectedName = nameMatch[1];
          const excludedWords = ['Fine', 'Good', 'Okay', 'Working', 'Studying', 'Computer', 'Software', 'Yes', 'Yeah', 'Sure', 'Hello', 'Thanks'];
          
          if (!excludedWords.includes(detectedName)) {
            userNameRef.current = detectedName;
            setUserName(detectedName);
            return `Nice to meet you, ${detectedName}! So, what do you do for work or study?`;
          }
        }
      }
    }

    // PREGUNTA ESPECÍFICA: "Can you repeat my name?"
    if (lower.includes('repeat') && (lower.includes('name') || lower.includes('my'))) {
      if (userNameRef.current) {
        return `Of course! Your name is ${userNameRef.current}. Is that correct?`;
      } else {
        return "I'm sorry, I don't think you've told me your name yet. What's your name?";
      }
    }

    // PREGUNTA ESPECÍFICA: "Can you give me an example?"
    if (lower.includes('example') || lower.includes('examp')) {
      return "Sure! For example, you could tell me about your favorite hobby, or what you did last weekend, or what kind of work you do. What would you like to talk about?";
    }

    // SALUDO con nombre incluido: "hi I'm [Name]" o "hi hi [Name]"
    if ((lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) && !lastAIMessage.includes('hello')) {
      // Buscar nombre en el saludo
      const words = userText.split(' ');
      const nameCandidate = words.find(w => /^[A-Z][a-z]{2,15}$/.test(w));
      
      if (nameCandidate && !['Hello', 'Hey'].includes(nameCandidate)) {
        userNameRef.current = nameCandidate;
        setUserName(nameCandidate);
        return `Hi ${nameCandidate}! Nice to meet you! I'm ${tutor}. How are you doing today?`;
      }
      
      if (hasBeenTalking) {
        return "Yes, we're already chatting! Tell me something about yourself.";
      }
      
      return "Hello! Nice to meet you! What's your name?";
    }
    
    // "How are you?"
    if (lower.includes('how are you') || lower.includes('how do you do')) {
      return tutor === 'Miles' 
        ? "I'm doing great, thanks for asking! How about you?"
        : tutor === 'Sophie'
        ? "I'm very well, thank you! And how are you?"
        : "I'm wonderful! How are you doing?";
    }

    // Respuestas cortas genéricas: "yes", "no", "good", "fine"
    if (['yes', 'yeah', 'yep', 'sure', 'ok', 'okay'].includes(lower.trim())) {
      return "Great! Tell me something interesting about yourself. What do you enjoy doing?";
    }

    if (['no', 'nope', 'not really'].includes(lower.trim())) {
      return "No problem! Let's talk about something else. What are your hobbies?";
    }

    if (['good', 'fine', 'well', "i'm good", "i'm fine", "i'm well"].includes(lower.trim())) {
      const response = userNameRef.current
        ? `That's great, ${userNameRef.current}! So, what would you like to talk about today?`
        : "That's good to hear! What would you like to talk about?";
      return response;
    }

    // Agradecimientos
    if (lower.includes('thank')) {
      return "You're very welcome! Want to keep practicing? What else would you like to talk about?";
    }

    // Palabras clave: trabajo/estudio - detectar profesiones
    if (lower.includes("i'm a") || lower.includes("i am a")) {
      if (lower.includes('accountant') || lower.includes('lawyer') || lower.includes('doctor') || lower.includes('engineer') || lower.includes('teacher') || lower.includes('programmer') || lower.includes('designer') || lower.includes('architect') || lower.includes('notary')) {
        return "That's a great profession! What do you enjoy most about your work?";
      }
    }
    
    if (lower.includes('work') || lower.includes('job') || lower.includes('study') || lower.includes('student') || lower.includes('university') || lower.includes('school')) {
      return "That sounds interesting! What do you like most about it?";
    }

    // Palabras clave: gustos/hobbies
    if (lower.includes('like') || lower.includes('love') || lower.includes('enjoy') || lower.includes('hobby') || lower.includes('hobbies')) {
      return "That's cool! How long have you been into that?";
    }

    // Respuestas MUY cortas (menos de 3 palabras) - pedir más detalle
    // PERO: si el usuario está repitiendo lo que el AI dice, cambiar de tema
    if (userText.split(' ').length <= 3) {
      // Si el usuario repite partes de lo que el AI dijo, cambiar de tema
      if (lastAIMessage && (
        (lower.includes('interesting') && lastAIMessage.includes('interesting')) ||
        (lower.includes('nice') && lastAIMessage.includes('nice')) ||
        (lower.includes('cool') && lastAIMessage.includes('cool')) ||
        (lower.includes('fascinating') && lastAIMessage.includes('fascinating')) ||
        (lower.includes('great') && lastAIMessage.includes('great')) ||
        (lower.includes('can you') && lastAIMessage.includes('can you')) ||
        (lower.includes('i see') && lastAIMessage.includes('see'))
      )) {
        const topics = [
          "Let's change the subject! What do you like to do for fun?",
          "How about we talk about something else? What are your hobbies?",
          "Let's try a different topic! What's your favorite food?",
          "New question - what do you do on weekends?",
        ];
        return topics[Math.floor(Math.random() * topics.length)];
      }
      
      const askMore = [
        "Interesting! Can you tell me more about that?",
        "I see! Can you elaborate a bit?",
        "That's nice! What else can you tell me?",
        "Cool! Can you give me more details?",
      ];
      return askMore[Math.floor(Math.random() * askMore.length)];
    }

    // Respuestas más largas - seguimiento contextual
    const contextualResponses = [
      "That's really interesting! What made you get into that?",
      "I love that! So what's your favorite thing about it?",
      "That sounds great! How long have you been doing that?",
      "Fascinating! What do you enjoy most about it?",
      "Nice! Is there anything challenging about it?",
    ];

    return contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
  };

  const getSpanishResponse = (userText: string, lower: string, tutor: string): string => {
    // Guardar en contexto
    conversationContextRef.current.push(userText);
    if (conversationContextRef.current.length > 10) {
      conversationContextRef.current.shift();
    }

    const lastAIMessage = messages.length > 0 ? messages[messages.length - 1].content.toLowerCase() : '';
    const hasBeenTalking = conversationContextRef.current.length > 2;

    // DETECTAR BUCLES - si el usuario repite lo que el AI dice
    const lastThreeUserMessages = conversationContextRef.current.slice(-3).join(' ').toLowerCase();
    if (lastThreeUserMessages.includes('clima') && lastThreeUserMessages.split('clima').length > 3) {
      return "Parece que estamos en un bucle! Hablemos de otra cosa. ¿Cuál es tu comida favorita?";
    }
    
    if (lastThreeUserMessages.includes('interesante') && lastThreeUserMessages.split('interesante').length > 3) {
      return "Hmm, cambiemos de tema! ¿Qué te gusta hacer en tu tiempo libre?";
    }

    // DETECTAR NOMBRE - solo si dice explícitamente "me llamo" o "mi nombre es"
    if (!userNameRef.current) {
      const namePatterns = [
        /(?:me llamo|mi nombre es)\s+([A-Z][a-z]{2,15})/i,
      ];
      
      for (const pattern of namePatterns) {
        const nameMatch = userText.match(pattern);
        if (nameMatch && nameMatch[1]) {
          const detectedName = nameMatch[1];
          const excludedWords = ['Bien', 'Bueno', 'Vale', 'Claro', 'Hola', 'Gracias'];
          
          if (!excludedWords.includes(detectedName)) {
            userNameRef.current = detectedName;
            setUserName(detectedName);
            return `¡Mucho gusto, ${detectedName}! ¿A qué te dedicas?`;
          }
        }
      }
    }

    // PREGUNTAS ESPECÍFICAS
    if (lower.includes('cómo te llamas') || lower.includes('como te llamas') || lower.includes('cuál es tu nombre') || lower.includes('cual es tu nombre')) {
      return `¡Me llamo ${tutor}! ¿Y tú? ¿Cómo te llamas?`;
    }

    if (lower.includes('repite') && lower.includes('nombre')) {
      if (userNameRef.current) {
        return `Claro! Tu nombre es ${userNameRef.current}. ¿Es correcto?`;
      } else {
        return "Lo siento, no creo que me hayas dicho tu nombre todavía. ¿Cómo te llamas?";
      }
    }

    if (lower.includes('ejemplo')) {
      return "¡Por supuesto! Por ejemplo, podrías contarme sobre tu pasatiempo favorito, qué hiciste el fin de semana, o de qué trabajas. ¿De qué te gustaría hablar?";
    }

    // SALUDOS
    if ((lower.includes('hola') || lower.includes('buenos') || lower.includes('buenas')) && !lastAIMessage.includes('hola')) {
      const words = userText.split(' ');
      const nameCandidate = words.find(w => /^[A-Z][a-z]{2,15}$/.test(w));
      
      if (nameCandidate && !['Hola', 'Buenos', 'Buenas'].includes(nameCandidate)) {
        userNameRef.current = nameCandidate;
        setUserName(nameCandidate);
        return `¡Hola ${nameCandidate}! ¡Mucho gusto! Soy ${tutor}. ¿Cómo estás hoy?`;
      }
      
      if (hasBeenTalking) {
        return "Sí, ¡ya estamos hablando! Cuéntame algo sobre ti.";
      }
      
      return "¡Hola! ¡Mucho gusto! ¿Cómo te llamas?";
    }

    // "¿Cómo estás?"
    if (lower.includes('cómo estás') || lower.includes('como estas') || lower.includes('qué tal') || lower.includes('que tal')) {
      return tutor === 'Carlos'
        ? "¡Estoy muy bien, gracias por preguntar! ¿Y tú cómo estás?"
        : "¡Estoy genial! ¿Y tú? ¿Cómo te va?";
    }

    // Respuestas cortas genéricas
    if (['sí', 'si', 'vale', 'ok', 'bueno', 'claro'].includes(lower.trim())) {
      return "¡Genial! Cuéntame algo interesante sobre ti. ¿Qué te gusta hacer?";
    }

    if (['no', 'nada', 'no mucho'].includes(lower.trim())) {
      return "No hay problema! Hablemos de otra cosa. ¿Cuáles son tus hobbies?";
    }

    if (['bien', 'muy bien', 'genial', 'excelente'].includes(lower.trim())) {
      const response = userNameRef.current
        ? `¡Qué bueno, ${userNameRef.current}! ¿De qué te gustaría hablar hoy?`
        : "¡Me alegro! ¿De qué quieres hablar?";
      return response;
    }

    // Agradecimientos
    if (lower.includes('gracias')) {
      return "¡De nada! ¿Quieres seguir practicando? ¿De qué más te gustaría hablar?";
    }

    // TEMAS ESPECÍFICOS - Clima
    if (lower.includes('clima') || lower.includes('tiempo')) {
      return "¡Ah, el clima! ¿Cómo está el tiempo donde vives? ¿Prefieres el frío o el calor?";
    }

    // Trabajo/estudio - detectar profesiones
    if (lower.includes('soy') && (lower.includes('contador') || lower.includes('escribano') || lower.includes('abogado') || lower.includes('doctor') || lower.includes('ingeniero') || lower.includes('profesor') || lower.includes('programador') || lower.includes('diseñador') || lower.includes('arquitecto'))) {
      return "¡Qué interesante profesión! ¿Qué es lo que más disfrutas de tu trabajo?";
    }
    
    if (lower.includes('trabajo') || lower.includes('trabaja') || lower.includes('estudio') || lower.includes('estudiante') || lower.includes('universidad')) {
      return "¡Qué interesante! ¿Qué es lo que más te gusta de eso?";
    }

    // Gustos
    if (lower.includes('gusta') || lower.includes('encanta') || lower.includes('favorito') || lower.includes('favorita')) {
      return "¡Qué bueno! ¿Hace cuánto tiempo te interesa eso?";
    }

    // Respuestas MUY cortas (menos de 3 palabras)
    // PERO: si el usuario está repitiendo lo que el AI dice, cambiar de tema
    if (userText.split(' ').length <= 3) {
      // Si el usuario repite partes de lo que el AI dijo, cambiar de tema
      if (lastAIMessage && (
        (lower.includes('clima') && lastAIMessage.includes('clima')) ||
        (lower.includes('interesante') && lastAIMessage.includes('interesante')) ||
        (lower.includes('tiempo') && lastAIMessage.includes('tiempo')) ||
        (lower.includes('genial') && lastAIMessage.includes('genial')) ||
        (lower.includes('bueno') && lastAIMessage.includes('bueno'))
      )) {
        const topics = [
          "¡Cambiemos de tema! ¿Qué te gusta hacer en tu tiempo libre?",
          "¿Qué tal si hablamos de otra cosa? ¿Cuáles son tus hobbies?",
          "Intentemos un tema diferente! ¿Cuál es tu comida favorita?",
          "Nueva pregunta - ¿qué haces los fines de semana?",
        ];
        return topics[Math.floor(Math.random() * topics.length)];
      }
      
      const askMore = [
        "¡Interesante! ¿Puedes contarme más sobre eso?",
        "Ya veo. ¿Me puedes dar más detalles?",
        "Qué bien! ¿Qué más me puedes contar?",
        "¡Genial! ¿Puedes elaborar un poco más?",
      ];
      return askMore[Math.floor(Math.random() * askMore.length)];
    }

    // Respuestas más largas - seguimiento contextual
    const contextualResponses = [
      "¡Qué interesante! ¿Qué te llevó a interesarte en eso?",
      "¡Me encanta! ¿Cuál es tu parte favorita de eso?",
      "¡Suena genial! ¿Hace cuánto tiempo haces eso?",
      "¡Fascinante! ¿Qué es lo que más disfrutas de eso?",
      "¡Qué bueno! ¿Hay algo desafiante sobre eso?",
    ];

    return contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
  };

  const getPortugueseResponse = (userText: string, lower: string, tutor: string): string => {
    conversationContextRef.current.push(userText);
    if (conversationContextRef.current.length > 10) conversationContextRef.current.shift();
    const lastAIMessage = messages.length > 0 ? messages[messages.length - 1].content.toLowerCase() : '';
    const hasBeenTalking = conversationContextRef.current.length > 2;

    // Detectar nombre
    const namePatterns = [/(?:me chamo|meu nome é|sou)\s+([A-Z][a-z]{2,15})/i, /^([A-Z][a-z]{2,15})$/];
    for (const pattern of namePatterns) {
      const nameMatch = userText.match(pattern);
      if (nameMatch && nameMatch[1] && !['Bem', 'Bom', 'Olá', 'Obrigado'].includes(nameMatch[1])) {
        userNameRef.current = nameMatch[1];
        setUserName(nameMatch[1]);
        return `Muito prazer, ${nameMatch[1]}! O que você faz?`;
      }
    }

    if (lower.includes('como você se chama') || lower.includes('qual é seu nome')) {
      return `Meu nome é ${tutor}! E você? Como se chama?`;
    }

    if ((lower.includes('olá') || lower.includes('oi')) && !lastAIMessage.includes('olá')) {
      if (hasBeenTalking) return "Sim, já estamos conversando! Me conte algo sobre você.";
      return "Olá! Prazer em conhecê-lo! Como se chama?";
    }

    if (lower.includes('como você está') || lower.includes('tudo bem')) {
      return "Estou ótimo! E você? Como está?";
    }

    if (['sim', 'ok', 'bom', 'claro'].includes(lower.trim())) {
      return "Ótimo! Me conte algo interessante sobre você. O que gosta de fazer?";
    }

    if (['não', 'nada'].includes(lower.trim())) {
      return "Sem problema! Vamos falar de outra coisa. Quais são seus hobbies?";
    }

    if (['bem', 'muito bem', 'ótimo'].includes(lower.trim())) {
      return userNameRef.current ? `Que bom, ${userNameRef.current}! Do que gostaria de falar hoje?` : "Que bom! Do que quer falar?";
    }

    if (lower.includes('obrigado')) return "De nada! Quer continuar praticando? Sobre o que mais gostaria de falar?";
    if (lower.includes('trabalho') || lower.includes('estudo')) return "Que interessante! O que você mais gosta nisso?";
    if (lower.includes('gosto') || lower.includes('favorito')) return "Que legal! Há quanto tempo você gosta disso?";

    if (userText.split(' ').length <= 3) {
      const askMore = ["Interessante! Pode me contar mais sobre isso?", "Entendo. Pode dar mais detalhes?", "Que bom! O que mais pode me contar?"];
      return askMore[Math.floor(Math.random() * askMore.length)];
    }

    const contextualResponses = [
      "Que interessante! O que te levou a se interessar por isso?",
      "Adoro isso! Qual é sua parte favorita?",
      "Parece ótimo! Há quanto tempo você faz isso?",
      "Fascinante! O que você mais gosta nisso?",
    ];
    return contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
  };

  const getGermanResponse = (userText: string, lower: string, tutor: string): string => {
    conversationContextRef.current.push(userText);
    if (conversationContextRef.current.length > 10) conversationContextRef.current.shift();
    const lastAIMessage = messages.length > 0 ? messages[messages.length - 1].content.toLowerCase() : '';
    const hasBeenTalking = conversationContextRef.current.length > 2;

    // Detectar nombre
    const namePatterns = [/(?:ich heiße|mein name ist|ich bin)\s+([A-Z][a-z]{2,15})/i, /^([A-Z][a-z]{2,15})$/];
    for (const pattern of namePatterns) {
      const nameMatch = userText.match(pattern);
      if (nameMatch && nameMatch[1] && !['Gut', 'Sehr', 'Hallo', 'Danke'].includes(nameMatch[1])) {
        userNameRef.current = nameMatch[1];
        setUserName(nameMatch[1]);
        return `Schön dich kennenzulernen, ${nameMatch[1]}! Was machst du beruflich?`;
      }
    }

    if (lower.includes('wie heißt du') || lower.includes('wie ist dein name')) {
      return `Ich heiße ${tutor}! Und du? Wie heißt du?`;
    }

    if ((lower.includes('hallo') || lower.includes('guten')) && !lastAIMessage.includes('hallo')) {
      if (hasBeenTalking) return "Ja, wir unterhalten uns bereits! Erzähl mir etwas über dich.";
      return "Hallo! Schön dich kennenzulernen! Wie heißt du?";
    }

    if (lower.includes('wie geht') || lower.includes('wie gehts')) {
      return "Mir geht es sehr gut! Und dir? Wie geht es dir?";
    }

    if (['ja', 'ok', 'gut', 'klar'].includes(lower.trim())) {
      return "Super! Erzähl mir etwas Interessantes über dich. Was machst du gerne?";
    }

    if (['nein', 'nicht'].includes(lower.trim())) {
      return "Kein Problem! Lass uns über etwas anderes sprechen. Was sind deine Hobbys?";
    }

    if (['gut', 'sehr gut', 'prima'].includes(lower.trim())) {
      return userNameRef.current ? `Das freut mich, ${userNameRef.current}! Worüber möchtest du heute sprechen?` : "Das freut mich! Worüber möchtest du sprechen?";
    }

    if (lower.includes('danke')) return "Gern geschehen! Möchtest du weiter üben? Worüber möchtest du noch sprechen?";
    if (lower.includes('arbeit') || lower.includes('studium')) return "Interessant! Was gefällt dir daran am besten?";
    if (lower.includes('mag') || lower.includes('liebe') || lower.includes('favorit')) return "Cool! Seit wann interessierst du dich dafür?";

    if (userText.split(' ').length <= 3) {
      const askMore = ["Interessant! Kannst du mir mehr darüber erzählen?", "Verstehe. Kannst du das näher erläutern?", "Toll! Was kannst du mir noch erzählen?"];
      return askMore[Math.floor(Math.random() * askMore.length)];
    }

    const contextualResponses = [
      "Sehr interessant! Was hat dich dazu gebracht, dich dafür zu interessieren?",
      "Das liebe ich! Was ist dein Lieblingsteil daran?",
      "Klingt toll! Wie lange machst du das schon?",
      "Faszinierend! Was gefällt dir am meisten daran?",
    ];
    return contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
  };

  const getFrenchResponse = (userText: string, lower: string, tutor: string): string => {
    conversationContextRef.current.push(userText);
    if (conversationContextRef.current.length > 10) conversationContextRef.current.shift();
    const lastAIMessage = messages.length > 0 ? messages[messages.length - 1].content.toLowerCase() : '';
    const hasBeenTalking = conversationContextRef.current.length > 2;

    // Detectar nombre
    const namePatterns = [/(?:je m'appelle|mon nom est|je suis)\s+([A-Z][a-z]{2,15})/i, /^([A-Z][a-z]{2,15})$/];
    for (const pattern of namePatterns) {
      const nameMatch = userText.match(pattern);
      if (nameMatch && nameMatch[1] && !['Bien', 'Bon', 'Bonjour', 'Merci'].includes(nameMatch[1])) {
        userNameRef.current = nameMatch[1];
        setUserName(nameMatch[1]);
        return `Enchanté, ${nameMatch[1]}! Que fais-tu dans la vie?`;
      }
    }

    if (lower.includes('comment tu t\'appelles') || lower.includes('quel est ton nom')) {
      return `Je m'appelle ${tutor}! Et toi? Comment tu t'appelles?`;
    }

    if ((lower.includes('bonjour') || lower.includes('salut')) && !lastAIMessage.includes('bonjour')) {
      if (hasBeenTalking) return "Oui, nous parlons déjà! Parle-moi de toi.";
      return "Bonjour! Enchanté! Comment tu t'appelles?";
    }

    if (lower.includes('comment ça va') || lower.includes('comment allez-vous')) {
      return "Je vais très bien! Et toi? Comment vas-tu?";
    }

    if (['oui', 'ok', 'bon', 'd\'accord'].includes(lower.trim())) {
      return "Super! Dis-moi quelque chose d'intéressant sur toi. Qu'aimes-tu faire?";
    }

    if (['non', 'pas vraiment'].includes(lower.trim())) {
      return "Pas de problème! Parlons d'autre chose. Quels sont tes hobbies?";
    }

    if (['bien', 'très bien', 'super'].includes(lower.trim())) {
      return userNameRef.current ? `C'est super, ${userNameRef.current}! De quoi aimerais-tu parler aujourd'hui?` : "C'est super! De quoi veux-tu parler?";
    }

    if (lower.includes('merci')) return "De rien! Tu veux continuer à pratiquer? De quoi d'autre aimerais-tu parler?";
    if (lower.includes('travail') || lower.includes('étude')) return "C'est intéressant! Qu'est-ce que tu aimes le plus là-dedans?";
    if (lower.includes('aime') || lower.includes('adore') || lower.includes('préféré')) return "C'est cool! Depuis combien de temps ça t'intéresse?";

    if (userText.split(' ').length <= 3) {
      const askMore = ["Intéressant! Peux-tu m'en dire plus?", "Je vois. Peux-tu donner plus de détails?", "Super! Que peux-tu me dire d'autre?"];
      return askMore[Math.floor(Math.random() * askMore.length)];
    }

    const contextualResponses = [
      "C'est très intéressant! Qu'est-ce qui t'a amené à t'y intéresser?",
      "J'adore ça! Quelle est ta partie préférée?",
      "Ça a l'air génial! Depuis combien de temps tu fais ça?",
      "Fascinant! Qu'est-ce que tu aimes le plus là-dedans?",
    ];
    return contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
  };

  const getItalianResponse = (userText: string, lower: string, tutor: string): string => {
    conversationContextRef.current.push(userText);
    if (conversationContextRef.current.length > 10) conversationContextRef.current.shift();
    const lastAIMessage = messages.length > 0 ? messages[messages.length - 1].content.toLowerCase() : '';
    const hasBeenTalking = conversationContextRef.current.length > 2;

    // Detectar nombre
    const namePatterns = [/(?:mi chiamo|il mio nome è|sono)\s+([A-Z][a-z]{2,15})/i, /^([A-Z][a-z]{2,15})$/];
    for (const pattern of namePatterns) {
      const nameMatch = userText.match(pattern);
      if (nameMatch && nameMatch[1] && !['Bene', 'Buono', 'Ciao', 'Grazie'].includes(nameMatch[1])) {
        userNameRef.current = nameMatch[1];
        setUserName(nameMatch[1]);
        return `Piacere di conoscerti, ${nameMatch[1]}! Che lavoro fai?`;
      }
    }

    if (lower.includes('come ti chiami') || lower.includes('qual è il tuo nome')) {
      return `Mi chiamo ${tutor}! E tu? Come ti chiami?`;
    }

    if ((lower.includes('ciao') || lower.includes('buon')) && !lastAIMessage.includes('ciao')) {
      if (hasBeenTalking) return "Sì, stiamo già parlando! Dimmi qualcosa di te.";
      return "Ciao! Piacere di conoscerti! Come ti chiami?";
    }

    if (lower.includes('come stai') || lower.includes('come va')) {
      return "Sto benissimo! E tu? Come stai?";
    }

    if (['sì', 'si', 'ok', 'bene', 'va bene'].includes(lower.trim())) {
      return "Fantastico! Dimmi qualcosa di interessante su di te. Cosa ti piace fare?";
    }

    if (['no', 'non'].includes(lower.trim())) {
      return "Nessun problema! Parliamo d'altro. Quali sono i tuoi hobby?";
    }

    if (['bene', 'molto bene', 'benissimo'].includes(lower.trim())) {
      return userNameRef.current ? `Che bello, ${userNameRef.current}! Di cosa vorresti parlare oggi?` : "Che bello! Di cosa vuoi parlare?";
    }

    if (lower.includes('grazie')) return "Prego! Vuoi continuare a praticare? Di cos'altro vorresti parlare?";
    if (lower.includes('lavoro') || lower.includes('studio')) return "Che interessante! Cosa ti piace di più?";
    if (lower.includes('piace') || lower.includes('amo') || lower.includes('preferito')) return "Fantastico! Da quanto tempo ti interessa?";

    if (userText.split(' ').length <= 3) {
      const askMore = ["Interessante! Puoi dirmi di più?", "Capisco. Puoi dare più dettagli?", "Bello! Cos'altro puoi dirmi?"];
      return askMore[Math.floor(Math.random() * askMore.length)];
    }

    const contextualResponses = [
      "Molto interessante! Cosa ti ha portato a interessartene?",
      "Adoro questo! Qual è la tua parte preferita?",
      "Sembra fantastico! Da quanto tempo lo fai?",
      "Affascinante! Cosa ti piace di più?",
    ];
    return contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
  };

  const getJapaneseResponse = (userText: string, lower: string, tutor: string): string => {
    conversationContextRef.current.push(userText);
    if (conversationContextRef.current.length > 10) conversationContextRef.current.shift();
    const hasBeenTalking = conversationContextRef.current.length > 2;

    if (lower.includes('名前') && (lower.includes('何') || lower.includes('教えて'))) {
      return `私は${tutor}です！あなたの名前は何ですか？`;
    }

    if ((lower.includes('こんにちは') || lower.includes('おはよう')) && hasBeenTalking) {
      return "はい、もう話していますね！あなたのことを教えてください。";
    } else if (lower.includes('こんにちは') || lower.includes('おはよう')) {
      return "こんにちは！お会いできて嬉しいです！お名前は何ですか？";
    }

    if (lower.includes('元気') || lower.includes('調子')) {
      return "元気です！あなたは？調子はどうですか？";
    }

    if (['はい', 'そう', 'いいですね'].some(w => lower.trim() === w)) {
      return "素晴らしい！あなたについて何か面白いことを教えてください。何が好きですか？";
    }

    if (['いいえ', 'ちがう'].some(w => lower.trim() === w)) {
      return "大丈夫です！他のことを話しましょう。趣味は何ですか？";
    }

    if (lower.includes('ありがとう')) return "どういたしまして！練習を続けたいですか？他に何について話したいですか？";
    if (lower.includes('仕事') || lower.includes('勉強')) return "面白いですね！一番好きなところは何ですか？";
    if (lower.includes('好き') || lower.includes('大好き')) return "いいですね！いつから興味がありますか？";

    if (userText.split('').length <= 10) {
      const askMore = ["面白いですね！もっと教えてください。", "なるほど。もっと詳しく教えてもらえますか？", "いいですね！他に何か教えてもらえますか？"];
      return askMore[Math.floor(Math.random() * askMore.length)];
    }

    const contextualResponses = [
      "とても面白いですね！何がきっかけで興味を持ちましたか？",
      "素晴らしいですね！一番好きな部分は何ですか？",
      "いいですね！どのくらいやっていますか？",
      "魅力的ですね！何が一番好きですか？",
    ];
    return contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
  };

  const getMandarinResponse = (userText: string, lower: string, tutor: string): string => {
    conversationContextRef.current.push(userText);
    if (conversationContextRef.current.length > 10) conversationContextRef.current.shift();
    const hasBeenTalking = conversationContextRef.current.length > 2;

    if (lower.includes('叫什么') || lower.includes('名字')) {
      return `我叫${tutor}！你呢？你叫什么名字？`;
    }

    if ((lower.includes('你好') || lower.includes('您好')) && hasBeenTalking) {
      return "是的，我们已经在聊天了！告诉我一些关于你的事情。";
    } else if (lower.includes('你好') || lower.includes('您好')) {
      return "你好！很高兴认识你！你叫什么名字？";
    }

    if (lower.includes('怎么样') || lower.includes('好吗')) {
      return "我很好！你呢？你好吗？";
    }

    if (['是', '好', '可以'].some(w => lower.trim() === w)) {
      return "太好了！告诉我一些关于你的有趣的事情。你喜欢做什么？";
    }

    if (['不', '没有'].some(w => lower.trim() === w)) {
      return "没关系！我们聊点别的。你的爱好是什么？";
    }

    if (lower.includes('谢谢')) return "不客气！想继续练习吗？你还想聊什么？";
    if (lower.includes('工作') || lower.includes('学习')) return "很有趣！你最喜欢什么？";
    if (lower.includes('喜欢') || lower.includes('爱')) return "太好了！你什么时候开始感兴趣的？";

    if (userText.split('').length <= 10) {
      const askMore = ["有趣！你能告诉我更多吗？", "我明白了。你能给更多细节吗？", "好的！你还能告诉我什么？"];
      return askMore[Math.floor(Math.random() * askMore.length)];
    }

    const contextualResponses = [
      "非常有趣！是什么让你对此感兴趣的？",
      "我喜欢这个！你最喜欢的部分是什么？",
      "听起来很棒！你做这个多久了？",
      "迷人！你最喜欢什么？",
    ];
    return contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
  };

  const getKoreanResponse = (userText: string, lower: string, tutor: string): string => {
    conversationContextRef.current.push(userText);
    if (conversationContextRef.current.length > 10) conversationContextRef.current.shift();
    const hasBeenTalking = conversationContextRef.current.length > 2;

    if (lower.includes('이름이 뭐') || lower.includes('이름')) {
      return `제 이름은 ${tutor}입니다! 당신은요? 이름이 뭐예요?`;
    }

    if ((lower.includes('안녕') || lower.includes('여보세요')) && hasBeenTalking) {
      return "네, 이미 대화하고 있어요! 자신에 대해 말씀해 주세요.";
    } else if (lower.includes('안녕') || lower.includes('여보세요')) {
      return "안녕하세요! 만나서 반갑습니다! 이름이 뭐예요?";
    }

    if (lower.includes('어떻게 지내') || lower.includes('잘 지내')) {
      return "저는 아주 잘 지내요! 당신은요? 어떻게 지내세요?";
    }

    if (['네', '좋아요', '괜찮아요'].some(w => lower.trim() === w)) {
      return "좋아요! 자신에 대해 흥미로운 것을 말씀해 주세요. 무엇을 좋아하세요?";
    }

    if (['아니요', '아니'].some(w => lower.trim() === w)) {
      return "괜찮아요! 다른 것에 대해 이야기해요. 취미가 뭐예요?";
    }

    if (lower.includes('감사합니다') || lower.includes('고마워')) return "천만에요! 계속 연습하고 싶으세요? 또 무엇에 대해 이야기하고 싶으세요?";
    if (lower.includes('일') || lower.includes('공부')) return "흥미롭네요! 가장 좋아하는 부분이 뭐예요?";
    if (lower.includes('좋아') || lower.includes('사랑')) return "좋아요! 언제부터 관심이 있었어요?";

    if (userText.split('').length <= 10) {
      const askMore = ["흥미롭네요! 더 말씀해 주실 수 있나요?", "알겠습니다. 더 자세히 설명해 주실 수 있나요?", "좋아요! 또 무엇을 말씀해 주실 수 있나요?"];
      return askMore[Math.floor(Math.random() * askMore.length)];
    }

    const contextualResponses = [
      "매우 흥미롭네요! 무엇이 그것에 관심을 갖게 했나요?",
      "좋아요! 가장 좋아하는 부분이 뭐예요?",
      "좋아 보이네요! 얼마나 오래 하셨어요?",
      "매력적이네요! 가장 좋아하는 게 뭐예요?",
    ];
    return contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
  };

  const getRussianResponse = (userText: string, lower: string, tutor: string): string => {
    conversationContextRef.current.push(userText);
    if (conversationContextRef.current.length > 10) conversationContextRef.current.shift();
    const hasBeenTalking = conversationContextRef.current.length > 2;

    if (lower.includes('как тебя зовут') || lower.includes('твоё имя')) {
      return `Меня зовут ${tutor}! А тебя? Как тебя зовут?`;
    }

    if ((lower.includes('привет') || lower.includes('здравствуй')) && hasBeenTalking) {
      return "Да, мы уже разговариваем! Расскажи мне о себе.";
    } else if (lower.includes('привет') || lower.includes('здравствуй')) {
      return "Привет! Приятно познакомиться! Как тебя зовут?";
    }

    if (lower.includes('как дела') || lower.includes('как поживаешь')) {
      return "У меня всё отлично! А у тебя? Как дела?";
    }

    if (['да', 'хорошо', 'ладно'].some(w => lower.trim() === w)) {
      return "Отлично! Расскажи мне что-нибудь интересное о себе. Что ты любишь делать?";
    }

    if (['нет', 'не'].some(w => lower.trim() === w)) {
      return "Ничего! Поговорим о чём-нибудь другом. Какие у тебя хобби?";
    }

    if (lower.includes('спасибо')) return "Пожалуйста! Хочешь продолжить практику? О чём ещё хочешь поговорить?";
    if (lower.includes('работа') || lower.includes('учёба')) return "Интересно! Что тебе больше всего нравится в этом?";
    if (lower.includes('люблю') || lower.includes('нравится')) return "Здорово! Как давно тебе это интересно?";

    if (userText.split(' ').length <= 3) {
      const askMore = ["Интересно! Можешь рассказать больше?", "Понятно. Можешь дать больше подробностей?", "Хорошо! Что ещё можешь рассказать?"];
      return askMore[Math.floor(Math.random() * askMore.length)];
    }

    const contextualResponses = [
      "Очень интересно! Что привело тебя к этому интересу?",
      "Мне это нравится! Какая твоя любимая часть?",
      "Звучит отлично! Как давно ты этим занимаешься?",
      "Захватывающе! Что тебе больше всего нравится?",
    ];
    return contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
  };

  const getArabicResponse = (userText: string, lower: string, tutor: string): string => {
    conversationContextRef.current.push(userText);
    if (conversationContextRef.current.length > 10) conversationContextRef.current.shift();
    const hasBeenTalking = conversationContextRef.current.length > 2;

    if (lower.includes('ما اسمك') || lower.includes('اسمك')) {
      return `اسمي ${tutor}! وأنت؟ ما اسمك؟`;
    }

    if ((lower.includes('مرحبا') || lower.includes('السلام')) && hasBeenTalking) {
      return "نعم، نحن نتحدث بالفعل! أخبرني شيئا عن نفسك.";
    } else if (lower.includes('مرحبا') || lower.includes('السلام')) {
      return "مرحبا! سعيد بلقائك! ما اسمك؟";
    }

    if (lower.includes('كيف حالك') || lower.includes('كيف الحال')) {
      return "أنا بخير جدا! وأنت؟ كيف حالك؟";
    }

    if (['نعم', 'حسنا', 'جيد'].some(w => lower.trim() === w)) {
      return "رائع! أخبرني شيئا مثيرا للاهتمام عن نفسك. ماذا تحب أن تفعل؟";
    }

    if (['لا', 'ليس'].some(w => lower.trim() === w)) {
      return "لا بأس! دعنا نتحدث عن شيء آخر. ما هي هواياتك؟";
    }

    if (lower.includes('شكرا')) return "عفوا! تريد أن تستمر في التدريب؟ عن ماذا تريد أن تتحدث أيضا؟";
    if (lower.includes('عمل') || lower.includes('دراسة')) return "مثير للاهتمام! ما الذي تحبه أكثر فيه؟";
    if (lower.includes('أحب') || lower.includes('أفضل')) return "رائع! منذ متى وأنت مهتم بذلك؟";

    if (userText.split(' ').length <= 3) {
      const askMore = ["مثير للاهتمام! هل يمكنك أن تخبرني المزيد؟", "أفهم. هل يمكنك إعطاء المزيد من التفاصيل؟", "جيد! ماذا يمكنك أن تخبرني أيضا؟"];
      return askMore[Math.floor(Math.random() * askMore.length)];
    }

    const contextualResponses = [
      "مثير للاهتمام جدا! ما الذي دفعك للاهتمام بذلك؟",
      "أحب هذا! ما هو جزءك المفضل؟",
      "يبدو رائعا! منذ متى وأنت تفعل ذلك؟",
      "مذهل! ما الذي تحبه أكثر؟",
    ];
    return contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
  };

  const speakText = async (text: string): Promise<void> => {
    return new Promise((resolve) => {
      // DETENER reconocimiento de voz mientras la IA habla
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop();
          setIsListening(false);
          console.log('Recognition stopped before AI speaks');
        } catch (e) {
          console.log('Error stopping recognition:', e);
        }
      }
      
      setIsSpeaking(true);
      
      try {
        if (!synthRef.current) {
          setIsSpeaking(false);
          resolve();
          return;
        }

        synthRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        currentUtteranceRef.current = utterance;
        
        // Seleccionar voz según género y preferencia
        const voices = voicesRef.current;
        let selectedVoice = null;

        // Intentar encontrar la voz preferida por nombre
        selectedVoice = voices.find(v => v.name.includes(config.voiceName));
        
        // Si no, buscar por código de idioma del tutor
        if (!selectedVoice) {
          const langPrefix = config.languageCode.split('-')[0]; // 'en', 'es', 'pt', etc.
          
          if (config.gender === 'female') {
            selectedVoice = voices.find(v => 
              v.lang.startsWith(langPrefix) && 
              (v.name.toLowerCase().includes('female') || 
               v.name.includes('Zira') || 
               v.name.includes('Helena') || 
               v.name.includes('Sabina'))
            );
          } else {
            selectedVoice = voices.find(v => 
              v.lang.startsWith(langPrefix) && 
              (v.name.toLowerCase().includes('male') || 
               v.name.includes('David') || 
               v.name.includes('Mark') || 
               v.name.includes('Pablo') || 
               v.name.includes('Raul'))
            );
          }
        }

        // Fallback a cualquier voz en el idioma del tutor
        if (!selectedVoice) {
          const langPrefix = config.languageCode.split('-')[0];
          selectedVoice = voices.find(v => v.lang.startsWith(langPrefix));
        }
        
        // Último fallback a inglés
        if (!selectedVoice) {
          selectedVoice = voices.find(v => v.lang.startsWith('en'));
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        utterance.rate = 1.05;
        utterance.pitch = config.gender === 'female' ? 1.1 : 0.9;
        utterance.volume = 1.0;

        utterance.onend = () => {
          setIsSpeaking(false);
          currentUtteranceRef.current = null;
          
          // REINICIAR reconocimiento después de que la IA termine de hablar
          if (isInCallRef.current && recognitionRef.current) {
            setTimeout(() => {
              try {
                recognitionRef.current.start();
                setIsListening(true);
                console.log('Recognition restarted after AI finished speaking');
              } catch (e) {
                console.log('Recognition already running:', e);
              }
            }, 500); // Pequeña pausa de 500ms para evitar captar el final de la voz del tutor
          }
          
          resolve();
        };

        utterance.onerror = () => {
          setIsSpeaking(false);
          currentUtteranceRef.current = null;
          
          // También reiniciar en caso de error
          if (isInCallRef.current && recognitionRef.current) {
            setTimeout(() => {
              try {
                recognitionRef.current.start();
                setIsListening(true);
                console.log('Recognition restarted after speech error');
              } catch (e) {
                console.log('Recognition already running:', e);
              }
            }, 500);
          }
          
          resolve();
        };

        synthRef.current.speak(utterance);
      } catch (error) {
        console.error('Error speaking text:', error);
        setIsSpeaking(false);
        resolve();
      }
    });
  };

  const getGreeting = (name: string): string => {
    const greetings: Record<string, string> = {
      // English
      Maya: "Hi! I'm Maya. I'm so excited to practice English with you! What would you like to talk about?",
      Miles: "Hey! I'm Miles! Ready to have some fun with English? Let's chat!",
      Sophie: "Hello! I'm Sophie. I'm here to help you improve your English. Shall we begin?",
      
      // Spanish
      Carlos: "¡Hola! Soy Carlos. Estoy muy emocionado de practicar español contigo. ¿De qué te gustaría hablar?",
      Luna: "¡Hola! Soy Luna. Estoy aquí para ayudarte con tu español. ¿Cómo estás?",
      
      // Portuguese
      Bruno: "Olá! Eu sou o Bruno. Estou muito animado para praticar português com você! Vamos conversar?",
      Isabella: "Olá! Sou a Isabella. Estou aqui para te ajudar a melhorar seu português. Vamos começar?",
      
      // German
      Klaus: "Hallo! Ich bin Klaus. Ich freue mich, mit dir Deutsch zu üben. Worüber möchtest du sprechen?",
      Greta: "Hallo! Ich bin Greta. Ich bin hier, um dir mit deinem Deutsch zu helfen. Sollen wir anfangen?",
      
      // French
      Pierre: "Bonjour! Je suis Pierre. Je suis ravi de pratiquer le français avec toi! De quoi aimerais-tu parler?",
      Amélie: "Bonjour! Je m'appelle Amélie. Je suis là pour t'aider à améliorer ton français. On commence?",
      
      // Italian
      Marco: "Ciao! Sono Marco. Sono molto felice di praticare l'italiano con te! Di cosa ti piacerebbe parlare?",
      Giulia: "Ciao! Sono Giulia. Sono qui per aiutarti a migliorare il tuo italiano. Iniziamo?",
      
      // Japanese
      Kenji: "こんにちは！けんじです。日本語の練習を一緒にできて嬉しいです！何について話したいですか？",
      Sakura: "こんにちは！さくらです。日本語の上達をお手伝いします。始めましょうか？",
      
      // Mandarin
      Wei: "你好！我是Wei。我很高兴和你一起练习中文！你想聊什么？",
      Mei: "你好！我是Mei。我会帮你提高中文水平。我们开始吧？",
      
      // Korean
      'Min-Jun': "안녕하세요! 민준입니다. 한국어 연습을 함께 해서 기쁩니다! 무엇에 대해 이야기하고 싶으세요?",
      'Ji-Woo': "안녕하세요! 지우입니다. 한국어 실력 향상을 도와드리겠습니다. 시작할까요?",
      
      // Russian
      Dmitri: "Привет! Я Дмитрий. Я рад практиковать русский язык с тобой! О чём хочешь поговорить?",
      Anastasia: "Привет! Я Анастасия. Я здесь, чтобы помочь тебе улучшить твой русский. Начнём?",
      
      // Arabic
      Omar: "مرحبا! أنا عمر. أنا متحمس جدًا لممارسة اللغة العربية معك! عن ماذا تريد أن تتحدث؟",
      Layla: "مرحبا! أنا ليلى. أنا هنا لمساعدتك في تحسين لغتك العربية. هل نبدأ؟",
    };
    return greetings[name] || greetings.Maya;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center relative">
      
      {/* Botones flotantes superiores */}
      {isInCall && (
        <div className="fixed top-6 right-6 z-50 flex flex-col items-end gap-3">
          <div className="flex items-center gap-3">
            {/* Contador de tiempo */}
            <div className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full border border-white/20">
              ⏱️ {formatTime(callDuration)}
            </div>
            
            {/* Botón transcripciones */}
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-lg hover:bg-white/20 transition-all border border-white/20"
            >
              {showTranscript ? '✕ Hide' : '📝 Transcript'}
            </button>
          </div>

          {/* Panel de transcripciones - debajo de los botones */}
          {showTranscript && (
            <div className="w-80 max-h-96 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-y-auto p-4 shadow-2xl">
              <div className="space-y-3">
                <h3 className="text-white font-semibold mb-4">Conversation</h3>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg text-sm ${
                      message.role === 'user'
                        ? 'bg-blue-500/20 text-blue-100 ml-4'
                        : 'bg-white/10 text-gray-200 mr-4'
                    }`}
                  >
                    <div className="font-semibold text-xs mb-1 opacity-70">
                      {message.role === 'user' ? (userName || 'You') : tutorName}
                    </div>
                    {message.content}
                  </div>
                ))}
                {interimTranscript && (
                  <div className="p-3 rounded-lg text-sm bg-blue-500/10 text-blue-200 ml-4 italic">
                    <div className="font-semibold text-xs mb-1 opacity-70">{userName || 'You'}</div>
                    {interimTranscript}...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Traductor rápido - debajo del panel de transcripciones */}
          {showTranslator && (
            <div className="w-80 bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white font-semibold">Quick Translator</h3>
                <button
                  onClick={() => setShowTranslator(false)}
                  className="text-white/60 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Selectores de idioma */}
              <div className="flex items-center gap-2 mb-3">
                <select
                  value={fromLang}
                  onChange={(e) => setFromLang(e.target.value)}
                  className="bg-white/10 text-white px-2 py-1 rounded-lg text-xs border border-white/20 flex-1"
                  style={{ color: 'white' }}
                >
                  <option value="en" style={{ color: 'black' }}>🇬🇧 EN</option>
                  <option value="es" style={{ color: 'black' }}>🇪🇸 ES</option>
                  <option value="pt" style={{ color: 'black' }}>🇧🇷 PT</option>
                  <option value="de" style={{ color: 'black' }}>🇩🇪 DE</option>
                  <option value="fr" style={{ color: 'black' }}>🇫🇷 FR</option>
                  <option value="it" style={{ color: 'black' }}>🇮🇹 IT</option>
                  <option value="ja" style={{ color: 'black' }}>🇯🇵 JA</option>
                  <option value="zh" style={{ color: 'black' }}>🇨🇳 ZH</option>
                  <option value="ko" style={{ color: 'black' }}>🇰🇷 KO</option>
                  <option value="ru" style={{ color: 'black' }}>🇷🇺 RU</option>
                  <option value="ar" style={{ color: 'black' }}>🇸🇦 AR</option>
                </select>
                
                <button
                  onClick={() => {
                    const temp = fromLang;
                    setFromLang(toLang);
                    setToLang(temp);
                  }}
                  className="text-white/60 hover:text-white text-lg"
                >
                  ⇄
                </button>
                
                <select
                  value={toLang}
                  onChange={(e) => setToLang(e.target.value)}
                  className="bg-white/10 text-white px-2 py-1 rounded-lg text-xs border border-white/20 flex-1"
                  style={{ color: 'white' }}
                >
                  <option value="en" style={{ color: 'black' }}>🇬🇧 EN</option>
                  <option value="es" style={{ color: 'black' }}>🇪🇸 ES</option>
                  <option value="pt" style={{ color: 'black' }}>🇧🇷 PT</option>
                  <option value="de" style={{ color: 'black' }}>🇩🇪 DE</option>
                  <option value="fr" style={{ color: 'black' }}>🇫🇷 FR</option>
                  <option value="it" style={{ color: 'black' }}>🇮🇹 IT</option>
                  <option value="ja" style={{ color: 'black' }}>🇯🇵 JA</option>
                  <option value="zh" style={{ color: 'black' }}>🇨🇳 ZH</option>
                  <option value="ko" style={{ color: 'black' }}>🇰🇷 KO</option>
                  <option value="ru" style={{ color: 'black' }}>🇷🇺 RU</option>
                  <option value="ar" style={{ color: 'black' }}>🇸🇦 AR</option>
                </select>
              </div>

              {/* Input de texto */}
              <textarea
                value={translatorText}
                onChange={(e) => setTranslatorText(e.target.value)}
                placeholder="Type here..."
                className="w-full bg-white/10 text-white px-3 py-2 rounded-lg text-sm border border-white/20 mb-2 min-h-[60px] resize-none"
              />

              {/* Botón traducir */}
              <button
                onClick={async () => {
                  const result = await translateText(translatorText, fromLang, toLang);
                  setTranslatedText(result);
                }}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all mb-2"
              >
                Translate
              </button>

              {/* Resultado */}
              {translatedText && (
                <div className="bg-white/5 text-white px-3 py-2 rounded-lg text-sm border border-white/10">
                  {translatedText}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Botón traductor flotante cuando está cerrado */}
      {!showTranslator && isInCall && (
        <button
          onClick={() => setShowTranslator(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-purple-500 to-pink-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all"
          title="Quick Translator"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
        </button>
      )}

      {/* Avatar y nombre del tutor */}
      <div className="text-center mb-12">
        <div className="mb-6">
          <div className={`w-48 h-48 mx-auto rounded-full overflow-hidden shadow-2xl ${isInCall && isSpeaking ? 'animate-pulse ring-4 ring-white/30' : ''} transition-all border-4 border-white/20`}>
            <img 
              src={tutorImage} 
              alt={tutorName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <h2 className="text-4xl font-bold text-white mb-2">{tutorName}</h2>
        <div className="flex items-center justify-center space-x-2 text-gray-300">
          {isInCall ? (
            <>
              {isSpeaking && (
                <>
                  <Volume2 className="animate-pulse" size={20} />
                  <span>Speaking...</span>
                </>
              )}
              {isListening && !isSpeaking && (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Listening...</span>
                </>
              )}
            </>
          ) : (
            <span>Ready to chat</span>
          )}
        </div>
        
        {/* Indicador visual de lo que estás diciendo */}
        {interimTranscript && !showTranscript && (
          <div className="mt-4 max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-white/80 text-sm italic">
            "{interimTranscript}..."
          </div>
        )}
      </div>

      {/* Botón de llamada */}
      <div className="mb-8">
        {!isInCall ? (
          <button
            onClick={startCall}
            className={`relative p-8 rounded-full shadow-2xl transition-all transform hover:scale-110 bg-gradient-to-br ${config.color} group`}
          >
            <Phone size={56} className="text-white" />
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <p className="text-white font-medium text-lg">Start Call</p>
            </div>
          </button>
        ) : (
          <button
            onClick={endCall}
            className="relative p-8 rounded-full shadow-2xl transition-all transform hover:scale-110 bg-gradient-to-br from-red-500 to-red-600 animate-pulse"
          >
            <PhoneOff size={56} className="text-white" />
          </button>
        )}
      </div>

      {/* Botón volver (discreto) */}
      {!isInCall && (
        <button
          onClick={onBack}
          className="fixed top-6 left-6 text-white/50 hover:text-white transition-colors"
        >
          ← Back
        </button>
      )}
    </div>
  );
}
