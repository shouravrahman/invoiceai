import { useState, useCallback, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceInputProps {
   onTranscript: (text: string) => void;
}

export function VoiceInput({ onTranscript }: VoiceInputProps) {
   const [isListening, setIsListening] = useState(false);
   const [transcript, setTranscript] = useState('');
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
         setTranscript('');
      };

       recognition.onresult = (event: any) => {
         const currentTranscript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join(' ');

         setTranscript(currentTranscript);

         if (event.results[event.results.length - 1].isFinal) {
            onTranscript(currentTranscript);
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
           className={`flex items-center justify-center p-3 rounded-full transition-all duration-200 ${isListening
                 ? 'bg-red-100 text-red-600 hover:bg-red-200'
                 : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
              }`}
           title={isListening ? 'Stop recording' : 'Start recording'}
        >
           {isListening ? (
              <>
                 <MicOff className="h-6 w-6" />
                 <span className="absolute -top-1 -right-1">
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                 </span>
              </>
           ) : (
              <Mic className="h-6 w-6" />
           )}
        </button>

        {isListening && transcript && (
           <div className="fixed inset-x-0 bottom-0 p-6 bg-white border-t shadow-lg transform transition-transform duration-200 ease-in-out">
              <div className="max-w-4xl mx-auto">
                 <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900">Voice Input</h3>
                    <div className="flex items-center space-x-2">
                       <span className="animate-pulse inline-flex h-3 w-3 rounded-full bg-red-500"></span>
                       <span className="text-sm text-gray-500">Recording...</span>
                    </div>
                 </div>
                 <p className="text-lg text-gray-700">{transcript}</p>
              </div>
           </div>
        )}

        {error && (
           <div className="absolute top-full mt-2 w-48 text-sm text-red-600 bg-red-50 p-2 rounded shadow-lg">
              {error}
           </div>
        )}
     </div>
  );
}
