
'use client';

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { type Locale } from '@/i18n.config';
import { getFirebaseServices } from '@/firebase';
import { onAuthStateChanged, type User as FirebaseUser, signOut as firebaseSignOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, type Firestore } from 'firebase/firestore';
import type { Member } from '@/ai/flows/members.types';
import { allPossibleRoles } from '@/lib/roles';
import { getAllBootcampProviders } from '@/ai/flows/bootcampProviders';
import { getAllTrainingCampProviders } from '@/ai/flows/trainingCampProviders';
import { useAuth } from '@/firebase';
import type { Provider } from '@/ai/flows/providers.types';
import type { Club } from '@/ai/flows/clubs.types';

const roleToNameMap = {
    'Super-Admin': 'Super Admin',
    'Club-Admin': 'Club Admin',
    'Manager': 'Marina G.',
    'Coach': 'Pep Guardiola',
    'Player': 'Lionel Messi',
    'Parent': 'Jorge Messi',
    'Sponsor': 'Coca Cola',
    'Referee': 'Pierluigi C.',
    'Federation': 'Gianni I.',
    'Scouting': 'Serra Juni',
    'Supplier': 'Nike Sports',
    'Fan': 'Max Mustermann',
    'Marketing': 'Seth Godin',
    'Board': 'Karl-Heinz R.',
    'Facility Manager': 'John Smith',
    'Bootcamp-Anbieter': 'Bootcamp Anbieter',
    'Trainingslager-Anbieter': 'Trainingslager Anbieter',
    'Turnieranbieter': 'Turnieranbieter',
};

const userAvatars = {
    'Super-Admin': 'https://placehold.co/40x40.png?text=SA',
    'Club-Admin': 'https://placehold.co/40x40.png?text=CA',
    'Coach': 'https://placehold.co/40x40.png?text=CO',
    'Player': 'https://placehold.co/40x40.png?text=PL',
    'Parent': 'https://placehold.co/40x40.png?text=PA',
    'Sponsor': 'https://placehold.co/40x40.png?text=SP',
    'Manager': 'https://placehold.co/40x40.png?text=MA',
    'Referee': 'https://placehold.co/40x40.png?text=RE',
    'Federation': 'https://placehold.co/40x40.png?text=FE',
    'Scouting': 'https://placehold.co/40x40.png?text=SC',
    'Supplier': 'https://placehold.co/40x40.png?text=SU',
    'Fan': 'https://placehold.co/40x40.png?text=FA',
    'Marketing': 'https://placehold.co/40x40.png?text=MK',
    'Board': 'https://placehold.co/40x40.png?text=BO',
    'Facility Manager': 'https://placehold.co/40x40.png?text=FM',
    'Bootcamp-Anbieter': 'https://placehold.co/40x40.png?text=BA',
    'Trainingslager-Anbieter': 'https://placehold.co/40x40.png?text=TA',
    'Turnieranbieter': 'https://placehold.co/40x40.png?text=TA',
};

const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';

interface TeamContextType {
    teams: string[];
    activeTeam: string;
    setActiveTeam: (team: string) => void;
    currentUserRole: string | null;
    handleRoleChange: (role: string) => void;
    userRoles: string[];
    lang: Locale;
    hasTournamentModule: boolean;
    hasNewsletterModule: boolean;
    club: Club | null;
    setClub: React.Dispatch<React.SetStateAction<Club | null>>;
    clubName: string | null;
    clubLogo: string | null;
    userName: string;
    userEmail: string;
    userAvatar: string;
    userInitials: string;
    isAuthReady: boolean;
    isLoading: boolean;
    currentUser: FirebaseUser | null;
    userProfile: Member | Provider | null;
    signOut: () => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider = ({ children }: { children: React.ReactNode }) => {
    const params = useParams();
    const router = useRouter();
    const lang = params.lang as Locale;
    const auth = useAuth();
    
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [userProfile, setUserProfile] = useState<Member | Provider | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
    const [activeTeam, setActiveTeam] = useState<string>('');
    const [club, setClub] = useState<Club | null>(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [hasTournamentModule, setHasTournamentModule] = useState(false);
    const [hasNewsletterModule, setHasNewsletterModule] = useState(false);

    const handleRoleChange = (role: string) => {
        if (currentUserRole !== role) {
            localStorage.setItem('amigoal_active_role', role);
            // We need to reload to correctly apply all context and navigation changes
            window.location.reload(); 
        }
    };

    const loadUserData = useCallback(async (user: FirebaseUser, db: Firestore) => {
        setIsLoading(true);
        try {
            if (user.email === 'super.admin@amigoal.ch') {
                setCurrentUserRole('Super-Admin');
                setClub(null);
                setUserProfile(null);
                setIsLoading(false);
                return;
            }

            const activeRoleFromStorage = localStorage.getItem('amigoal_active_role');
            const loginIdentifier = localStorage.getItem('amigoal_login_identifier') || user.email;

            // Define a function to process and set user data
            const setUserData = async (profile: Member | Provider, userClub?: Club | null) => {
                let finalRole = null;
                if ('roles' in profile) { // Member
                    finalRole = activeRoleFromStorage && profile.roles.includes(activeRoleFromStorage) ? activeRoleFromStorage : profile.roles[0] || 'Gast';
                    setActiveTeam(profile.teams?.[0] || '');
                } else if ('type' in profile) { // Provider
                    finalRole = `${profile.type}-Anbieter`;
                }

                setUserProfile(profile);
                setClub(userClub || null);
                setCurrentUserRole(finalRole);
            };

            // 1. Check for Club-Admin login (user used `admin@clubname`)
            const clubsRef = collection(db, "clubs");
            if (loginIdentifier && !loginIdentifier.includes('@')) {
                const qClubAdmin = query(clubsRef, where("clubLoginUser", "==", loginIdentifier));
                const clubAdminSnap = await getDocs(qClubAdmin);
                if (!clubAdminSnap.empty) {
                    const userClub = { id: clubAdminSnap.docs[0].id, ...clubAdminSnap.docs[0].data() } as Club;
                    // For club admins, their "profile" is derived from the club object
                    const adminProfile: Partial<Member> = {
                        firstName: userClub.manager,
                        lastName: '',
                        email: userClub.contactEmail,
                        roles: ['Club-Admin', 'Manager'],
                        clubId: userClub.id,
                        clubName: userClub.name,
                    };
                    await setUserData(adminProfile as Member, userClub);
                    return;
                }
            }
            
            // 2. Check for Member (player, coach, etc.) by their specific clubLoginUser or email
            const membersRef = collection(db, "members");
            const qMember = query(membersRef, where("email", "==", user.email));
            const memberSnap = await getDocs(qMember);

            if (!memberSnap.empty) {
                const profile = { id: memberSnap.docs[0].id, ...memberSnap.docs[0].data() } as Member;
                let userClub: Club | null = null;
                if (profile.clubId) {
                    const clubDocRef = doc(db, "clubs", profile.clubId);
                    const clubDoc = await getDoc(clubDocRef);
                    if (clubDoc.exists()) userClub = { id: clubDoc.id, ...clubDoc.data() } as Club;
                }
                await setUserData(profile, userClub);
                return;
            }
            
            // 3. Check for external roles by email (Providers)
            const providers = await Promise.all([
                getAllBootcampProviders(),
                getAllTrainingCampProviders(),
            ]).then(results => results.flat());
            
            const providerProfile = providers.find(p => p.email === user.email);
            if (providerProfile) {
                await setUserData(providerProfile, null);
                return;
            }
            
            console.warn(`No specific profile found for user ${user.email}. Defaulting to 'Gast'.`);
            setCurrentUserRole('Gast');

        } catch (error) {
            console.error("Error loading user data:", error);
            setCurrentUserRole('Gast'); // Set a fallback role on error
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const { db } = getFirebaseServices();
        if (!auth || !db) {
            setIsAuthReady(true);
            setIsLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                await loadUserData(user, db);
            } else {
                setUserProfile(null);
                setCurrentUserRole(null);
                setClub(null);
                setActiveTeam('');
                if (typeof window !== 'undefined') localStorage.clear();
                 setIsLoading(false);
            }
            setIsAuthReady(true);
        });

        return () => unsubscribe();
    }, [auth, loadUserData]);
    
    useEffect(() => {
        if(typeof window !== 'undefined') {
            setHasTournamentModule(localStorage.getItem('amigoal_has_tournament_module') === 'true');
            setHasNewsletterModule(localStorage.getItem('amigoal_has_newsletter_module') === 'true');
        }
    }, []);
    
    const userRoles = useMemo(() => {
        if (currentUserRole === 'Super-Admin' || (typeof window !== 'undefined' && localStorage.getItem('original_super_admin_email'))) {
            return allPossibleRoles;
        }
        return (userProfile as Member)?.roles || (currentUserRole ? [currentUserRole] : []);
    }, [userProfile, currentUserRole]);

    const teams = useMemo(() => (userProfile as Member)?.teams || [], [userProfile]);

    let displayName = 'Gast';
    if (userProfile && 'firstName' in userProfile) { // It's a Member
        displayName = `${userProfile.firstName} ${userProfile.lastName}`;
    } else if (userProfile && 'contact' in userProfile) { // It's a Provider
        displayName = userProfile.contact;
    } else if (currentUserRole) {
        displayName = roleToNameMap[currentUserRole] || 'Gast';
    }


    const userName = displayName;
    const userEmail = userProfile?.email || currentUser?.email || '';
    const userAvatar = (userProfile as Member)?.avatar || currentUser?.photoURL || (currentUserRole ? userAvatars[currentUserRole] : '') || '';
    const userInitials = getInitials(userName);
    const clubName = club?.name || null;
    const clubLogo = club?.logo || null;

    const signOut = useCallback(async () => {
        if (!auth) return;
        try {
          await firebaseSignOut(auth);
          // The onAuthStateChanged listener will handle the state cleanup
          // and the router.replace will be triggered by the effect in DashboardLayoutUI
        } catch (error) {
          console.error("Error signing out:", error);
        }
      }, [auth]);

    const value: TeamContextType = { 
        teams, 
        activeTeam, 
        setActiveTeam, 
        currentUserRole, 
        handleRoleChange,
        userRoles,
        lang, 
        hasTournamentModule, 
        hasNewsletterModule,
        club, 
        setClub,
        clubName,
        clubLogo,
        userName,
        userEmail,
        userAvatar,
        userInitials,
        isAuthReady,
        isLoading,
        currentUser,
        userProfile,
        signOut,
    };

    return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};

export const useTeam = () => {
    const context = useContext(TeamContext);
    if (context === undefined) {
        throw new Error('useTeam must be used within a TeamProvider');
    }
    return context;
};
