import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles } from 'lucide-react';

const VoiceInput = ({ onTranscriptionComplete, disabled }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Check if Web Speech API is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = 'en-US';

      recog.onstart = () => {
        setIsListening(true);
        setError('');
      };

      recog.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        onTranscriptionComplete(text);
      };

      recog.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone access denied. Enable permissions in your browser.');
        } else {
          setError('Could not capture audio. Try typing your decision.');
        }
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recog;
    } else {
      setError('Web Speech API is not supported in this browser. Please type.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscriptionComplete]);

  const toggleListening = () => {
    if (disabled) return;
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      setError('');
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.error('Speech Recognition start error:', err);
        setError('Could not start voice capture. Please try typing your decision.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggleListening}
          disabled={disabled || !recognitionRef.current}
          className={`relative p-5 rounded-full transition-all duration-300 ${
            isListening
              ? 'bg-neon-pink text-white glow-shadow-teal scale-105'
              : 'bg-dark-border hover:bg-neon-purple/20 border border-white/10 text-gray-300 hover:text-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {isListening ? (
            <Mic className="w-6 h-6 animate-pulse" />
          ) : (
            <MicOff className="w-6 h-6" />
          )}
          {isListening && (
            <span className="absolute -inset-1 rounded-full border-2 border-neon-pink animate-ping opacity-75" />
          )}
        </button>

        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-300">
            {isListening ? 'Listening to voice...' : 'Voice Command Input'}
          </span>
          <span className="text-xs text-gray-500">
            {isListening ? 'Speak your decision clearly...' : 'Click mic to talk naturally'}
          </span>
        </div>
      </div>

      {isListening && (
        <div className="flex items-end gap-1 h-8 mt-4">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-neon-teal rounded-full visualizer-bar"
              style={{
                height: '100%',
                animationDelay: `${i * 0.08}s`,
                animationDuration: `${0.6 + Math.random() * 0.8}s`,
              }}
            />
          ))}
        </div>
      )}

      {error && (
        <p className="text-xs text-neon-pink mt-2 text-center bg-neon-pink/10 px-3 py-1 rounded-lg border border-neon-pink/20">
          {error}
        </p>
      )}

      {transcript && !isListening && !error && (
        <div className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-left text-sm text-gray-200">
          <span className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1">Transcription captured</span>
          <p className="text-sm leading-snug">{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
