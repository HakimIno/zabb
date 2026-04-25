import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchPlaces } from '@/features/ride/hooks/useSearch';
import type { LocationResult, SearchRequest } from '@/features/ride/services/searchService';

type FieldType = 'pickup' | 'destination';

interface SearchFieldState {
  text: string;
}

interface UseLocationSearchProps {
  currentLocation?: [number, number];
}

export const useLocationSearch = ({ currentLocation }: UseLocationSearchProps) => {
  const [focusedField, setFocusedField] = useState<FieldType | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceTimeoutRef = useRef<number | null>(null);

  // Simplified state management for both fields
  const [searchFields, setSearchFields] = useState<Record<FieldType, SearchFieldState>>({
    pickup: { text: '' },
    destination: { text: '' },
  });

  // Helper functions
  const updateFieldText = useCallback((fieldType: FieldType, text: string) => {
    setSearchFields((prev) => ({
      ...prev,
      [fieldType]: { ...prev[fieldType], text },
    }));
  }, []);

  const getFieldState = useCallback(
    (fieldType: FieldType) => searchFields[fieldType],
    [searchFields]
  );

  // Single debounce effect for the focused field
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const currentText = focusedField ? getFieldState(focusedField).text : '';

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedQuery(currentText);
    }, 300);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [focusedField, getFieldState]);

  // Single search request creator
  const searchRequest = useMemo((): SearchRequest | null => {
    const query = debouncedQuery.trim();

    if (!query || query.length < 2 || !focusedField) {
      return null;
    }

    return {
      language: 'th',
      limit: 8,
      query,
      ...(currentLocation && {
        proximity: {
          lat: currentLocation[1],
          lng: currentLocation[0],
        },
      }),
    };
  }, [debouncedQuery, currentLocation, focusedField]);

  // Single search hook - only search when a field is focused
  const { data: searchResults = [], isLoading: isSearching } = useSearchPlaces(searchRequest, {
    enabled: !!searchRequest,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  // Generic submit handler
  const createManualLocation = (fieldType: FieldType): LocationResult => {
    const fieldState = getFieldState(fieldType);
    const text = fieldState.text.trim();

    return {
      id: `manual-${fieldType}`,
      name: text,
      address: text,
      coordinates: currentLocation || [100.5018, 13.7563],
      placeType: 'manual',
    };
  };

  return {
    // State
    focusedField,
    searchFields,

    // Actions
    setFocusedField,
    updateFieldText,
    getFieldState,
    createManualLocation,

    // Search results - unified
    searchResults,
    isSearching,
  };
};
