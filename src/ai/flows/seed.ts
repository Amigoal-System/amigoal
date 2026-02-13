
'use server';
/**
 * @fileOverview A flow for seeding the database with initial data.
 */

import { getDb } from '@/lib/firebase/server';
import { initialFaqs } from './faqs.types';
import { initialFeatures } from './features.types';
import { initialSponsors } from './sponsors.types';
import { initialTasks } from './tasks.types';
import { initialHonoraryMembers } from './wallOfFame.types';
import { initialHighlights } from './highlights.types';
import { initialWaitlistPlayers } from './waitlist.types';
import { initialCards } from './cards.types';
import { initialMatches } from './matches.types';
import { initialTrainings } from './trainings.types';
import { initialProviders } from './providers.types';
import { initialEvents } from './events.types';
import { initialSaasNewsletterGroups, initialClubNewsletterGroups } from './newsletter.types';
import { initialSponsorLeads } from './sponsorLeads.types';
import { getConfiguration, updateConfiguration } from './configurations';
import { initialTeamCategories } from './categories.types';
import { defaultConfig } from './configurations.types';
import { initialClubPlayerSearches } from './clubPlayerSearches.types';
import { initialWebsiteProspects } from './prospects.types';
import { initialLeads } from './leads.types';
import { getAllClubs, addClub } from './clubs';
import { getAllAmigoalContracts, addAmigoalContract } from './amigoalContracts';
import { addMember } from './members';
import { roleToEmailMap } from '@/lib/roles';
import type { Member } from './members.types';

// Generic seeder function
async function seedCollection(collectionName: string, initialData: any[], idKey: string | null = 'id') {
  const db = await getDb();
  if (!db) {
    console.error(`[Seeder] Firestore not available. Skipping '${collectionName}'.`);
    return;
  }
  const collectionRef = db.collection(collectionName);
  const snapshot = await collectionRef.limit(1).get();

  if (snapshot.empty) {
    console.log(`[Seeder] Seeding '${collectionName}'...`);
    const batch = db.batch();
    initialData.forEach((item) => {
      const docData = { ...item };
      const docRef = idKey && item[idKey] ? collectionRef.doc(item[idKey]) : collectionRef.doc();
      if (idKey) delete docData[idKey];
      batch.set(docRef, docData);
    });
    await batch.commit();
    console.log(`[Seeder] ✅ '${collectionName}' seeded with ${initialData.length} documents.`);
  }
}

// Function to seed the main configuration document
async function seedConfigurations() {
    console.log("[Seeder] Checking for 'configurations' document...");
    const db = await getDb();
    if (!db) {
      console.error("[Seeder] ❌ Firestore not available for configuration seeding.");
      return;
    }
    const configDocRef = db.collection('configurations').doc('structures');
    const docSnap = await configDocRef.get();

    if (!docSnap.exists) {
        console.log("[Seeder] Document 'configurations/structures' not found. Creating with default structure.");
        await configDocRef.set(defaultConfig);
        console.log("[Seeder] ✅ 'configurations/structures' document created successfully.");
    } else {
        console.log("[Seeder] ✅ 'configurations/structures' document already exists.");
    }
}

// One-time migration for coupons
async function migrateCoupons() {
  const db = await getDb();
  if (!db) return;

  const couponsRef = db.collection('coupons');
  const snapshot = await couponsRef.get();
  
  if (snapshot.empty) return;

  console.log('[Migration] Checking coupons for missing `usedBy` field...');
  const batch = db.batch();
  let migratedCount = 0;

  snapshot.docs.forEach(doc => {
    const data = doc.data();
    if (!data.usedBy) {
      batch.update(doc.ref, { usedBy: [] });
      migratedCount++;
    }
  });

  if (migratedCount > 0) {
    await batch.commit();
    console.log(`[Migration] ✅ Migrated ${migratedCount} coupons.`);
  } else {
    console.log('[Migration] ✅ All coupons are up-to-date.');
  }
}

async function seedTeamCashData() {
    const db = await getDb();
    if (!db) {
        console.error("[Seeder] Firestore not available for team-cash seeding.");
        return;
    }

    try {
        const teamCashRef = db.collection('team-cash');
        const snapshot = await teamCashRef.limit(1).get();
        if (snapshot.empty) {
            console.log("[Seeder] Seeding 'team-cash'...");
            const { initialTeamCashData } = await import('./teamCash.types');
            const batch = db.batch();
            for (const [teamId, data] of Object.entries(initialTeamCashData)) {
                const docRef = teamCashRef.doc(teamId);
                batch.set(docRef, data);
            }
            await batch.commit();
            console.log(`[Seeder] ✅ 'team-cash' seeded for ${Object.keys(initialTeamCashData).length} teams.`);
        }
    } catch (e) {
        console.error("Error seeding team cash data:", e);
    }
}

async function seedContracts() {
    const db = await getDb();
    if (!db) return;
    
    // Find Lionel Messi's document ID in the 'members' collection
    const membersRef = db.collection('members');
    const q = membersRef.where('email', '==', 'lionel.messi@intermiami.com').limit(1);
    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
        // Log a warning instead of throwing an error to not block the server start.
        console.warn("[Seeder] Could not find 'lionel.messi@intermiami.com' to seed contracts. Skipping contract seeding.");
        return;
    }
    const messiDoc = querySnapshot.docs[0];
    const memberId = messiDoc.id;

    // Check if contracts already exist for this member
    const contractsRef = db.collection(`members/${memberId}/contracts`);
    const contractsSnapshot = await contractsRef.limit(1).get();
    if (!contractsSnapshot.empty) {
        console.log(`[Seeder] ✅ Contracts for member ${memberId} already exist.`);
        return;
    }
    
    console.log(`[Seeder] Seeding contracts for member ${memberId}...`);
    const mockContracts = [
        {
            id: 'active-2425',
            name: 'Aktiv-Vertrag 24/25',
            from: '2024-07-01',
            to: '2025-06-30',
            status: 'Aktiv',
            clauses: ['Versicherungsschutz', 'Matchprämien gem. Reglement', 'Automatische Verlängerung bei Klassenerhalt'],
            financials: { salary: 2500, goalBonus: 50, assistBonus: 25, cleanSheetBonus: 100 },
            goals: [
                { id: 'goals', label: 'Tore', current: 7, target: 15, icon: 'Target' },
                { id: 'assists', label: 'Vorlagen', current: 12, target: 10, icon: 'Award' },
                { id: 'playtime', label: 'Spielzeit (%)', current: 85, target: 80, icon: 'Dumbbell' },
            ]
        },
        {
            id: 'active-2324',
            name: 'Aktiv-Vertrag 23/24',
            from: '2023-07-01',
            to: '2024-06-30',
            status: 'Abgelaufen',
            clauses: ['Versicherungsschutz', 'Matchprämien gem. Reglement'],
            financials: { salary: 2000, goalBonus: 40, assistBonus: 20 },
            goals: [
                { id: 'goals', label: 'Tore', current: 12, target: 10, icon: 'Target' },
                { id: 'assists', label: 'Vorlagen', current: 8, target: 8, icon: 'Award' },
            ]
        }
    ];

    const batch = db.batch();
    mockContracts.forEach(contract => {
        const { id, ...contractData } = contract;
        const docRef = contractsRef.doc(id);
        batch.set(docRef, { ...contractData, memberId });
    });
    await batch.commit();
    console.log(`[Seeder] ✅ Seeded ${mockContracts.length} contracts.`);
}

async function backfillSaaSContracts() {
    console.log('[Seeder] Checking for missing SaaS contracts...');
    try {
        const allClubs = await getAllClubs({ includeArchived: true });
        const allContracts = await getAllAmigoalContracts();
        const contractedClubIds = new Set(allContracts.map(c => c.partnerId));
        
        let contractsCreated = 0;

        for (const club of allClubs) {
            if (club.id && !contractedClubIds.has(club.id)) {
                console.log(`[Seeder] Creating missing contract for club: ${club.name}`);
                
                const contractEndDate = club.contractEnd ? new Date(club.contractEnd) : new Date();
                if (!club.contractEnd) {
                    contractEndDate.setFullYear(contractEndDate.getFullYear() + 1);
                }

                await addAmigoalContract({
                    partnerId: club.id,
                    partnerName: club.name,
                    partnerType: 'Club',
                    contractType: `SaaS Abo ${club.package || 'Pro'}`,
                    startDate: club.createdAt ? new Date(club.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    endDate: contractEndDate.toISOString().split('T')[0],
                    status: 'Draft',
                    monthlyFee: club.package === 'Basis' ? 49 : 99,
                    notes: 'Automatisch nach-erstellt vom Seeder.',
                });
                contractsCreated++;
            }
        }
        
        if (contractsCreated > 0) {
            console.log(`[Seeder] ✅ Backfilled ${contractsCreated} missing SaaS contracts.`);
        } else {
            console.log('[Seeder] ✅ All clubs have a SaaS contract.');
        }

    } catch (error) {
        console.error('[Seeder] ❌ Error during SaaS contract backfill:', error);
    }
}


async function seedDemoUsers() {
    const db = await getDb();
    if (!db) return;

    console.log(`[Seeder] Seeding demo users...`);
    const allClubs = await getAllClubs({ includeArchived: true });
    const awesomeClub = allClubs.find(c => c.name === "FC Awesome");
    if (!awesomeClub || !awesomeClub.subdomain) {
        console.error("[Seeder] ❌ Could not find 'FC Awesome' with a subdomain to seed demo users.");
        return;
    }
    
    // Correctly define external roles that use their email as login
    const externalRoles = ['Parent', 'Sponsor', 'Scouting', 'Referee', 'Federation', 'Marketing', 'Trainingslager-Anbieter', 'Bootcamp-Anbieter', 'Turnieranbieter'];

    const demoUsers = Object.entries(roleToEmailMap).map(([role, email]) => {
        const [firstName, lastName] = role.split('-');
        
        const isExternal = externalRoles.includes(role);
        
        // For internal users, the clubLoginUser is `vorname.nachname@club-slug`
        // For external users, it's their full email.
        const clubLoginUser = isExternal 
            ? email 
            : `${firstName.toLowerCase().replace(' ', '.')}.${(lastName || 'user').toLowerCase()}@${awesomeClub.subdomain}`;

        return {
            email: email,
            firstName: firstName,
            lastName: lastName || 'User',
            roles: [role],
            clubId: awesomeClub.id,
            clubName: awesomeClub.name,
            clubLoginUser: clubLoginUser
        }
    });

    let seededCount = 0;
    for (const userData of demoUsers) {
        const memberRef = db.collection('members').where('email', '==', userData.email);
        const snapshot = await memberRef.get();
        if (snapshot.empty) {
            await addMember({
                salutation: 'Unbekannt',
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                roles: userData.roles,
                teams: ['1. Mannschaft'],
                memberNr: String(Math.floor(10000 + Math.random() * 90000)),
                status: 'Aktiv',
                memberSince: new Date().toISOString().split('T')[0],
                entryDate: new Date().toISOString().split('T')[0],
                fee: { season: '24/25', amount: 350, date: new Date().toISOString(), paid: true },
                clubId: userData.clubId,
                clubName: userData.clubName,
                clubLoginUser: userData.clubLoginUser,
            } as any);
            seededCount++;
        }
    }
    if (seededCount > 0) {
        console.log(`[Seeder] ✅ Seeded ${seededCount} new demo users.`);
    } else {
         console.log(`[Seeder] ✅ All demo users already exist.`);
    }
}

export async function seedAllData() {
  try {
    // First, ensure the main configuration document exists.
    await seedConfigurations();
    
    // Then seed all other collections.
    await seedCollection('faqs', initialFaqs, 'question');
    await seedCollection('features', initialFeatures);
    await seedCollection('leads', initialLeads);
    await seedCollection('sponsors', initialSponsors);
    await seedCollection('tasks', initialTasks, null);
    await seedCollection('honoraryMembers', initialHonoraryMembers);
    await seedCollection('highlights', initialHighlights);
    await seedCollection('waitlist', initialWaitlistPlayers);
    await seedCollection('cards', initialCards);
    await seedCollection('matches', initialMatches);
    await seedCollection('trainings', initialTrainings);
    await seedCollection('trainingCampProviders', initialProviders.filter(p => p.type === 'Trainingslager'));
    await seedCollection('bootcampProviders', initialProviders.filter(p => p.type === 'Bootcamp'));
    await seedCollection('events', initialEvents);
    await seedCollection('sponsorLeads', initialSponsorLeads);
    await seedCollection('associationMessages', [], null); // Example with no initial data
    await seedCollection('teamCategories', initialTeamCategories);
    await seedCollection('clubPlayerSearches', initialClubPlayerSearches);
    await seedCollection('notifications', []);
    await seedCollection('websiteProspects', initialWebsiteProspects);
        
    // Seed newsletter groups
    const allNewsletterGroups = [...initialSaasNewsletterGroups, ...initialClubNewsletterGroups];
    await seedCollection('newsletterGroups', allNewsletterGroups, 'name');

    // Run migrations
    await migrateCoupons();

    await seedTeamCashData();
    
    await seedContracts();

    // Backfill contracts for existing clubs
    await backfillSaaSContracts();

    // Seed demo users for all roles
    await seedDemoUsers();

  } catch (error) {
    console.error('[Seeder] ❌ An error occurred during database seeding:', error);
  }
}
