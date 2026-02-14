
'use server';
/**
 * @fileOverview Genkit flows for managing highlights using Firebase Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb, getStorage } from '@/lib/firebase/server';
import { HighlightSchema, type Highlight } from './highlights.types';
import { v4 as uuidv4 } from 'uuid';
import { googleAI } from '@genkit-ai/google-genai';
import { getRbacContext, hasModuleAccess } from '@/lib/rbac';

async function getCurrentContext() {
    return await getRbacContext();
}

// Flow to get all highlights with RBAC
export const getAllHighlights = ai.defineFlow(
  {
    name: 'getAllHighlights',
    inputSchema: z.string().optional().nullable(), // clubId
    outputSchema: z.array(HighlightSchema),
  },
  async (requestedClubId) => {
    const context = await getCurrentContext();
    
    // RBAC: Check if user has access to Highlights module
    if (!hasModuleAccess(context.role, 'Highlights')) {
      console.warn(`[getAllHighlights] User ${context.email} with role ${context.role} denied access to Highlights module`);
      throw new Error("Zugriff verweigert: Sie haben keine Berechtigung, Highlights anzuzeigen.");
    }

    const db = await getDb();
    if (!db) {
      console.error("[getAllHighlights] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    try {
        let query: FirebaseFirestore.Query = db.collection("highlights");
        
        // RBAC: Filter by clubId for non-super-admins
        if (context.role !== 'Super-Admin') {
            if (!context.clubId) {
                return [];
            }
            query = query.where('clubId', '==', context.clubId);
        } else if (requestedClubId) {
            query = query.where('clubId', '==', requestedClubId);
        }
        
        const snapshot = await query.orderBy('submittedAt', 'desc').get();
        if (snapshot.empty) return [];
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Highlight[];
    } catch (error: any) {
        if (error.code === 5) {
            console.error("[getAllHighlights] Firestore collection 'highlights' not found.");
            return []; // Return empty array if collection doesn't exist
        }
        console.error("[getAllHighlights] Error fetching highlights:", error);
        throw error;
    }
  }
);

// Flow to add a new highlight
export const addHighlight = ai.defineFlow(
  {
    name: 'addHighlight',
    inputSchema: HighlightSchema.omit({ id: true, videoUrl: true }),
    outputSchema: HighlightSchema.optional(),
  },
  async (highlightData) => {
    const db = await getDb();
    const storage = await getStorage();
    if (!db || !storage) {
      console.error("[addHighlight] Firestore or Storage is not initialized.");
      throw new Error("Database service is not available.");
    }
    try {
        let processedVideoUrl = highlightData.videoDataUri; // Fallback

        if (highlightData.videoDataUri && highlightData.videoDataUri.startsWith('data:')) {
            
            // AI-based video processing step
            const { media } = await ai.generate({
                model: googleAI.model('gemini-2.5-flash-image-preview'),
                prompt: [
                    { media: { url: highlightData.videoDataUri } },
                    { text: 'Optimise this video for web playback, maintaining good quality but reducing file size. Do not change the content.' },
                ],
                config: {
                    responseModalities: ['VIDEO'],
                },
            });

            const processedVideoDataUri = media?.url;
            
            if (!processedVideoDataUri) {
                throw new Error("Video processing failed to return media.");
            }

            // Upload the processed video to Firebase Storage
            const bucket = storage.bucket();
            const mimeType = processedVideoDataUri.match(/data:(.*);base64,/)?.[1] || 'video/mp4';
            const fileExtension = mimeType.split('/')[1] || 'mp4';
            const base64Data = processedVideoDataUri.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            
            const fileName = `highlights/${uuidv4()}.${fileExtension}`;
            const file = bucket.file(fileName);

            await file.save(buffer, {
                metadata: { contentType: mimeType },
            });
            
            // Get public URL for the processed video
            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: '03-09-2491' 
            });
            processedVideoUrl = url;
        }

        const finalHighlightData = {
          ...highlightData,
          videoUrl: processedVideoUrl,
        };
        // We don't want to save the large data URI in Firestore
        delete (finalHighlightData as any).videoDataUri;


        const docRef = await db.collection("highlights").add(finalHighlightData);
        return { id: docRef.id, ...finalHighlightData };

    } catch(error: any) {
        if (error.code === 5) {
            console.error("[addHighlight] Firestore collection 'highlights' not found.");
            throw new Error("The 'highlights' collection does not exist.");
        }
        console.error("Error in addHighlight flow:", error);
        throw error;
    }
  }
);

// Flow to update a highlight
export const updateHighlight = ai.defineFlow(
  {
    name: 'updateHighlight',
    inputSchema: HighlightSchema,
    outputSchema: z.void(),
  },
  async (highlight) => {
    const db = await getDb();
    if (!db) {
      console.error("[updateHighlight] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    const { id, ...highlightData } = highlight;
    if (!id) throw new Error("Highlight ID is required for updating.");
    const highlightDoc = db.collection("highlights").doc(id);
    await highlightDoc.update(highlightData);
  }
);

// Flow to delete a highlight
export const deleteHighlight = ai.defineFlow(
  {
    name: 'deleteHighlight',
    inputSchema: z.string(), // ID
    outputSchema: z.void(),
  },
  async (highlightId) => {
    const db = await getDb();
    if (!db) {
      console.error("[deleteHighlight] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    if (!highlightId) throw new Error("Highlight ID is required for deletion.");
    await db.collection("highlights").doc(highlightId).delete();
  }
);
