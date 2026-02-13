'use client';

import { useState, useEffect } from 'react';
import { type DocumentData, onSnapshot, type Query, type CollectionReference } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';
import { useMemoDeep } from '@/hooks/useMemoDeep'; // Import a deep memoization hook

interface UseCollectionOptions<T> {
  initialData?: T[];
}

// Helper to get path from query
function getPathFromQuery(q: Query | CollectionReference): string {
    if ('path' in q) {
        return (q as CollectionReference).path;
    }
    // For Query objects, we can reconstruct the path from the internal _query property
    if ((q as any)._query) {
        return (q as any)._query.path.segments.join('/');
    }
    return 'unknown';
}

export const useCollection = <T extends DocumentData>(query: Query | CollectionReference | null, options?: UseCollectionOptions<T>) => {
  const [data, setData] = useState<T[] | null>(options?.initialData || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Memoize the query object deeply to prevent unnecessary re-renders and effect re-runs.
  const memoizedQuery = useMemoDeep(() => query, [query]);

  useEffect(() => {
    // A null query means we shouldn't fetch anything. This is a common pattern for dependent queries.
    if (!memoizedQuery) {
      setData([]); // Set to empty array to indicate "no data" rather than "loading"
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);

    const unsubscribe = onSnapshot(memoizedQuery, (snapshot) => {
      const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
      setData(documents);
      setIsLoading(false);
      setError(null);
    }, (serverError) => {
      const permissionError = new FirestorePermissionError({
          path: getPathFromQuery(memoizedQuery),
          operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
      setError(permissionError);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [memoizedQuery]); // Depend on the deeply memoized query

  return { data, isLoading, error };
};
