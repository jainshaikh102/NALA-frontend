"use client";
import { useState, useCallback, useRef, useEffect } from "react";
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
  const {
    username,
    sessionId,
    onTranscriptReceived,
    onResponseReceived,
    onError,
  } = options;

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [currentResponse, setCurrentResponse] = useState("");
  const [stage, setStage] = useState<
    "idle" | "listening" | "processing" | "speaking" | "error" | "waiting"
  >("idle");

  const processingRef = useRef(false);
  const autoExecuteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Speech-to-text hook
  const speechToText = useSpeechToText({
    language: "en-UK",
    continuous: true, // Enable continuous listening for auto-execution
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
      const response = await fetch("/api/chat/execute-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: query.trim(),
          chat_session_id: sessionId,
          username: username,
          model_name: "gemini-2.0-flash-001",
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

  // Clear auto-execute timeout
  const clearAutoExecuteTimeout = useCallback(() => {
    if (autoExecuteTimeoutRef.current) {
      clearTimeout(autoExecuteTimeoutRef.current);
      autoExecuteTimeoutRef.current = null;
    }
  }, []);

  // Set auto-execute timeout (2 seconds after user stops talking)
  const setAutoExecuteTimeout = useCallback(
    (transcript: string) => {
      clearAutoExecuteTimeout();

      if (transcript.trim()) {
        setStage("waiting"); // Show waiting state
        autoExecuteTimeoutRef.current = setTimeout(() => {
          console.log("Auto-executing query after 2 seconds of silence");
          processVoiceInput(transcript);
        }, 2000); // 2 seconds delay
      }
    },
    [clearAutoExecuteTimeout]
  );

  // Process voice input end-to-end
  const processVoiceInput = useCallback(
    async (transcript: string) => {
      if (processingRef.current || !transcript.trim()) {
        return;
      }

      // Clear any pending auto-execute timeout
      clearAutoExecuteTimeout();

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

        // Clear transcript and reset to idle state after successful completion
        setTimeout(() => {
          setCurrentTranscript("");
          speechToText.reset(); // Clear speech recognition transcript
          setStage("idle");
          setIsProcessing(false);
          processingRef.current = false;
        }, 1000); // Small delay to let user see the response
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
    [
      executeQuery,
      textToSpeech,
      username,
      onTranscriptReceived,
      onResponseReceived,
      onError,
      clearAutoExecuteTimeout,
    ]
  );

  // Monitor transcript changes for auto-execution
  useEffect(() => {
    if (stage === "listening" && speechToText.transcript) {
      // Set up auto-execution timeout when user has spoken something
      setAutoExecuteTimeout(speechToText.transcript);
    }
  }, [speechToText.transcript, stage, setAutoExecuteTimeout]);

  // Start voice recording
  const startVoiceRecording = useCallback(() => {
    if (isProcessing) {
      return;
    }

    setStage("listening");
    setCurrentTranscript("");
    setCurrentResponse("");
    speechToText.startListening();
  }, [isProcessing, speechToText]);

  // Stop voice recording and process
  const stopVoiceRecording = useCallback(() => {
    if (stage !== "listening") {
      return;
    }

    speechToText.stopListening();

    // Clear any pending auto-execute timeout since user manually stopped
    clearAutoExecuteTimeout();

    // Wait a moment for final transcript
    setTimeout(() => {
      const finalTranscript = speechToText.transcript.trim();
      if (finalTranscript) {
        processVoiceInput(finalTranscript);
      } else {
        setStage("idle");
      }
    }, 500);
  }, [stage, speechToText, processVoiceInput, clearAutoExecuteTimeout]);

  // Toggle voice recording
  const toggleVoiceRecording = useCallback(() => {
    if (stage === "listening") {
      stopVoiceRecording();
    } else if (stage === "waiting") {
      // Cancel auto-execution and return to idle
      clearAutoExecuteTimeout();
      setStage("idle");
      speechToText.reset();
      setCurrentTranscript("");
    } else if (stage === "idle") {
      startVoiceRecording();
    }
  }, [
    stage,
    startVoiceRecording,
    stopVoiceRecording,
    clearAutoExecuteTimeout,
    speechToText,
  ]);

  // Stop all voice activities
  const stopAllVoiceActivities = useCallback(() => {
    clearAutoExecuteTimeout();
    speechToText.reset();
    textToSpeech.stopAudio();
    setStage("idle");
    setIsProcessing(false);
    setCurrentTranscript("");
    setCurrentResponse("");
    processingRef.current = false;
  }, [speechToText, textToSpeech, clearAutoExecuteTimeout]);

  // Get current status message
  const getStatusMessage = useCallback(() => {
    switch (stage) {
      case "idle":
        return "Click microphone to start voice chat";
      case "listening":
        return "Listening... Speak now!";
      case "processing":
        return "Processing your request...";
      case "speaking":
        return "Playing response...";
      case "error":
        return "An error occurred. Please try again.";
      default:
        return "";
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
