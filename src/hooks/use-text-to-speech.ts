"use client";
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

interface TextToSpeechOptions {
  autoPlay?: boolean;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onError?: (error: string) => void;
}

interface SynthesizeResponse {
  audio_url?: string;
  audio_data?: string;
  error?: string;
}

export function useTextToSpeech(options: TextToSpeechOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { autoPlay = true, onPlayStart, onPlayEnd, onError } = options;

  // Clean up audio resources
  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener("ended", handleAudioEnd);
      audioRef.current.removeEventListener("error", handleAudioError);
      audioRef.current = null;
    }
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
      setCurrentAudioUrl(null);
    }
  }, [currentAudioUrl]);

  // Handle audio playback end
  const handleAudioEnd = useCallback(() => {
    setIsPlaying(false);
    onPlayEnd?.();
    cleanup();
  }, [onPlayEnd, cleanup]);

  // Handle audio playback error
  const handleAudioError = useCallback(() => {
    const errorMsg = "Audio playback failed";
    setError(errorMsg);
    setIsPlaying(false);
    onError?.(errorMsg);
    toast.error(errorMsg);
    cleanup();
  }, [onError, cleanup]);

  // Synthesize text to speech using API
  const synthesizeText = useCallback(
    async (text: string, username: string): Promise<void> => {
      if (!text.trim()) {
        const errorMsg = "No text provided for synthesis";
        setError(errorMsg);
        onError?.(errorMsg);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/audio/synthesize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: text.trim(),
            username: username,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: SynthesizeResponse = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        // Handle different response formats
        let audioUrl: string;

        if (data.audio_url) {
          // Direct URL provided
          audioUrl = data.audio_url;
        } else if (data.audio_data) {
          // Base64 audio data provided
          const audioBlob = new Blob(
            [Uint8Array.from(atob(data.audio_data), (c) => c.charCodeAt(0))],
            { type: "audio/mpeg" }
          );
          audioUrl = URL.createObjectURL(audioBlob);
          setCurrentAudioUrl(audioUrl);
        } else {
          // Assume response is audio blob
          const audioBlob = await response.blob();
          audioUrl = URL.createObjectURL(audioBlob);
          setCurrentAudioUrl(audioUrl);
        }

        // Create and configure audio element
        cleanup(); // Clean up any existing audio
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        // Set up event listeners
        audio.addEventListener("ended", handleAudioEnd);
        audio.addEventListener("error", handleAudioError);

        // Auto-play if enabled
        if (autoPlay) {
          await playAudio();
        }

        toast.success("Audio synthesized successfully");
      } catch (error) {
        const errorMsg = `Text-to-speech failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
        setError(errorMsg);
        onError?.(errorMsg);
        toast.error(errorMsg);
        console.error("Text-to-speech error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [autoPlay, onError, cleanup, handleAudioEnd, handleAudioError]
  );

  // Play the current audio
  const playAudio = useCallback(async (): Promise<void> => {
    if (!audioRef.current) {
      const errorMsg = "No audio available to play";
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    try {
      setIsPlaying(true);
      setError(null);
      onPlayStart?.();
      await audioRef.current.play();
    } catch (error) {
      const errorMsg = `Audio playback failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
      setError(errorMsg);
      setIsPlaying(false);
      onError?.(errorMsg);
      toast.error(errorMsg);
      console.error("Audio playback error:", error);
    }
  }, [onPlayStart, onError]);

  // Pause the current audio
  const pauseAudio = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isPlaying]);

  // Stop the current audio and clean up
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    cleanup();
  }, [cleanup]);

  // Toggle play/pause
  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  }, [isPlaying, pauseAudio, playAudio]);

  return {
    // State
    isPlaying,
    isLoading,
    error,
    hasAudio: !!audioRef.current,

    // Actions
    synthesizeText,
    playAudio,
    pauseAudio,
    stopAudio,
    togglePlayback,
    cleanup,
  };
}
