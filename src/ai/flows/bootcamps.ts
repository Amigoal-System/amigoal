

'use server';
/**
 * @fileOverview Genkit flows for managing bootcamps using Firebase Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb, getStorage } from '@/lib/firebase/server';
import { BootcampSchema, type Bootcamp, RegistrationSchema } from './bootcamps.types';
import { firestore } from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { sendMail } from '@/services/email';

// Dedicated flow just for uploading images.
export const uploadImagesFlow = ai.defineFlow(
  {
    name: 'uploadImagesFlow',
    inputSchema: z.array(z.string().optional()),
    outputSchema: z.array(z.string()),
  },
  async (images) => {
    const storage = await getStorage();
    if (!storage) {
        throw new Error("Storage service is not available.");
    }
    const bucket = storage.bucket();

    const uploadPromises = images.map(async (image) => {
        if (!image || !image.startsWith('data:')) {
            return image; // It's already a URL or empty
        }

        const mimeType = image.match(/data:(.*);base64,/)?.[1] || 'image/jpeg';
        const fileExtension = mimeType.split('/')[1] || 'jpg';
        const base64Data = image.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        
        const fileName = `bootcamp-gallery/${uuidv4()}.${fileExtension}`;
        const file = bucket.file(fileName);

        await file.save(buffer, {
            metadata: { contentType: mimeType },
        });
        
        // Make the file publicly readable and get the URL
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491' 
        });
        return url;
    });

    const settledPromises = await Promise.allSettled(uploadPromises);
    
    return settledPromises
        .map(p => p.status === 'fulfilled' ? p.value : null)
        .filter((url): url is string => url !== null);
  }
);


// --- Bootcamps ---

export const getAllBootcamps = ai.defineFlow(
  {
    name: 'getAllBootcamps',
    inputSchema: z.object({
        source: z.string().optional(), // 'all', a specific provider name, or undefined for club-specific
    }).optional().nullable(),
    outputSchema: z.array(BootcampSchema),
  },
  async (input) => {
    const { getRbacContext, hasModuleAccess } = await import('@/lib/rbac');
    const context = await getRbacContext();
    
    // RBAC: Check if user has access to Bootcamps module
    if (!hasModuleAccess(context.role, 'Bootcamps')) {
      console.warn(`[getAllBootcamps] User ${context.email} with role ${context.role} denied access to Bootcamps module`);
      throw new Error("Zugriff verweigert: Sie haben keine Berechtigung, Bootcamps anzuzeigen.");
    }

    const db = await getDb();
    if (!db) {
      console.error("[getAllBootcamps] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    
    try {
        let query: firestore.Query = db.collection("bootcamps");
        
        if (input?.source && input.source !== 'all') {
             query = query.where('source', '==', input.source);
        }
        
        const snapshot = await query.get();
        const allBootcamps = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Bootcamp[];
        
        // Sort in code to avoid composite index requirement for status
        allBootcamps.sort((a, b) => (a.status || '').localeCompare(b.status || ''));

        if (input?.source === 'all') {
            return allBootcamps.filter(camp => camp.status === 'Online');
        }

        return allBootcamps;

    } catch (error: any) {
        if (error.code === 5) {
            console.error(`[getAllBootcamps] Firestore collection 'bootcamps' not found.`);
            return [];
        }
        console.error("[getAllBootcamps] Error fetching bootcamps:", error);
        throw error;
    }
  }
);

// The addBootcamp flow now expects galleryImages to be URLs already.
export const addBootcamp = ai.defineFlow(
  {
    name: 'addBootcamp',
    inputSchema: BootcampSchema.omit({ id: true }),
    outputSchema: BootcampSchema.optional(),
  },
  async (bootcampData) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");

    // This ensures all fields from the form are included, along with the source.
    const finalBootcampData = {
        ...bootcampData,
        source: bootcampData.source // This is now passed from the frontend modal
    };

    const docRef = await db.collection("bootcamps").add(finalBootcampData);
    return { id: docRef.id, ...finalBootcampData };
  }
);

// The updateBootcamp flow also expects galleryImages to be URLs.
export const updateBootcamp = ai.defineFlow(
  {
    name: 'updateBootcamp',
    inputSchema: BootcampSchema,
    outputSchema: z.void(),
  },
  async (bootcamp) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    const { id, ...bootcampData } = bootcamp;
    if (!id) throw new Error("Bootcamp ID is required for updating.");

    await db.collection("bootcamps").doc(id).update(bootcampData);
  }
);

export const deleteAllBootcampsForProvider = ai.defineFlow({
    name: 'deleteAllBootcampsForProvider',
    inputSchema: z.string(), // provider name (source)
    outputSchema: z.void(),
}, async (providerName) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const snapshot = await db.collection('bootcamps').where('source', '==', providerName).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
});

export const registerForBootcamp = ai.defineFlow(
    {
        name: 'registerForBootcamp',
        inputSchema: z.object({
            campId: z.string(),
            registration: z.object({
                userId: z.string(),
                participants: z.array(z.object({ name: z.string(), birthDate: z.string(), gender: z.string().optional() })),
                role: z.string(),
                contactName: z.string(),
                contactEmail: z.string().email(),
                contactAddress: z.string(),
                contactPhone: z.string().optional(),
                totalPrice: z.number(),
                clubId: z.string().optional(),
                couponId: z.string().optional(),
            })
        }),
        outputSchema: z.void()
    },
    async ({ campId, registration }) => {
        const db = await getDb();
        if (!db) {
            throw new Error("Database service is not available.");
        }
        const campRef = db.collection('bootcamps').doc(campId);
        
        let campData: Bootcamp | undefined;
        let couponRef;
        if (registration.couponId) {
            couponRef = db.collection('coupons').doc(registration.couponId);
        }

        await db.runTransaction(async (transaction) => {
            const campDoc = await transaction.get(campRef);
            if (!campDoc.exists) {
                throw new Error("Document does not exist!");
            }
            
            campData = campDoc.data() as Bootcamp;

            if (campData.registrationDeadline && new Date(campData.registrationDeadline) < new Date()) {
                throw new Error("Registration deadline has passed.");
            }

            const currentParticipants = campData?.registrations?.length || 0;
            const spotsLeft = (campData.maxParticipants || Infinity) - currentParticipants;
            
            if (spotsLeft <= 0) {
                 throw new Error("No spots available.");
            }

            const registrationData = registration.participants.map(p => ({
                userId: registration.userId,
                name: p.name,
                role: registration.role,
                status: 'pending' as const,
                gender: p.gender, // Include gender
            }));
            
            const updates: { [key: string]: any } = {
                registrations: firestore.FieldValue.arrayUnion(...registrationData)
            };

            transaction.update(campRef, updates);

            // If a coupon was used, update it
            if (couponRef && registration.clubId) { 
                transaction.update(couponRef, {
                    usageCount: firestore.FieldValue.increment(1),
                    usedBy: firestore.FieldValue.arrayUnion(registration.clubId),
                });
            }
        });
        
        // Send confirmation email after the transaction is successful
        if (campData) {
            const participantList = registration.participants.map(p => `<li>${p.name} (${new Date(p.birthDate).toLocaleDateString('de-CH')})</li>`).join('');
            
            await sendMail({
                to: registration.contactEmail,
                subject: `Anmeldebestätigung für ${campData.name}`,
                html: `
                    <h1>Anmeldung erfolgreich!</h1>
                    <p>Hallo ${registration.contactName},</p>
                    <p>Vielen Dank für Ihre Anmeldung zum Bootcamp "<strong>${campData.name}</strong>".</p>
                    <h3>Angemeldete Teilnehmer:</h3>
                    <ul>${participantList}</ul>
                    <h3>Gesamtbetrag:</h3>
                    <p>CHF ${registration.totalPrice.toFixed(2)}</p>
                    <p>Eine separate Rechnung wird Ihnen in Kürze an folgende Adresse gesendet: ${registration.contactAddress}</p>
                    <br/>
                    <p>Wir freuen uns auf Ihre Teilnahme!</p>
                    <p>Ihr Amigoal Team</p>
                `
            });
        }
    }
);
