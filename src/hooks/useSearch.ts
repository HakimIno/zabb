import { useQuery, useQueryClient } from '@tanstack/react-query';
import { searchService, SearchRequest, LocationResult } from '@/src/services/search/searchService';

// Query keys for better cache management
export const searchQueryKeys = {
  all: ['search'] as const,
  places: () => [...searchQueryKeys.all, 'places'] as const,
  place: (params: SearchRequest) => [...searchQueryKeys.places(), params] as const,
};

/**
 * Hook for searching places using TanStack Query
 */
export function useSearchPlaces(
  request: SearchRequest | null,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
    retry?: boolean | number;
  }
) {
  return useQuery({
    queryKey: request ? searchQueryKeys.place(request) : [],
    queryFn: () => request ? searchService.searchPlacesWithFallback(request) : Promise.resolve([]),
    enabled: !!request?.query && (options?.enabled !== false),
    staleTime: options?.staleTime ?? 1000 * 60 * 2, // 2 minutes for search results
    gcTime: options?.cacheTime ?? 1000 * 60 * 5, // 5 minutes cache
    retry: options?.retry ?? 1,
    refetchOnWindowFocus: false, // Don't refetch search results when window regains focus
  });
}

/**
 * Hook for prefetching search results
 */
export function usePrefetchSearch() {
  const queryClient = useQueryClient();

  const prefetchSearch = async (request: SearchRequest) => {
    await queryClient.prefetchQuery({
      queryKey: searchQueryKeys.place(request),
      queryFn: () => searchService.searchPlacesWithFallback(request),
      staleTime: 1000 * 60 * 2,
    });
  };

  return { prefetchSearch };
}

/**
 * Hook for invalidating search cache
 */
export function useSearchCache() {
  const queryClient = useQueryClient();

  const invalidateSearchCache = () => {
    queryClient.invalidateQueries({ queryKey: searchQueryKeys.all });
  };

  const clearSearchCache = () => {
    queryClient.removeQueries({ queryKey: searchQueryKeys.all });
  };

  const setSearchData = (request: SearchRequest, data: LocationResult[]) => {
    queryClient.setQueryData(searchQueryKeys.place(request), data);
  };

  return {
    invalidateSearchCache,
    clearSearchCache,
    setSearchData,
  };
}
