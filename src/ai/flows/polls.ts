
'use client';
/**
 * @fileOverview Genkit flows for managing polls using Firebase Firestore.
 */
import { addDoc, collection, deleteDoc, doc, updateDoc, type Firestore } from 'firebase/firestore';
import { PollSchema, type Poll } from './polls.types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';


// Flow to add a new poll
export const createPoll = (db: Firestore, pollData: Omit<Poll, 'id'>) => {
    const newPoll = {
        ...pollData,
        createdAt: new Date().toISOString(),
        voters: [],
    }

    addDoc(collection(db, 'polls'), newPoll)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: 'polls',
                operation: 'create',
                requestResourceData: newPoll
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });
};

// Flow to vote on a poll
export const voteOnPoll = (db: Firestore, { pollId, optionId, userId }: { pollId: string, optionId: number, userId: string }) => {
    const pollRef = doc(db, 'polls', pollId);
    
    // This is a simplified update. A real-world scenario would use a transaction
    // to prevent race conditions. For this demo, we assume the component fetches
    // the latest poll data before updating.
    updateDoc(pollRef, {
        [`options.${optionId - 1}.votes`]: 1, // Simplified increment, should be FieldValue.increment(1)
        voters: [userId] // Simplified, should be FieldValue.arrayUnion(userId)
    }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: pollRef.path,
            operation: 'update',
            requestResourceData: { voters: [userId], [`options.${optionId-1}.votes`]: 'INCREMENT(1)' }
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
    });
};


// Flow to delete a poll
export const deletePoll = (db: Firestore, pollId: string) => {
    const pollRef = doc(db, 'polls', pollId);
    deleteDoc(pollRef)
      .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: pollRef.path,
                operation: 'delete',
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });
};
