"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

// Types for chat session management
export interface ChatSession {
  session_id: string;
  created_at: string;
  preview: string;
}

export interface ChatHistoryMessage {
  role: string;
  content: string;
  username: string;
  timestamp: string;
  display_data?: any;
  data_type?: string;
  query?: string;
  audio_base64?: string;
}

export interface StartSessionRequest {
  username: string;
}

export interface StartSessionResponse {
  chat_session_id: string;
}

export interface EndSessionRequest {
  chat_session_id: string;
}

// Hook for managing chat sessions
export function useChatSessions(username?: string) {
  const queryClient = useQueryClient();

  // Track which session is being deleted
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(
    null
  );

  // Fetch chat sessions for a user
  const {
    data: chatSessions,
    isLoading: isLoadingSessions,
    error: sessionsError,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ["chat-sessions", username],
    queryFn: async (): Promise<ChatSession[]> => {
      if (!username) {
        throw new Error("Username is required");
      }

      const response = await fetch(`/api/chat/sessions/${username}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch chat sessions");
      }

      return response.json();
    },
    enabled: !!username,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Start a new chat session
  const startSessionMutation = useMutation<
    StartSessionResponse,
    Error,
    StartSessionRequest & { onSessionCreated?: (sessionId: string) => void }
  >({
    mutationFn: async (data: StartSessionRequest) => {
      const response = await fetch("/api/chat/start-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: data.username }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start chat session");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      toast.success("New chat session created!");
      if (variables.onSessionCreated && data.chat_session_id) {
        variables.onSessionCreated(data.chat_session_id);
      }
      // Invalidate and refetch sessions
      queryClient.invalidateQueries({ queryKey: ["chat-sessions", username] });
    },
    onError: (error) => {
      console.error("Failed to start chat session:", error);
      toast.error(error.message || "Failed to create new chat session");
    },
  });

  // End a chat session
  const endSessionMutation = useMutation<string, Error, EndSessionRequest>({
    mutationFn: async (data: EndSessionRequest) => {
      // Set the deleting session ID when mutation starts
      setDeletingSessionId(data.chat_session_id);

      const response = await fetch("/api/chat/end-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to end chat session");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      toast.success("Chat session deleted successfully!");
      queryClient.setQueryData(
        ["chat-sessions", username],
        (oldData: ChatSession[] | undefined) => {
          if (!oldData) return [];
          return oldData.filter(
            (session) => session.session_id !== variables.chat_session_id
          );
        }
      );
      // Clear the deleting session ID
      setDeletingSessionId(null);
    },
    onError: (error) => {
      console.error("Failed to end chat session:", error);
      toast.error(error.message || "Failed to delete chat session");
      // Clear the deleting session ID on error
      setDeletingSessionId(null);
    },
  });

  return {
    chatSessions: chatSessions || [],
    isLoadingSessions,
    sessionsError,
    refetchSessions,
    startSession: startSessionMutation.mutate,
    endSession: endSessionMutation.mutate,
    isStartingSession: startSessionMutation.isPending,
    isEndingSession: endSessionMutation.isPending,
    // Function to check if a specific session is being deleted
    isEndingSpecificSession: (sessionId: string) =>
      deletingSessionId === sessionId,
    deletingSessionId,
  };
}

// Hook for managing chat history
export function useChatHistory(sessionId?: string) {
  return useQuery({
    queryKey: ["chat-history", sessionId],
    queryFn: async (): Promise<ChatHistoryMessage[]> => {
      if (!sessionId) {
        throw new Error("Session ID is required");
      }

      const response = await fetch(`/api/chat/history/${sessionId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch chat history");
      }

      return response.json();
    },
    enabled: !!sessionId,
    staleTime: 10 * 1000, // 10 seconds
  });
}
