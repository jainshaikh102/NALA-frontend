"use client";
import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useSpeechToText } from "./use-speech-to-text";
import { useTextToSpeech } from "./use-text-to-speech";

interface VoiceChatOptions {
  username: string;
  sessionId: string;
  onTranscriptReceived?: (transcript: string) => void;
  onResponseReceived?: (response: string) => void;
  onError?: (error: string) => void;
}

interface ExecuteQueryResponse {
  answer_str?: string;
  error?: string;
  [key: string]: any;
}

export function useVoiceChat(options: VoiceChatOptions) {
  const { username, sessionId, onTranscriptReceived, onResponseReceived, onError } = options;

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [currentResponse, setCurrentResponse] = useState("");
  const [stage, setStage] = useState<
    "idle" | "listening" | "processing" | "speaking" | "error"
  >("idle");

  const processingRef = useRef(false);

  // Speech-to-text hook
  const speechToText = useSpeechToText({
    language: "en-US",
    continuous: false, // Single utterance for voice chat
    interimResults: true,
  });

  // Text-to-speech hook
  const textToSpeech = useTextToSpeech({
    autoPlay: true,
    onPlayStart: () => {
      setStage("speaking");
    },
    onPlayEnd: () => {
      setStage("idle");
      setIsProcessing(false);
    },
    onError: (error) => {
      setStage("error");
      setIsProcessing(false);
      onError?.(error);
    },
  });

  // Execute query API call
  const executeQuery = useCallback(
    async (query: string): Promise<string> => {
      const response = await fetch("/api/execute-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query.trim(),
          session_id: sessionId,
          username: username,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ExecuteQueryResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.answer_str) {
        throw new Error("No response received from query execution");
      }

      return data.answer_str;
    },
    [sessionId, username]
  );

  // Process voice input end-to-end
  const processVoiceInput = useCallback(
    async (transcript: string) => {
      if (processingRef.current || !transcript.trim()) {
        return;
      }

      processingRef.current = true;
      setIsProcessing(true);
      setCurrentTranscript(transcript);
      setStage("processing");

      try {
        // Notify transcript received
        onTranscriptReceived?.(transcript);

        // Execute query
        const response = await executeQuery(transcript);
        setCurrentResponse(response);
        onResponseReceived?.(response);

        // Synthesize and play response
        await textToSpeech.synthesizeText(response, username);

        toast.success("Voice interaction completed successfully");
      } catch (error) {
        const errorMsg = `Voice processing failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
        setStage("error");
        setIsProcessing(false);
        onError?.(errorMsg);
        toast.error(errorMsg);
        console.error("Voice processing error:", error);
      } finally {
        processingRef.current = false;
      }
    },
    [executeQuery, textToSpeech, username, onTranscriptReceived, onResponseReceived, onError]
  );

  // Start voice recording
  const startVoiceRecording = useCallback(() => {
    if (isProcessing) {
      toast.warning("Please wait for current processing to complete");
      return;
    }

    setStage("listening");
    setCurrentTranscript("");
    setCurrentResponse("");
    speechToText.startListening();
    toast.info("Listening... Speak now!");
  }, [isProcessing, speechToText]);

  // Stop voice recording and process
  const stopVoiceRecording = useCallback(() => {
    if (stage !== "listening") {
      return;
    }

    speechToText.stopListening();

    // Wait a moment for final transcript
    setTimeout(() => {
      const finalTranscript = speechToText.transcript.trim();
      if (finalTranscript) {
        processVoiceInput(finalTranscript);
      } else {
        setStage("idle");
        toast.warning("No speech detected. Please try again.");
      }
    }, 500);
  }, [stage, speechToText, processVoiceInput]);

  // Toggle voice recording
  const toggleVoiceRecording = useCallback(() => {
    if (stage === "listening") {
      stopVoiceRecording();
    } else if (stage === "idle") {
      startVoiceRecording();
    }
  }, [stage, startVoiceRecording, stopVoiceRecording]);

  // Stop all voice activities
  const stopAllVoiceActivities = useCallback(() => {
    speechToText.reset();
    textToSpeech.stopAudio();
    setStage("idle");
    setIsProcessing(false);
    setCurrentTranscript("");
    setCurrentResponse("");
    processingRef.current = false;
  }, [speechToText, textToSpeech]);

  // Get current status message
  const getStatusMessage = useCallback(() => {
    switch (stage) {
      case "listening":
        return "Listening... Speak now!";
      case "processing":
        return "Processing your request...";
      case "speaking":
        return "Playing response...";
      case "error":
        return "An error occurred. Please try again.";
      default:
        return "Click microphone to start voice chat";
    }
  }, [stage]);

  return {
    // State
    isProcessing,
    stage,
    currentTranscript: speechToText.transcript || currentTranscript,
    interimTranscript: speechToText.interimTranscript,
    currentResponse,
    isListening: speechToText.isListening,
    isPlaying: textToSpeech.isPlaying,
    isLoadingAudio: textToSpeech.isLoading,
    error: speechToText.error || textToSpeech.error,
    isSupported: speechToText.isSupported,

    // Actions
    startVoiceRecording,
    stopVoiceRecording,
    toggleVoiceRecording,
    stopAllVoiceActivities,

    // Audio controls
    playResponse: textToSpeech.playAudio,
    pauseResponse: textToSpeech.pauseAudio,
    stopResponse: textToSpeech.stopAudio,

    // Utilities
    getStatusMessage,
  };
}
