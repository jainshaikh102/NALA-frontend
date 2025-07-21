import {
  useMutation,
  useQuery,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import {
  apiClient,
  ApiResponse,
  handleApiError,
  ApiError,
} from "@/lib/api-config";
import { AxiosRequestConfig } from "axios";

// Generic GET hook
export function useGet<TData = any>(
  endpoint: string,
  options?: Omit<
    UseQueryOptions<ApiResponse<TData>, ApiError>,
    "queryKey" | "queryFn"
  > & {
    config?: AxiosRequestConfig;
  }
) {
  const { config, ...queryOptions } = options || {};

  return useQuery<ApiResponse<TData>, ApiError>({
    queryKey: [endpoint, config],
    queryFn: async () => {
      try {
        const response = await apiClient.get(endpoint, config);
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    ...queryOptions,
  });
}

// Generic POST hook
export function usePost<TData = any, TVariables = any>(
  endpoint: string,
  options?: UseMutationOptions<{ data: TData }, ApiError, TVariables> & {
    config?: AxiosRequestConfig;
  }
) {
  const { config, ...mutationOptions } = options || {};

  return useMutation<{ data: TData }, ApiError, TVariables>({
    mutationFn: async (data: TVariables) => {
      try {
        const response = await apiClient.post(endpoint, data, config);
        return { data: response.data };
      } catch (error) {
        throw handleApiError(error);
      }
    },
    ...mutationOptions,
  });
}

// Generic PUT hook
export function usePut<TData = any, TVariables = any>(
  endpoint: string,
  options?: UseMutationOptions<ApiResponse<TData>, ApiError, TVariables> & {
    config?: AxiosRequestConfig;
  }
) {
  const { config, ...mutationOptions } = options || {};

  return useMutation<ApiResponse<TData>, ApiError, TVariables>({
    mutationFn: async (data: TVariables) => {
      try {
        const response = await apiClient.put(endpoint, data, config);
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    ...mutationOptions,
  });
}

// Generic PATCH hook
export function usePatch<TData = any, TVariables = any>(
  endpoint: string,
  options?: UseMutationOptions<ApiResponse<TData>, ApiError, TVariables> & {
    config?: AxiosRequestConfig;
  }
) {
  const { config, ...mutationOptions } = options || {};

  return useMutation<ApiResponse<TData>, ApiError, TVariables>({
    mutationFn: async (data: TVariables) => {
      try {
        const response = await apiClient.patch(endpoint, data, config);
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    ...mutationOptions,
  });
}

// Generic DELETE hook
export function useDelete<TData = any, TVariables = any>(
  endpoint: string,
  options?: UseMutationOptions<ApiResponse<TData>, ApiError, TVariables> & {
    config?: AxiosRequestConfig;
  }
) {
  const { config, ...mutationOptions } = options || {};

  return useMutation<ApiResponse<TData>, ApiError, TVariables>({
    mutationFn: async (data?: TVariables) => {
      try {
        const response = await apiClient.delete(endpoint, { ...config, data });
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    ...mutationOptions,
  });
}
