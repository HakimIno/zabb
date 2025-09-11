import { useState, useEffect, useCallback } from 'react';
import { storageService } from '@/src/services/storage/storageService';

export const useStorage = <T>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  // Load value from storage on mount
  useEffect(() => {
    loadValue();
  }, [key]);

  const loadValue = async () => {
    try {
      const storedValue = await storageService.getItem<T>(key);
      if (storedValue !== null) {
        setValue(storedValue);
      }
    } catch (error) {
      console.error(`Error loading ${key} from storage:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateValue = useCallback(async (newValue: T) => {
    try {
      await storageService.setItem(key, newValue);
      setValue(newValue);
    } catch (error) {
      console.error(`Error saving ${key} to storage:`, error);
      throw error;
    }
  }, [key]);

  const removeValue = useCallback(async () => {
    try {
      await storageService.removeItem(key);
      setValue(defaultValue);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
      throw error;
    }
  }, [key, defaultValue]);

  return {
    value,
    setValue: updateValue,
    removeValue,
    isLoading,
    refresh: loadValue,
  };
};

// Specific hooks for common storage items
export const useTheme = () => {
  return useStorage<'light' | 'dark'>('theme', 'light');
};

export const useLanguage = () => {
  return useStorage<string>('language', 'th');
};

export const useOnboardingCompleted = () => {
  return useStorage<boolean>('onboarding_completed', false);
};
