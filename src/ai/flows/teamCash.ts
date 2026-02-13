
'use server';
/**
 * @fileOverview A flow for managing the team cash box using Firebase Firestore.
 *
 * - getTeamCashData - Fetches the current state of a team's cash box.
 * - addTransaction - Adds a new transaction to team's cash box.
 * - settleDebt - Settles a member's debt.
 * - updateKeeper - Updates the keeper of the cash box.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { TeamCashDataSchema, TeamIdSchema, TransactionSchema, MemberDebtSchema, KeeperSchema } from './teamCash.types';
import type { TeamCashData, TeamId, Transaction, MemberDebt, Keeper } from './teamCash.types';
import { firestore } from 'firebase-admin';
import { getRbacContext, hasModuleAccess } from '@/lib/rbac';

async function getCurrentContext() {
    return await getRbacContext();
}


async function getTeamDocRef(teamId: string) {
    const db = await getDb();
    if (!db) throw new Error("Database not initialized.");
    return db.collection("team-cash").doc(teamId);
}

export const getTeamCashData = ai.defineFlow(
    {
        name: 'getTeamCashData',
        inputSchema: TeamIdSchema,
        outputSchema: TeamCashDataSchema,
    },
    async (requestedTeamId) => {
        const context = await getCurrentContext();
        
        // RBAC: Check if user has access to Team Cash module
        if (!hasModuleAccess(context.role, 'Team Cash')) {
          console.warn(`[getTeamCashData] User ${context.email} with role ${context.role} denied access to Team Cash module`);
          throw new Error("Zugriff verweigert: Sie haben keine Berechtigung, die Mannschaftskasse anzuzeigen.");
        }

        if (!requestedTeamId) {
            throw new Error("Team ID is required.");
        }
        const db = await getDb();
        if (!db) {
            console.error(`[getTeamCashData] Firestore not initialized.`);
            throw new Error("Database service is not available.");
        }
        const teamDocRef = db.collection("team-cash").doc(requestedTeamId);
        
        try {
            const docSnap = await teamDocRef.get();

            if (docSnap.exists()) {
                return docSnap.data() as TeamCashData;
            } else {
                console.warn(`[getTeamCashData] No cash data found for team '${teamId}'. Returning empty state.`);
                return { balance: 0, transactions: [], members: [], keeper: null };
            }
        } catch (error: any) {
            if (error.code === 5) {
                console.error(`[getTeamCashData] Firestore collection 'team-cash' not found.`);
                 throw new Error("The 'team-cash' collection does not exist in Firestore.");
            }
            console.error(`[getTeamCashData] Error fetching data for team '${teamId}':`, error);
            throw error;
        }
    }
);

export const addTransaction = ai.defineFlow(
    {
        name: 'addTransaction',
        inputSchema: z.object({ teamId: TeamIdSchema, transaction: TransactionSchema }),
        outputSchema: TeamCashDataSchema.optional(),
    },
    async ({ teamId, transaction }) => {
        const db = await getDb();
        if (!db) {
          console.error("[addTransaction] Firestore not initialized.");
          throw new Error("Database service is not available.");
        }
        try {
            const teamDocRef = db.collection("team-cash").doc(teamId);
            const teamData = await getTeamCashData(teamId);

            const updatedBalance = teamData.balance + transaction.amount;
            
            const updates: any = {
                balance: updatedBalance,
                transactions: firestore.FieldValue.arrayUnion(transaction)
            };

            // If it's a fine, update the member's balance
            if (transaction.type === 'Busse' && transaction.memberId) {
                const memberIndex = teamData.members.findIndex(m => m.id === transaction.memberId);
                if (memberIndex > -1) {
                    const updatedMembers = [...teamData.members];
                    updatedMembers[memberIndex] = {
                        ...updatedMembers[memberIndex],
                        balance: updatedMembers[memberIndex].balance + transaction.amount, // amount is negative for fines
                    };
                    updates.members = updatedMembers;
                }
            }

            await teamDocRef.update(updates);

            // Refetch data to return the latest state
            return await getTeamCashData(teamId);
        } catch (error: any) {
            if (error.code === 5) {
                console.error("[addTransaction] Firestore collection 'team-cash' not found.");
                throw new Error("The 'team-cash' collection does not exist.");
            }
            throw error;
        }
    }
);

export const settleDebt = ai.defineFlow(
    {
        name: 'settleDebt',
        inputSchema: z.object({ teamId: TeamIdSchema, memberDebt: MemberDebtSchema }),
        outputSchema: TeamCashDataSchema.optional(),
    },
    async ({ teamId, memberDebt }) => {
        const db = await getDb();
        if (!db) {
          console.error("[settleDebt] Firestore not initialized.");
          throw new Error("Database service is not available.");
        }

        try {
            const teamDocRef = db.collection("team-cash").doc(teamId);
            const teamData = await getTeamCashData(teamId);
            const memberIndex = teamData.members.findIndex(m => m.id === memberDebt.memberId);

            if (memberIndex === -1 || teamData.members[memberIndex].balance >= 0) {
                throw new Error("Member not found or no debt to settle.");
            }
            
            const paymentAmount = Math.abs(teamData.members[memberIndex].balance);
            const memberName = teamData.members[memberIndex].name;

            const newTransaction: Transaction = {
                id: Date.now(),
                type: 'Einzahlung',
                description: `Begleichung Schulden ${memberName}`,
                amount: paymentAmount,
                date: new Date().toISOString().split('T')[0],
                memberId: memberDebt.memberId,
            };

            const updatedMembers = [...teamData.members];
            updatedMembers[memberIndex] = { ...updatedMembers[memberIndex], balance: 0 };
            
            const updatedBalance = teamData.balance + paymentAmount;
            
            await teamDocRef.update({
                balance: updatedBalance,
                members: updatedMembers,
                transactions: firestore.FieldValue.arrayUnion(newTransaction)
            });
            
            // Refetch data to return the latest state
            return await getTeamCashData(teamId);

        } catch (error: any) {
            if (error.code === 5) {
                 console.error("[settleDebt] Firestore collection 'team-cash' not found.");
                 throw new Error("The 'team-cash' collection does not exist.");
            }
            throw error;
        }
    }
);

export const updateKeeper = ai.defineFlow(
  {
    name: 'updateKeeper',
    inputSchema: z.object({ teamId: TeamIdSchema, keeper: KeeperSchema }),
    outputSchema: z.void(),
  },
  async ({ teamId, keeper }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
    const teamDocRef = await getTeamDocRef(teamId);
    await teamDocRef.update({ keeper });
  }
);
