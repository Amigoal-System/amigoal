
'use server';
/**
 * @fileOverview A flow for handling user login and resolving email addresses based on the login identifier and context (subdomain).
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import type { Club } from './clubs.types';
import type { Member } from './members.types';

const LoginIdentifierSchema = z.object({
    identifier: z.string().optional().nullable(),
});

const LoginOutputSchema = z.object({
    email: z.string().email().optional().nullable(),
    error: z.string().optional().nullable(),
    isSuperAdmin: z.boolean().optional(),
});

export const getEmailForLogin = ai.defineFlow(
    {
        name: 'getEmailForLogin',
        inputSchema: LoginIdentifierSchema,
        outputSchema: LoginOutputSchema,
    },
    async ({ identifier }) => {
        if (!identifier) {
            return { email: null, error: "Identifier is missing." };
        }

        const lowerIdentifier = identifier.toLowerCase();

        // Case 0: Super Admin login
        if (lowerIdentifier === 'super.admin@amigoal.ch') {
            return { email: 'super.admin@amigoal.ch', isSuperAdmin: true };
        }


        const db = await getDb();
        if (!db) {
            console.error("[getEmailForLogin] Database service is not available.");
            return { email: null, error: "Database service not available." };
        }

        try {
            // Case 1: The identifier is a direct email address (for external roles)
            if (lowerIdentifier.includes('@') && lowerIdentifier.includes('.')) {
                 // Check if it's a member trying to log in with their email directly
                 const memberByEmailSnapshot = await db.collection('members').where('email', '==', lowerIdentifier).limit(1).get();
                 if (!memberByEmailSnapshot.empty) {
                     const memberData = memberByEmailSnapshot.docs[0].data() as Member;
                     return { email: memberData.email };
                 }

                 // Check if it's a Club-Admin's contact email
                 const clubByEmailSnapshot = await db.collection('clubs').where('contactEmail', '==', lowerIdentifier).limit(1).get();
                 if (!clubByEmailSnapshot.empty) {
                     const clubData = clubByEmailSnapshot.docs[0].data() as Club;
                     // Important: check if the identifier ALSO matches the clubLoginUser.
                     // This prevents an external user from logging into a club account just by knowing the contact email.
                     if(clubData.clubLoginUser?.toLowerCase() === lowerIdentifier) {
                        return { email: clubData.contactEmail };
                     }
                 }

                 // If it's none of the above, it's an external role (Parent, Sponsor, etc.)
                 return { email: lowerIdentifier };
            }
            
            // Case 2: The identifier is an internal club login (e.g., admin@fc-awesome or pep.guardiola@mancity)
            const memberSnapshot = await db.collection('members').where('clubLoginUser', '==', lowerIdentifier).limit(1).get();
            if (!memberSnapshot.empty) {
                const memberData = memberSnapshot.docs[0].data() as Member;
                if (memberData.email) {
                    return { email: memberData.email };
                } else {
                     return { email: null, error: "Club member found, but no email is associated with the account." };
                }
            }

            // Fallback check for club admins who might have a username without a '.' TLD-like suffix
            const clubSnapshot = await db.collection('clubs').where('clubLoginUser', '==', lowerIdentifier).limit(1).get();
            if (!clubSnapshot.empty) {
                const clubData = clubSnapshot.docs[0].data() as Club;
                if (clubData.contactEmail) {
                    return { email: clubData.contactEmail };
                } else {
                     return { email: null, error: "Club admin found, but no contact email is associated with the club account." };
                }
            }
            
            // If we've reached here, the identifier is not a known user.
            return { email: null, error: "User not found or invalid identifier format." };

        } catch (error) {
            console.error("[getEmailForLogin] Error looking up email for login identifier:", error);
            return { email: null, error: "An error occurred during lookup." };
        }
    }
);
