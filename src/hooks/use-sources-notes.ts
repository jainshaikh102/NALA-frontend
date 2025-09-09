"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Types for sources and notes management
export interface RAGUploadRequest {
  gcs_url: string;
  file_name: string;
  username: string;
  chat_session_id: string;
}

export interface RAGDeleteRequest {
  document_id: string;
}

export interface NotesAddRequest {
  chat_session_id: string;
  note_item: string;
}

export interface NotesRemoveRequest {
  chat_session_id: string;
  note_item: string;
}

// Hook for managing RAG sources
export function useRAGSources(sessionId?: string) {
  const queryClient = useQueryClient();

  // Fetch sources for a chat session
  const {
    data: sources,
    isLoading: isLoadingSources,
    error: sourcesError,
    refetch: refetchSources,
  } = useQuery({
    queryKey: ['rag-sources', sessionId],
    queryFn: async (): Promise<string[]> => {
      if (!sessionId) {
        throw new Error("Session ID is required");
      }

      const response = await fetch(`/api/rag/list/${sessionId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch sources");
      }

      return response.json();
    },
    enabled: !!sessionId,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Upload source to RAG
  const uploadSourceMutation = useMutation<string[], Error, RAGUploadRequest>({
    mutationFn: async (data: RAGUploadRequest) => {
      const response = await fetch("/api/rag/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload source");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      console.log("Source uploaded successfully:", data);
      toast.success(`Successfully uploaded ${variables.file_name}!`);
      
      // Invalidate and refetch sources
      queryClient.invalidateQueries({ queryKey: ['rag-sources', variables.chat_session_id] });
    },
    onError: (error) => {
      console.error("Failed to upload source:", error);
      toast.error(error.message || "Failed to upload source");
    },
  });

  // Delete source from RAG
  const deleteSourceMutation = useMutation<string, Error, RAGDeleteRequest>({
    mutationFn: async (data: RAGDeleteRequest) => {
      const response = await fetch("/api/rag/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete source");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      console.log("Source deleted successfully:", data);
      toast.success("Source removed successfully!");
      
      // Update the sources cache by removing the deleted source
      queryClient.setQueryData(['rag-sources', sessionId], (oldData: string[] | undefined) => {
        if (!oldData) return [];
        return oldData?.documents.filter(source => source !== variables.document_id);
      });
    },
    onError: (error) => {
      console.error("Failed to delete source:", error);
      toast.error(error.message || "Failed to remove source");
    },
  });

  return {
    sources: sources || [],
    isLoadingSources,
    sourcesError,
    refetchSources,
    uploadSource: uploadSourceMutation.mutate,
    deleteSource: deleteSourceMutation.mutate,
    isUploadingSource: uploadSourceMutation.isPending,
    isDeletingSource: deleteSourceMutation.isPending,
  };
}

// Hook for managing notes
export function useNotes(sessionId?: string) {
  const queryClient = useQueryClient();

  // Fetch notes for a chat session
  const {
    data: notes,
    isLoading: isLoadingNotes,
    error: notesError,
    refetch: refetchNotes,
  } = useQuery({
    queryKey: ['notes', sessionId],
    queryFn: async (): Promise<string[]> => {
      if (!sessionId) {
        throw new Error("Session ID is required");
      }

      const response = await fetch(`/api/notes/${sessionId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch notes");
      }

      return response.json();
    },
    enabled: !!sessionId,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Add note
  const addNoteMutation = useMutation<string, Error, NotesAddRequest>({
    mutationFn: async (data: NotesAddRequest) => {
      const response = await fetch("/api/notes/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add note");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      console.log("Note added successfully:", data);
      toast.success("Note added successfully!");
      
      // Update the notes cache by adding the new note
      queryClient.setQueryData(['notes', variables.chat_session_id], (oldData: string[] | undefined) => {
        if (!oldData) return [variables.note_item];
        return [...oldData, variables.note_item];
      });
    },
    onError: (error) => {
      console.error("Failed to add note:", error);
      toast.error(error.message || "Failed to add note");
    },
  });

  // Remove note
  const removeNoteMutation = useMutation<string, Error, NotesRemoveRequest>({
    mutationFn: async (data: NotesRemoveRequest) => {
      const response = await fetch("/api/notes/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove note");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      console.log("Note removed successfully:", data);
      toast.success("Note removed successfully!");
      
      // Update the notes cache by removing the note
      queryClient.setQueryData(['notes', variables.chat_session_id], (oldData: string[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(note => note !== variables.note_item);
      });
    },
    onError: (error) => {
      console.error("Failed to remove note:", error);
      toast.error(error.message || "Failed to remove note");
    },
  });

  return {
    notes: notes || [],
    isLoadingNotes,
    notesError,
    refetchNotes,
    addNote: addNoteMutation.mutate,
    removeNote: removeNoteMutation.mutate,
    isAddingNote: addNoteMutation.isPending,
    isRemovingNote: removeNoteMutation.isPending,
  };
}
