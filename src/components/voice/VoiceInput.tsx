import { useState, useCallback, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceInputProps {
   onTranscript: (text: string) => void;
}

export function VoiceInput({ onTranscript }: VoiceInputProps) {
   const [isListening, setIsListening] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const recognitionRef = useRef<any>(null);

   const startListening = useCallback(() => {
      if (!('webkitSpeechRecognition' in window)) {
         setError('Speech recognition is not supported in this browser.');
         return;
      }

      try {
         if (recognitionRef.current) {
            recognitionRef.current.stop();
         }

         const recognition = new (window as any).webkitSpeechRecognition();
         recognitionRef.current = recognition;

         recognition.continuous = true;
         recognition.interimResults = true;
         recognition.lang = 'en-US';

         recognition.onstart = () => {
            setIsListening(true);
            setError(null);
         };

         recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
               .map((result: any) => result[0].transcript)
               .join(' ');

            if (event.results[event.results.length - 1].isFinal) {
               onTranscript(transcript);
            }
         };

         recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setError(`Error: ${event.error}`);
            setIsListening(false);
         };

         recognition.onend = () => {
            setIsListening(false);
         };

         recognition.start();
      } catch (err) {
         console.error('Speech recognition error:', err);
         setError('Failed to start speech recognition');
         setIsListening(false);
      }
   }, [onTranscript]);

   const stopListening = useCallback(() => {
      if (recognitionRef.current) {
         recognitionRef.current.stop();
         recognitionRef.current = null;
      }
      setIsListening(false);
   }, []);

   return (
      <div className="relative">
         <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`flex items-center justify-center p-2 rounded-full transition-all duration-200 ${isListening
               ? 'bg-red-100 text-red-600 hover:bg-red-200'
               : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
               }`}
            title={isListening ? 'Stop recording' : 'Start recording'}
         >
            {isListening ? (
               <>
                  <MicOff className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1">
                     <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
               </>
            ) : (
               <Mic className="h-5 w-5" />
            )}
         </button>

         {error && (
            <div className="absolute top-full mt-2 w-48 text-sm text-red-600 bg-red-50 p-2 rounded shadow-lg">
               {error}
            </div>
         )}
      </div>
   );
}
