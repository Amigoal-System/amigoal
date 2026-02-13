

'use server';
/**
 * @fileOverview Genkit flows for managing training camps using Firebase Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb, getStorage } from '@/lib/firebase/server';
import { SportsFacilitySchema, type SportsFacility, RegistrationSchema, CampRequestSchema } from './camps.types';
import { firestore } from 'firebase-admin';
import { sendMail } from '@/services/email';
import { v4 as uuidv4 } from 'uuid';
import type { Camp } from './camps.types';
import { CampSchema } from './camps.types';

async function uploadImages(images: (string | undefined)[]): Promise<string[]> {
    const storage = await getStorage();
    if (!storage) {
        throw new Error("Storage service is not available.");
    }
    const bucket = storage.bucket();

    const uploadPromises = (images || []).map(async (image) => {
        if (!image || !image.startsWith('data:')) {
            return image; // It's already a URL or empty/undefined
        }

        const mimeType = image.match(/data:(.*);base64,/)?.[1] || 'image/jpeg';
        const fileExtension = mimeType.split('/')[1] || 'jpg';
        const base64Data = image.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        
        const fileName = `facility-images/${uuidv4()}.${fileExtension}`;
        const file = bucket.file(fileName);

        await file.save(buffer, {
            metadata: { contentType: mimeType },
        });
        
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


// --- Camps ---

export const getAllCamps = ai.defineFlow(
  {
    name: 'getAllCamps',
    inputSchema: z.object({
        type: z.enum(['camp', 'bootcamp']),
        source: z.string().optional(), // 'all', a specific provider name, or undefined for club-specific
    }).optional().nullable(),
    outputSchema: z.array(CampSchema),
  },
  async (input) => {
    const db = await getDb();
    if (!db) {
      console.error("[getAllCamps] Firestore is not initialized. Check your server configuration.");
      throw new Error("Database service is not available.");
    }
    
    try {
        let query: firestore.Query = db.collection("camps");
        
        if (input?.type) {
            query = query.where('type', '==', input.type);
        }

        if (input?.source && input.source !== 'all') {
             query = query.where('source', '==', input.source);
        }
        
        const snapshot = await query.get();
        const allCamps = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Camp[];

        if (input?.source === 'all') {
            const onlineCamps = allCamps.filter(camp => camp.status === 'Online');
            if (onlineCamps.length > 0) {
                return onlineCamps;
            }
             // Fallback for public page: if no "Online" camps are found, get all non-request camps.
            console.warn("[getAllCamps] No 'Online' camps found. Falling back to all non-Anfrage camps.");
            return allCamps.filter(camp => camp.status !== 'Anfrage');
        }

        return allCamps;

    } catch (error: any) {
        if (error.code === 5) { // NOT_FOUND
            console.error(`[getAllCamps] Firestore collection 'camps' not found.`);
            return []; // Return empty array if collection doesn't exist
        }
        console.error("[getAllCamps] Error fetching camps:", error);
        throw error; // Re-throw other errors
    }
  }
);

export const addCamp = ai.defineFlow(
  {
    name: 'addCamp',
    inputSchema: CampSchema.omit({ id: true }),
    outputSchema: CampSchema.optional(),
  },
  async (campData) => {
    const db = await getDb();
    if (!db) {
      console.error("[addCamp] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    try {
        const uploadedImageUrls = await uploadImages(campData.galleryImages || []);
        const finalCampData = {
            ...campData,
            galleryImages: uploadedImageUrls,
        };

        const campsCollectionRef = db.collection("camps");
        const docRef = await campsCollectionRef.add(finalCampData);
        return { id: docRef.id, ...finalCampData };
    } catch (error: any) {
        if (error.code === 5) {
            console.error("[addCamp] Firestore collection 'camps' not found.");
            throw new Error("The 'camps' collection does not exist.");
        }
        throw error;
    }
  }
);

export const updateCamp = ai.defineFlow(
  {
    name: 'updateCamp',
    inputSchema: CampSchema,
    outputSchema: z.void(),
  },
  async (camp) => {
    const db = await getDb();
    if (!db) {
      console.error("[updateCamp] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    const { id, ...campData } = camp;
    if (!id) throw new Error("Camp ID is required for updating.");
    
    const uploadedImageUrls = await uploadImages(campData.galleryImages || []);
    const finalCampData = {
        ...campData,
        galleryImages: uploadedImageUrls,
    };

    const campDoc = db.collection("camps").doc(id);
    await campDoc.update(finalCampData);
  }
);

export const requestTrainingCamp = ai.defineFlow(
    {
        name: 'requestTrainingCamp',
        inputSchema: CampRequestSchema,
        outputSchema: z.void()
    },
    async (requestData) => {
        const db = await getDb();
        if (!db) throw new Error("Database service not available");

        const newCampRequest: Partial<Camp> = {
            type: 'camp',
            name: `Anfrage: ${requestData.clubName}`,
            location: requestData.destination || 'Unbekannt',
            status: 'Anfrage',
            source: requestData.clubName,
            requestDetails: requestData
        };

        await db.collection('camps').add(newCampRequest);
        
        const adminEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@amigoal.ch';
        
        // Notify Super-Admin
        await sendMail({
            to: adminEmail,
            subject: `Neue Trainingslager-Anfrage von ${requestData.clubName}`,
            html: `
                <h1>Neue Anfrage für ein Trainingslager</h1>
                <p>Der Verein <strong>${requestData.clubName}</strong> hat eine neue Anfrage für ein Trainingslager gestellt.</p>
                <h3>Details:</h3>
                <ul>
                    <li><strong>Ansprechperson:</strong> ${requestData.contactPerson}</li>
                    <li><strong>E-Mail:</strong> ${requestData.email}</li>
                    <li><strong>Telefon:</strong> ${requestData.phone || 'N/A'}</li>
                    <li><strong>Reisezeitraum:</strong> ${requestData.dates ? `${new Date(requestData.dates.from).toLocaleDateString()} - ${new Date(requestData.dates.to).toLocaleDateString()}` : 'Unbekannt'}</li>
                    <li><strong>Destination:</strong> ${requestData.destination || 'Unbekannt'}</li>
                    <li><strong>Teilnehmer (ca.):</strong> ${requestData.participants || 'Unbekannt'}</li>
                    <li><strong>Budget (ca.):</strong> CHF ${requestData.budget || 'Unbekannt'}</li>
                    <li><strong>Wünsche:</strong> ${requestData.wishes || 'Keine'}</li>
                </ul>
                <p>Die Anfrage ist nun im Super-Admin-Dashboard unter "Trainingslager" ersichtlich.</p>
            `
        });

        // Notify Club
        await sendMail({
            to: requestData.email,
            subject: `Ihre Trainingslager-Anfrage bei Amigoal`,
            html: `
                <h1>Anfrage erhalten!</h1>
                <p>Hallo ${requestData.contactPerson},</p>
                <p>vielen Dank für Ihre Anfrage für ein Trainingslager über Amigoal. Wir haben die folgenden Details erhalten:</p>
                <ul>
                    <li><strong>Verein:</strong> ${requestData.clubName}</li>
                    <li><strong>Destination:</strong> ${requestData.destination || 'Unbekannt'}</li>
                    <li><strong>Zeitraum:</strong> ${requestData.dates ? `${new Date(requestData.dates.from).toLocaleDateString()} - ${new Date(requestData.dates.to).toLocaleDateString()}` : 'Unbekannt'}</li>
                </ul>
                <p>Unser Team wird sich in Kürze mit passenden Angeboten bei Ihnen melden.</p>
                <br/>
                <p>Sportliche Grüsse,</p>
                <p>Ihr Amigoal Team</p>
            `
        });
    }
);


export const registerForCamp = ai.defineFlow(
    {
        name: 'registerForCamp',
        inputSchema: z.object({
            campId: z.string(),
            registration: z.object({
                userId: z.string(),
                participants: z.array(z.object({ name: z.string(), birthDate: z.string() })),
                role: z.string(),
                contactName: z.string(),
                contactEmail: z.string().email(),
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
        const campRef = db.collection('camps').doc(campId);
        
        let campData: Camp | undefined;
        let couponRef;
        if (registration.couponId) {
            couponRef = db.collection('coupons').doc(registration.couponId);
        }

        await db.runTransaction(async (transaction) => {
            const campDoc = await transaction.get(campRef);
            if (!campDoc.exists) {
                throw new Error("Document does not exist!");
            }
            
            campData = campDoc.data() as Camp;

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
                    <p>Eine separate Rechnung wird Ihnen in Kürze zugesendet.</p>
                    <br/>
                    <p>Wir freuen uns auf Ihre Teilnahme!</p>
                    <p>Ihr Amigoal Team</p>
                `
            });
        }
    }
);

export const registerForWaitlist = ai.defineFlow(
    {
        name: 'registerForWaitlist',
        inputSchema: z.object({
            campId: z.string(),
            registration: z.object({
                userId: z.string(),
                participants: z.array(z.object({ name: z.string(), birthDate: z.string() })),
                role: z.string(),
                contactName: z.string(),
                contactEmail: z.string().email(),
            }),
        }),
        outputSchema: z.void()
    },
    async ({ campId, registration }) => {
        const db = await getDb();
        if (!db) {
            throw new Error("Database service is not available.");
        }
        const campRef = db.collection('camps').doc(campId);
        
        const waitlistData = registration.participants.map(p => ({
            userId: registration.userId,
            name: p.name,
            role: registration.role,
        }));
        
        await campRef.update({
            waitlist: firestore.FieldValue.arrayUnion(...waitlistData)
        });

        const campDoc = await campRef.get();
        if (campDoc.exists) {
            const campData = campDoc.data() as Camp;
            await sendMail({
                to: registration.contactEmail,
                subject: `Warteliste für ${campData.name}`,
                html: `
                    <h1>Erfolgreich auf der Warteliste!</h1>
                    <p>Hallo ${registration.contactName},</p>
                    <p>Vielen Dank, Sie wurden auf die Warteliste für das Bootcamp "<strong>${campData.name}</strong>" gesetzt.</p>
                    <p>Wir benachrichtigen Sie, sobald ein Platz frei wird.</p>
                    <br/>
                    <p>Sportliche Grüsse,</p>
                    <p>Ihr Amigoal Team</p>
                `
            });
        }
    }
);



// --- Facilities ---

async function getFacilitiesCollectionRef() {
    const db = await getDb();
    if (!db) {
        console.warn("Database not initialized. Returning null for facilities collection ref.");
        return null;
    }
    return db.collection("facilities");
}


export const getAllFacilities = ai.defineFlow(
  {
    name: 'getAllFacilities',
    inputSchema: z.void().optional().nullable(),
    outputSchema: z.array(SportsFacilitySchema),
  },
  async () => {
    const db = await getDb();
    if (!db) {
      console.error("[getAllFacilities] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    try {
        const facilitiesCollectionRef = db.collection("facilities");
        const data = await facilitiesCollectionRef.get();
        return data.docs.map(doc => ({ ...doc.data(), id: doc.id })) as SportsFacility[];
    } catch (error: any) {
        if (error.code === 5) {
             console.error("[getAllFacilities] Firestore collection 'facilities' not found.");
            throw new Error("The 'facilities' collection does not exist in Firestore.");
        }
        console.error("[getAllFacilities] Error fetching facilities:", error);
        throw error;
    }
  }
);

export const addFacility = ai.defineFlow(
  {
    name: 'addFacility',
    inputSchema: SportsFacilitySchema.omit({ id: true }),
    outputSchema: SportsFacilitySchema.optional(),
  },
  async (facilityData) => {
    const db = await getDb();
    if (!db) {
      console.error("[addFacility] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    try {
        const uploadedImageUrls = await uploadImages(facilityData.images || []);
        const finalData = { ...facilityData, images: uploadedImageUrls };

        const facilitiesCollectionRef = db.collection("facilities");
        const docRef = await facilitiesCollectionRef.add(finalData);
        return { id: docRef.id, ...finalData };
    } catch (error: any) {
        if (error.code === 5) {
            console.error("[addFacility] Firestore collection 'facilities' not found.");
            throw new Error("The 'facilities' collection does not exist.");
        }
        throw error;
    }
  }
);

export const updateFacility = ai.defineFlow(
  {
    name: 'updateFacility',
    inputSchema: SportsFacilitySchema,
    outputSchema: z.void(),
  },
  async (facility) => {
    const db = await getDb();
    if (!db) {
      console.error("[updateFacility] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    const { id, ...facilityData } = facility;
    if (!id) throw new Error("Facility ID is required for updating.");

    const uploadedImageUrls = await uploadImages(facilityData.images || []);
    const finalData = { ...facilityData, images: uploadedImageUrls };

    const facilityDoc = db.collection("facilities").doc(id);
    await facilityDoc.update(finalData);
  }
);

export const deleteFacility = ai.defineFlow(
  {
    name: 'deleteFacility',
    inputSchema: z.string(), // ID
    outputSchema: z.void(),
  },
  async (facilityId) => {
    const db = await getDb();
    if (!db) {
      console.error("[deleteFacility] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    if (!facilityId) throw new Error("Facility ID is required for deletion.");
    await db.collection("facilities").doc(facilityId).delete();
  }
);