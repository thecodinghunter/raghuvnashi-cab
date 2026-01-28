'use client';

import { useEffect, useState } from 'react';
import { DocumentReference, onSnapshot } from 'firebase/firestore';

interface UseDocResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to listen to a Firestore document in real-time.
 * @template T The type of document data
 * @param docRef The document reference to listen to
 * @returns An object containing the document data, loading state, and error
 */
export function useDoc<T = any>(
  docRef: DocumentReference<any> | null
): UseDocResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docRef) {
      setLoading(false);
      setData(null);
      return;
    }

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      docRef as DocumentReference<any>,
      (snapshot) => {
        if (snapshot.exists()) {
          setData(snapshot.data() as T);
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error listening to document:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docRef]);

  return { data, loading, error };
}
