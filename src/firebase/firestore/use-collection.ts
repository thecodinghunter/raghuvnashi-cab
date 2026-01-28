'use client';

import { useEffect, useState } from 'react';
import { Query, onSnapshot } from 'firebase/firestore';

interface UseCollectionResult<T> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to listen to a Firestore collection query in real-time.
 * @template T The type of documents in the collection
 * @param query The Firestore query to listen to
 * @returns An object containing the collection data, loading state, and error
 */
export function useCollection<T = any>(
  query: Query<any> | null
): UseCollectionResult<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      setData(null);
      return;
    }

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      query as Query<any>,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        } as T));
        setData(docs);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error listening to collection:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
}
