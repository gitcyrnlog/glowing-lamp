import { useState, useEffect } from 'react';

interface UseFirestoreOptions<T> {
  fallbackData?: T;
  cacheTime?: number; // time in milliseconds to cache the data
  dependencies?: any[]; // dependencies for the useEffect
}

/**
 * A custom hook for Firestore operations with built-in loading, error states and caching
 * @param fetchFn A function that fetches data from Firestore
 * @param options Options for the hook
 * @returns An object with data, loading, error, and refetch function
 */
export function useFirestore<T>(
  fetchFn: () => Promise<T>,
  options: UseFirestoreOptions<T> = {}
) {
  const { 
    fallbackData,
    cacheTime = 5 * 60 * 1000, // 5 minutes by default
    dependencies = []
  } = options;
  
  const [data, setData] = useState<T | undefined>(fallbackData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetched, setLastFetched] = useState<number>(0);
  
  const fetchData = async (force = false) => {
    const now = Date.now();
    
    // If we have data and it's not expired, don't fetch again
    if (!force && data && lastFetched > 0 && now - lastFetched < cacheTime) {
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await fetchFn();
      setData(result);
      setLastFetched(now);
      setError(null);
    } catch (err) {
      console.error('Error in useFirestore hook:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };
  
  // Force refetch data
  const refetch = () => fetchData(true);
  
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies]);
  
  return { data, loading, error, refetch };
}

export default useFirestore;
