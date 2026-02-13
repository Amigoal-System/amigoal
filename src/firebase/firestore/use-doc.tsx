'use client';

import { useState, useEffect } from 'react';
import { type DocumentData, onSnapshot, type DocumentReference } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';
import { useMemoDeep } from '@/hooks/useMemoDeep';

interface UseDocOptions<T> {
  initialData?: T;
}

export const useDoc = <T extends DocumentData>(ref: DocumentReference<T> | null, options?: UseDocOptions<T>) => {
  const [data, setData] = useState<T | null>(options?.initialData || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const memoizedRef = useMemoDeep(() => ref, [ref]);

  useEffect(() => {
    if (!memoizedRef) {
      setData(null);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);

    const unsubscribe = onSnapshot(memoizedRef, (doc) => {
      if (doc.exists()) {
        setData({ id: doc.id, ...doc.data() } as T);
      } else {
        setData(null);
      }
      setIsLoading(false);
    }, (serverError) => {
      const permissionError = new FirestorePermissionError({
          path: memoizedRef.path,
          operation: 'get',
      });
      errorEmitter.emit('permission-error', permissionError);
      setError(permissionError);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [memoizedRef]);

  return { data, isLoading, error };
};
