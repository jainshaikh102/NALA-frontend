"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Types for artist management
export interface Artist {
  id: number;
  name: string;
  picture_url: string;
  country: string;
  listenership: number;
}

export interface AddArtistsRequest {
  username: string;
  selected_artists: Artist[];
}

export interface RemoveArtistRequest {
  username: string;
  artist: Artist;
}

export interface SearchArtistsParams {
  name?: string;
  offset?: number;
  limit?: number;
}

// Hook for searching artists
export function useSearchArtists(params: SearchArtistsParams) {
  return useQuery({
    queryKey: ['search-artists', params],
    queryFn: async (): Promise<Artist[]> => {
      const searchParams = new URLSearchParams();
      
      if (params.name) {
        searchParams.append('name', params.name);
      }
      if (params.offset !== undefined) {
        searchParams.append('offset', params.offset.toString());
      }
      if (params.limit !== undefined) {
        searchParams.append('limit', params.limit.toString());
      }

      const response = await fetch(`/api/artists/search?${searchParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to search artists");
      }

      return response.json();
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for managing user's artist roster
export function useUserRoster(username?: string) {
  const queryClient = useQueryClient();

  // Fetch user's current roster
  const {
    data: userRoster,
    isLoading: isLoadingRoster,
    error: rosterError,
    refetch: refetchRoster,
  } = useQuery({
    queryKey: ['user-roster', username],
    queryFn: async (): Promise<Artist[]> => {
      if (!username) {
        throw new Error("Username is required");
      }

      const response = await fetch(`/api/artists/user-roster/${username}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch user roster");
      }

      return response.json();
    },
    enabled: !!username,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Add artists to roster
  const addArtistsMutation = useMutation<any, Error, AddArtistsRequest>({
    mutationFn: async (data: AddArtistsRequest) => {
      const response = await fetch("/api/artists/user-roster", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add artists to roster");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      toast.success(`Successfully added ${variables.selected_artists.length} artist(s) to your roster!`);
      // Invalidate and refetch roster
      queryClient.invalidateQueries({ queryKey: ['user-roster', username] });
    },
    onError: (error) => {
      console.error("Failed to add artists to roster:", error);
      toast.error(error.message || "Failed to add artists to roster");
    },
  });

  // Remove artist from roster
  const removeArtistMutation = useMutation<any, Error, RemoveArtistRequest>({
    mutationFn: async (data: RemoveArtistRequest) => {
      const response = await fetch(`/api/artists/user-roster/remove?username=${data.username}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data.artist),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove artist from roster");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      toast.success(`Successfully removed ${variables.artist.name} from your roster!`);
      
      // Update the roster cache by removing the artist
      queryClient.setQueryData(['user-roster', username], (oldData: Artist[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(artist => artist.id !== variables.artist.id);
      });
    },
    onError: (error) => {
      console.error("Failed to remove artist from roster:", error);
      toast.error(error.message || "Failed to remove artist from roster");
    },
  });

  return {
    userRoster: userRoster || [],
    isLoadingRoster,
    rosterError,
    refetchRoster,
    addArtists: addArtistsMutation.mutate,
    removeArtist: removeArtistMutation.mutate,
    isAddingArtists: addArtistsMutation.isPending,
    isRemovingArtist: removeArtistMutation.isPending,
  };
}
