"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Types for chat roster management
export interface SelectArtistsRequest {
  chat_session_id: string;
  artist_names: string[];
}

export interface DeselectArtistRequest {
  chat_session_id: string;
  artist_name: string;
}

// Hook for managing chat session rosters
export function useChatRoster(sessionId?: string) {
  const queryClient = useQueryClient();

  // Fetch selected artists for a chat session
  const {
    data: selectedArtists,
    isLoading: isLoadingSelected,
    error: selectedError,
    refetch: refetchSelected,
  } = useQuery({
    queryKey: ['selected-artists', sessionId],
    queryFn: async (): Promise<string[]> => {
      if (!sessionId) {
        throw new Error("Session ID is required");
      }

      const response = await fetch(`/api/artists/selected/${sessionId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch selected artists");
      }

      return response.json();
    },
    enabled: !!sessionId,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Select artists for chat session
  const selectArtistsMutation = useMutation<any, Error, SelectArtistsRequest>({
    mutationFn: async (data: SelectArtistsRequest) => {
      const response = await fetch("/api/artists/select", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to select artists");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      toast.success(`Successfully added ${variables.artist_names.length} artist(s) to chat!`);
      // Invalidate and refetch selected artists
      queryClient.invalidateQueries({ queryKey: ['selected-artists', variables.chat_session_id] });
    },
    onError: (error) => {
      console.error("Failed to select artists:", error);
      toast.error(error.message || "Failed to add artists to chat");
    },
  });

  // Deselect artist from chat session
  const deselectArtistMutation = useMutation<any, Error, DeselectArtistRequest>({
    mutationFn: async (data: DeselectArtistRequest) => {
      const response = await fetch("/api/artists/deselect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to deselect artist");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      toast.success(`Successfully removed ${variables.artist_name} from chat!`);
      
      // Update the selected artists cache by removing the artist
      queryClient.setQueryData(['selected-artists', variables.chat_session_id], (oldData: string[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(artist => artist !== variables.artist_name);
      });
    },
    onError: (error) => {
      console.error("Failed to deselect artist:", error);
      toast.error(error.message || "Failed to remove artist from chat");
    },
  });

  return {
    selectedArtists: selectedArtists || [],
    isLoadingSelected,
    selectedError,
    refetchSelected,
    selectArtists: selectArtistsMutation.mutate,
    deselectArtist: deselectArtistMutation.mutate,
    isSelectingArtists: selectArtistsMutation.isPending,
    isDeselectingArtist: deselectArtistMutation.isPending,
  };
}
