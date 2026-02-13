
'use client';

import React, { useEffect } from 'react';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

export const FirebaseErrorListener = () => {
  useEffect(() => {
    const handleError = (error: Error) => {
      // Check if it's our custom FirestorePermissionError
      if (error instanceof FirestorePermissionError) {
        // Throwing the error here will cause Next.js to display its error overlay in development
        throw error;
      } else {
        // Handle other types of errors if necessary, or just log them
        console.error("An unexpected error was emitted:", error);
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  return null; // This component does not render anything
};
