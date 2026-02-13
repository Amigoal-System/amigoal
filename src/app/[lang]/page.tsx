

'use client';

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AmigoalLogo, AppleIcon, FacebookIcon, GoogleIcon } from "@/components/icons";
import { Separator } from "@/components/ui/separator";
import { getDictionary } from "@/lib/i18n";
import { type Locale } from "@/i18n.config";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingIconsHero } from "@/components/ui/floating-icons-hero-section";
import { FeatureRequestModal } from "@/components/ui/feature-request-modal";
import { Lightbulb, Mail, FileText as BlogIcon, Info, LogIn, UserSquare, Handshake, Video, Trophy, Mountain, Ticket, UserPlus, FileText } from "lucide-react";
import DisplayCards from "@/components/ui/display-cards";
import { BarChart2, Users, ClipboardList, Weight, Wallet, CalendarDays, Megaphone, ShieldCheck, Coins, Building, Loader2 } from 'lucide-react';
import { ContactModal } from "@/components/ui/contact-modal";
import { WaitlistForm } from "@/components/ui/waitlist-form";
import { AuroraBackground } from "@/components/ui/aurora-background";
import IntegrationsSection from "@/components/ui/integrations-marquee";
import { TrueFocus } from "@/components/ui/true-focus";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { NavHeader } from "@/components/ui/nav-header";
import { SiteFooter } from "@/components/ui/footer";
import { getFirebaseServices } from "@/firebase";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, OAuthProvider, FacebookAuthProvider, sendPasswordResetEmail } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { getEmailForLogin } from '@/ai/flows/login';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PublicChatbot } from "@/components/PublicChatbot";
import AiAgentInput from "@/components/ui/ai-agent-input";
import { useIsMobile } from "@/hooks/use-mobile";


const testUsers = [
    { role: 'Club-Admin', email: 'club.admin@fc-awesome.com' },
    { role: 'Coach', email: 'pep.guardiola@mancity.com' },
    { role: 'Player', email: 'lionel.messi@intermiami.com' },
    { role: 'Parent', email: 'jorge.messi@intermiami.com' },
    { role: 'Manager', email: 'marina.g@chelsea.com' },
    { role: 'Referee', email: 'pierluigi.c@fifa.com' },
    { role: 'Sponsor', email: 'coca.cola@sponsoring.com' },
    { role: 'Federation', email: 'gianni.i@fifa.com' },
    { role: 'Scouting', email: 'serra.juni@barcelona.com' },
    { role: 'Supplier', email: 'nike.sports@supplier.com' },
    { role: 'Fan', email: 'max.mustermann@fan.com' },
    { role: 'Marketing', email: 'marketing@amigoal.ch' },
    { role: 'Board', email: 'karl-heinz.r@bayern.com' },
    { role: 'Facility Manager', email: 'john.smith@facility.com' },
    { role: 'Trainingslager-Anbieter', email: 'provider@trainingslager.com'}
];

const externalRoles = ['Parent', 'Fan', 'Sponsor', 'Scouting', 'Supplier', 'Federation', 'Facility Manager', 'Bootcamp-Anbieter', 'Trainingslager-Anbieter', 'Turnieranbieter'];


const iconPositions = [
    { top: '15%', left: '10%' }, { top: '20%', left: '80%' },
    { top: '25%', left: '30%' }, { top: '80%', left: '85%' },
    { top: '85%', left: '20%' }, { top: '10%', left: '60%' },
    { top: '90%', left: '50%' }, { top: '15%', left: '5%' },
    { top: '75%', left: '90%' }, { top: '85%', left: '5%' },
    { top: '10%', left: '40%' }, { top: '80%', left: '35%' },
];

const floatingIcons = [
    { id: 1, icon: () => <BarChart2 className="w-8 h-8 text-purple-500" />, style: iconPositions[0], tooltip: "Spiel- & Leistungsanalyse" },
    { id: 2, icon: () => <Users className="w-8 h-8 text-green-500" />, style: iconPositions[1], tooltip: "Mitgliederverwaltung" },
    { id: 3, icon: () => <ClipboardList className="w-8 h-8 text-blue-500" />, style: iconPositions[2], tooltip: "Trainingsplanung & Präsenzen" },
    { id: 4, icon: () => <Weight className="w-8 h-8 text-orange-500" />, style: iconPositions[3], tooltip: "Belastungssteuerung" },
    { id: 5, icon: () => <Trophy className="w-8 h-8 text-yellow-500" />, style: iconPositions[4], tooltip: "Spiel- & Turnierverwaltung" },
    { id: 6, icon: () => <FileText className="w-8 h-8 text-sky-500" />, style: iconPositions[5], tooltip: "Dokumentenmanagement" },
    { id: 7, icon: () => <Wallet className="w-8 h-8 text-red-500" />, style: iconPositions[6], tooltip: "Finanzen & Spesen" },
    { id: 8, icon: () => <CalendarDays className="w-8 h-8 text-pink-500" />, style: iconPositions[7], tooltip: "Kalender & Events" },
    { id: 9, icon: () => <Megaphone className="w-8 h-8 text-indigo-500" />, style: iconPositions[8], tooltip: "Kommunikation & News" },
    { id: 10, icon: () => <ShieldCheck className="w-8 h-8 text-teal-500" />, style: iconPositions[9], tooltip: "Verbandsmanagement & J+S" },
    { id: 11, icon: () => <Coins className="w-8 h-8 text-amber-500" />, style: iconPositions[10], tooltip: "Sponsoring & Tokenization" },
    { id: 12, icon: () => <Building className="w-8 h-8 text-gray-500" />, style: iconPositions[11], tooltip: "Anlagen- & Materialverwaltung" },
];

const featureCards = [
    {
      className: "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
      icon: <BarChart2 className="size-4 text-purple-300" />,
      title: "KI-Spielanalyse",
      description: "Automatische Spielberichte",
      date: "Jetzt verfügbar",
      titleClassName: "text-purple-500",
    },
    {
      className: "[grid-area:stack] translate-x-12 translate-y-8 hover:-translate-y-2 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
      icon: <Users className="size-4 text-green-300" />,
      title: "Mitgliederverwaltung",
      description: "Zentral & effizient",
      date: "Kernfunktion",
      titleClassName: "text-green-500",
    },
    {
      className: "[grid-area:stack] translate-x-24 translate-y-16 hover:translate-y-6",
      icon: <ClipboardList className="size-4 text-blue-300" />,
      title: "Trainingsplanung",
      description: "Intelligente Vorschläge",
      date: "Neu",
      titleClassName: "text-blue-500",
    },
     {
      className: "[grid-area:stack] translate-x-36 translate-y-24 hover:translate-y-16",
      icon: <Wallet className="size-4 text-orange-300" />,
      title: "Finanz-Cockpit",
      description: "Einnahmen & Ausgaben",
      date: "Bald",
      titleClassName: "text-orange-500",
    },
];

const publicFeatureCards = [
    { title: "Sponsoring", description: "Werden Sie Partner und unterstützen Sie den Sport.", icon: <Handshake className="w-8 h-8 text-primary"/>, href: "/sponsoring" },
    { title: "Highlights", description: "Sehen Sie die besten Momente unserer Community.", icon: <Video className="w-8 h-8 text-primary"/>, href: "/highlights" },
    { title: "Turniere", description: "Finden oder organisieren Sie Ihr nächstes Turnier.", icon: <Trophy className="w-8 h-8 text-primary"/>, href: "/tournaments" },
    { title: "Trainingslager", description: "Professionelle Camps für Ihr Team.", icon: <Mountain className="w-8 h-8 text-primary"/>, href: "/camps" },
    { title: "Bootcamps", description: "Intensive Trainings für Spieler.", icon: <Mountain className="w-8 h-8 text-primary"/>, href: "/bootcamp" },
    { title: "Tickets", description: "Sichern Sie sich Ihren Platz beim nächsten Spiel.", icon: <Ticket className="w-8 h-8 text-primary"/>, href: "/tickets" },
    { title: "Warteliste", description: "Finden Sie einen passenden Verein für Ihr Kind.", icon: <UserPlus className="w-8 h-8 text-primary"/>, href: "/waitlist" },
];

const ForgotPasswordModal = ({ isOpen, onOpenChange, onPasswordReset }) => {
  const [identity, setIdentity] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    setIsLoading(true);
    await onPasswordReset(identity);
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Passwort zurücksetzen</DialogTitle>
          <CardDescription>
            Geben Sie Ihren Benutzernamen oder Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link an die hinterlegte E-Mail-Adresse, um Ihr Passwort zurückzusetzen.
          </CardDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <Label htmlFor="reset-identity">Benutzername / E-Mail</Label>
          <Input 
            id="reset-identity" 
            type="text" 
            placeholder="z.B. max.mustermann oder admin@fcalbania"
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={handleReset} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Link senden
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


export default function LoginPage() {
  const params = useParams();
  const router = useRouter();
  const lang = params.lang as Locale;
  const isMobile = useIsMobile();
  const [clubIdentifier, setClubIdentifier] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [dict, setDict] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showFeedbackCard, setShowFeedbackCard] = useState(false);
  const { toast } = useToast();

  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [initialChatbotMessage, setInitialChatbotMessage] = useState('');


  useEffect(() => {
    setIsClient(true);
    localStorage.removeItem('impersonated_email');
    localStorage.removeItem('original_super_admin_email');
    localStorage.removeItem('amigoal_active_role');
    localStorage.removeItem('amigoal_club_id');
    
    const storedEmail = localStorage.getItem('amigoal_email');
    if (storedEmail) {
      setPartnerEmail(storedEmail);
    }
  }, []);

  useEffect(() => {
    if (lang) {
      const fetchDict = async () => {
          const d = await getDictionary(lang);
          setDict(d.login);
      }
      fetchDict();
    }
  }, [lang]);

  const performLogin = async (identifier: string, realEmail: string) => {
    const { auth } = getFirebaseServices();
    await signInWithEmailAndPassword(auth, realEmail, password);
    localStorage.setItem('amigoal_email', realEmail);
    localStorage.setItem('amigoal_login_identifier', identifier);
    router.push(`/${lang}/dashboard`);
  };

  const handleClubLogin = async () => {
    if (!clubIdentifier || !password) {
      setLoginError("Bitte alle Felder ausfüllen.");
      return;
    }
    
    setLoginError('');

    try {
      const { email: realEmail, error: lookupError } = await getEmailForLogin({ identifier: clubIdentifier });
      
      if (lookupError || !realEmail) {
        setLoginError("Benutzername oder Passwort ungültig.");
        return;
      }

      await performLogin(clubIdentifier, realEmail);
    } catch (firebaseError: any) {
      console.error("Login Error:", firebaseError);
      setLoginError("Benutzername oder Passwort ungültig.");
    }
  };

  const handlePartnerLogin = async (loginIdentifier?: string) => {
    const identifier = loginIdentifier || partnerEmail;
    if (!identifier || !password) {
      setLoginError("Bitte alle Felder ausfüllen.");
      return;
    }

    setLoginError('');

    try {
      const { email: realEmail, error: lookupError } = await getEmailForLogin({ identifier });
      if (lookupError || !realEmail) {
        setLoginError("E-Mail oder Passwort ungültig.");
        return;
      }
      await performLogin(identifier, realEmail);
    } catch (firebaseError: any) {
      console.error("Login Error:", firebaseError);
      setLoginError("E-Mail oder Passwort ungültig.");
    }
  };
  
  const handleQuickLogin = (newEmail: string) => {
    const testUser = testUsers.find(u => u.email === newEmail);
    if (testUser) {
        localStorage.setItem('amigoal_email', newEmail);
        localStorage.setItem('amigoal_active_role', testUser.role);
        router.push(`/${lang}/dashboard`);
    } else {
        toast({
            title: "Demo-Login fehlgeschlagen",
            description: "Dieser Test-Benutzer wurde nicht gefunden.",
            variant: "destructive",
        });
    }
  };

  const handleOAuthLogin = async (providerName: 'google' | 'apple' | 'facebook') => {
    const { auth } = getFirebaseServices();
    if (!auth) {
        toast({ title: "Authentifizierung nicht bereit", variant: "destructive" });
        return;
    }
    let provider;
    switch(providerName) {
        case 'google':
            provider = new GoogleAuthProvider();
            break;
        case 'apple':
            provider = new OAuthProvider('apple.com');
            break;
        case 'facebook':
            provider = new FacebookAuthProvider();
            break;
        default:
            toast({ title: "Unbekannter Anbieter", variant: "destructive" });
            return;
    }

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (user.email) {
        localStorage.setItem('amigoal_email', user.email);
        localStorage.setItem('amigoal_login_identifier', user.email);
      }
      router.push(`/${lang}/dashboard`);
    } catch (error) {
      console.error(`${providerName} login failed:`, error);
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: `Die Anmeldung mit ${providerName} konnte nicht abgeschlossen werden.`,
        variant: "destructive",
      });
    }
  };


  const handleRegisterClick = () => {
      router.push(`/${lang}/register`);
  };

   const handlePasswordReset = async (identity: string) => {
    if (!identity) {
      toast({ title: "Benutzername oder E-Mail fehlt", variant: "destructive" });
      return;
    }
    const { auth } = getFirebaseServices();
    
    // Always show a generic success message to prevent user enumeration
    toast({
        title: "E-Mail gesendet",
        description: "Wenn ein Konto mit dieser Information existiert, wurde ein Link zum Zurücksetzen des Passworts gesendet.",
    });

    try {
        const { email: emailToSend, error } = await getEmailForLogin({ identifier: identity });
        
        if (emailToSend && !error) {
             await sendPasswordResetEmail(auth, emailToSend);
        } else {
            // Log error but don't inform user to prevent enumeration attacks
            console.warn("Password reset lookup failed or email not found for:", identity, error);
        }
    } catch (error) {
        console.error("Password reset email sending error:", error);
    }
    
    setIsForgotPasswordOpen(false);
  };
  
  const handleHeaderSearch = (query: string) => {
    setInitialChatbotMessage(query);
    setIsChatbotOpen(true);
  };

  const aiMenuOptions = ["Verein", "Trainer", "Spieler", "Fussballschulen", "Sponsor"];

  if (!isClient || !dict) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
        </div>
    ); 
  }

  return (
    <>
      <NavHeader 
        onLoginClick={() => setShowLogin(true)} 
        onSearch={handleHeaderSearch}
        onIdeaClick={() => setShowFeedbackCard(prev => !prev)}
      />
      <AnimatePresence>
        {showFeedbackCard && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-40"
          >
            <FeedbackCard />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <FloatingIconsHero
          title="Amigoal"
          subtitle="Die All-in-One Plattform für deinen Fussballverein. Vereinfache die Verwaltung, verbessere die Kommunikation und bringe deinen Club auf das nächste Level."
          ctaText="Anmelden & Loslegen"
          onCtaClick={handleRegisterClick}
          icons={floatingIcons}
        />
      </div>

       {isMobile && (
            <div className="py-20 flex flex-col items-center justify-center bg-background space-y-8 px-4">
                <AiAgentInput 
                    placeholder="frage etwas..."
                    onSubmit={handleHeaderSearch}
                    menuOptions={aiMenuOptions}
                />
            </div>
       )}
      
      <div className="py-20 flex flex-col items-center justify-center bg-background space-y-8 px-4">
           <TrueFocus
              sentence="Alles was dein Verein braucht"
              borderColor="hsl(var(--primary))"
            />
        </div>
        
        <div className="py-20 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 container mx-auto">
                {publicFeatureCards.map((card, index) => (
                <Link key={index} href={`/${lang}${card.href}`} className="md:col-span-1 lg:col-span-1">
                    <Card className="p-6 flex items-center gap-4 hover:bg-muted/50 transition-colors h-full">
                        {card.icon}
                        <div>
                            <h3 className="font-bold">{card.title}</h3>
                            <p className="text-sm text-muted-foreground">{card.description}</p>
                        </div>
                    </Card>
                </Link>
                ))}
            </div>
        </div>

      <div className="py-20 flex flex-col items-center justify-center bg-muted/30 space-y-16">
        <DisplayCards cards={featureCards} />
        <WaitlistForm />
      </div>

       <AuroraBackground>
          <div className="py-20 flex flex-col items-center justify-center bg-transparent space-y-8 px-4 text-center">
            <TrueFocus
              sentence="Erweitere deine Möglichkeiten"
              className="text-foreground"
              borderColor="hsl(var(--primary))"
            />
             <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Amigoal ist mehr als nur ein Werkzeug. Es ist ein komplettes Ökosystem, das alle Bereiche deines Vereins abdeckt und dir hilft, Potenziale voll auszuschöpfen.
            </p>
          </div>
          <IntegrationsSection />
      </AuroraBackground>

      <SiteFooter onLoginClick={() => setShowLogin(true)} />

      <AnimatePresence>
        {showLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowLogin(false)}
          >
            <motion.div
              initial={{ y: "100vh" }}
              animate={{ y: 0 }}
              exit={{ y: "100vh" }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm"
            >
              <Card className="mx-auto w-full max-h-[90vh] overflow-y-auto">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <AmigoalLogo className="h-16 w-16" />
                  </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="club" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="club">Vereins-Login</TabsTrigger>
                            <TabsTrigger value="partner">Partner-Login</TabsTrigger>
                        </TabsList>
                        <TabsContent value="club" className="pt-4">
                             <div className="grid gap-4">
                                <div className="grid gap-2">
                                <Label htmlFor="club-identifier">{dict.usernameLabel}</Label>
                                <Input id="club-identifier" type="text" placeholder="z.B. admin@fcdietikon" required value={clubIdentifier} onChange={(e) => setClubIdentifier(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="club-password">{dict.passwordLabel}</Label>
                                    <Button variant="link" className="ml-auto inline-block text-sm underline p-0 h-auto" onClick={() => setIsForgotPasswordOpen(true)}>
                                        {dict.forgotPassword}
                                    </Button>
                                </div>
                                <Input id="club-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleClubLogin()} />
                                </div>
                                {loginError && <p className="text-xs text-destructive">{loginError}</p>}
                                <Button type="button" className="w-full" onClick={() => handleClubLogin()}>
                                    {dict.loginButton}
                                </Button>
                            </div>
                        </TabsContent>
                         <TabsContent value="partner" className="pt-4">
                            <div className="space-y-4">
                               <p className="text-xs text-center text-muted-foreground">Für Eltern, Sponsoren, Anbieter etc.</p>
                                <div className="grid gap-2">
                                <Label htmlFor="partner-email">E-Mail</Label>
                                <Input id="partner-email" type="email" placeholder="ihre@email.com" required value={partnerEmail} onChange={(e) => setPartnerEmail(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="partner-password">{dict.passwordLabel}</Label>
                                     <Button variant="link" className="ml-auto inline-block text-sm underline p-0 h-auto" onClick={() => setIsForgotPasswordOpen(true)}>
                                        {dict.forgotPassword}
                                    </Button>
                                </div>
                                <Input id="partner-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handlePartnerLogin()} />
                                </div>
                                {loginError && <p className="text-xs text-destructive">{loginError}</p>}
                                <Button type="button" className="w-full" onClick={() => handlePartnerLogin()}>
                                    {dict.loginButton}
                                </Button>
                                <Separator />
                                <div className="space-y-2">
                                     <Button variant="outline" className="w-full" onClick={() => handleOAuthLogin('google')}>
                                        <GoogleIcon className="mr-2 h-5 w-5" /> Mit Google anmelden
                                    </Button>
                                    <Button variant="outline" className="w-full" onClick={() => handleOAuthLogin('apple')}>
                                        <AppleIcon className="mr-2 h-5 w-5" /> Mit Apple anmelden
                                    </Button>
                                </div>
                            </div>
                         </TabsContent>
                    </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
       <ContactModal isOpen={isContactModalOpen} onOpenChange={setIsContactModalOpen} />
       <ForgotPasswordModal 
            isOpen={isForgotPasswordOpen}
            onOpenChange={setIsForgotPasswordOpen}
            onPasswordReset={handlePasswordReset}
        />
        <PublicChatbot 
            isOpen={isChatbotOpen}
            onOpenChange={setIsChatbotOpen}
            initialMessage={initialChatbotMessage}
        />
    </>
  );
}
