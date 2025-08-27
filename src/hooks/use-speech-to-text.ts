"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";

interface SpeechToTextOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

interface SpeechToTextResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export function useSpeechToText(options: SpeechToTextOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    language = "en-US",
    continuous = true,
    interimResults = true,
    maxAlternatives = 1,
  } = options;

  // Check if speech recognition is supported
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);
    }
  }, []);

  // Initialize speech recognition
  const initializeRecognition = useCallback(() => {
    if (typeof window === "undefined") return null;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = maxAlternatives;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      console.log("Speech recognition started");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptText = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcriptText;
        } else {
          interimTranscript += transcriptText;
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);
        setInterimTranscript("");
      } else {
        setInterimTranscript(interimTranscript);
      }

      // Reset timeout for continuous listening
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Auto-stop after 30 seconds of silence
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current && isListening) {
          stopListening();
        }
      }, 30000);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      
      let errorMessage = "Speech recognition error occurred";
      
      switch (event.error) {
        case "no-speech":
          errorMessage = "No speech detected. Please try again.";
          break;
        case "audio-capture":
          errorMessage = "Microphone access denied or not available.";
          break;
        case "not-allowed":
          errorMessage = "Microphone permission denied. Please allow microphone access.";
          break;
        case "network":
          errorMessage = "Network error occurred during speech recognition.";
          break;
        case "service-not-allowed":
          errorMessage = "Speech recognition service not allowed.";
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }
      
      setError(errorMessage);
      setIsListening(false);
      toast.error(errorMessage);
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log("Speech recognition ended");
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    return recognition;
  }, [language, continuous, interimResults, maxAlternatives, isListening]);

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported) {
      const errorMsg = "Speech recognition is not supported in this browser";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (isListening) {
      return;
    }

    try {
      const recognition = initializeRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        recognition.start();
        toast.success("Listening... Speak now!");
      }
    } catch (err) {
      const errorMsg = "Failed to start speech recognition";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Error starting speech recognition:", err);
    }
  }, [isSupported, isListening, initializeRecognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setIsListening(false);
  }, [isListening]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  }, []);

  // Reset everything
  const reset = useCallback(() => {
    stopListening();
    clearTranscript();
  }, [stopListening, clearTranscript]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    clearTranscript,
    reset,
  };
}

// Extend the Window interface to include speech recognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
