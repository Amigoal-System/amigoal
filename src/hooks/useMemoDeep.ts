'use client';

import { useRef } from 'react';

// Basic deep comparison function
const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    if (a.constructor !== b.constructor) return false;

    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!deepEqual(a[i], b[i])) return false;
      }
      return true;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!keysB.includes(key) || !deepEqual(a[key], b[key])) return false;
    }

    return true;
  }

  return a === b;
};


export const useMemoDeep = <T>(factory: () => T, deps: React.DependencyList): T => {
    const previousDeps = useRef<React.DependencyList | null>(null);
    const memoizedValue = useRef<T | null>(null);

    if (!previousDeps.current || !deepEqual(previousDeps.current, deps)) {
        previousDeps.current = deps;
        memoizedValue.current = factory();
    }

    return memoizedValue.current as T;
};
