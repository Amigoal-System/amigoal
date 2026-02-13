
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalClose,
  ModalFooter,
} from '@/components/ui/animated-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, Share2, FileText, X, Edit, Trash2, FileDown, Plus, Pencil, Users, TrendingUp, DollarSign, Mail, Copy, AlertCircle, Sparkles, Loader2, CheckCircle, GripVertical, UserCog, Handshake, Archive, Save, Key, RefreshCcw, Check, Building } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent as SubDialogContent,
  DialogFooter as SubDialogFooter
} from '@/components/ui/dialog';
import { Label } from './ui/label';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartXAxis,
  ChartYAxis,
  ChartBar,
} from "@/components/ui/chart"
import { Bar, BarChart as RechartsBarChart, Pie, PieChart, Sector, Cell } from 'recharts';


import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { TwintIcon, QrCodeIcon } from './icons';
import { EmailComposerModal } from './ui/email-composer-modal';
import { AnimatedCard, CardBody as AnimatedCardBody, CardTitle as AnimatedCardTitle, CardDescription as AnimatedCardDescription, CardVisual, Visual3 } from './ui/animated-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import type { DunningLevel } from '@/lib/types/dunning';
import { defaultSaasDunningLevels } from '@/lib/types/dunning';
import { ClubDunningPDF } from './ui/ClubDunningPDF';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from './ui/date-picker';
import { cn, generateSwissQrCodeData } from '@/lib/utils';
import { useMembers } from '@/hooks/useMembers';
import { useTeams } from '@/hooks/useTeams';
import { useTeam } from '@/hooks/use-team';
import { sendPasswordResetEmailForClubAdmin, setOneTimePasswordForClubAdmin } from '@/ai/flows/clubs';
import { OneTimePasswordDialog } from './ui/one-time-password-dialog';
import { useSponsorTypes } from '@/hooks/useSponsorTypes';
import { Combobox } from './ui/combobox';
import { useRouter, useParams } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { useAmigoalContracts } from '@/hooks/useAmigoalContracts';
import type { AmigoalContract } from '@/ai/flows/amigoalContracts.types';

const OnboardingChecklist = ({ tasks, onTaskToggle, isEditing }) => (
    <Card>
        <CardHeader>
            <CardTitle>Onboarding-Checkliste</CardTitle>
            <CardDescription>Status des Onboarding-Prozesses für diesen Verein.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                {tasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                        <Checkbox
                            id={`onboarding-task-${task.id}`}
                            checked={task.isCompleted}
                            onCheckedChange={() => isEditing && onTaskToggle(task.id)}
                            disabled={!isEditing}
                        />
                        <Label htmlFor={`onboarding-task-${task.id}`} className={cn(task.isCompleted && "line-through text-muted-foreground", !isEditing && 'cursor-default')}>
                            {task.label}
                        </Label>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
);

const financialData = [
    { month: "Jan", revenue: 99, projected: 120 }, { month: "Feb", revenue: 99, projected: 120 },
    { month: "Mar", revenue: 124, projected: 150 }, { month: "Apr", revenue: 124, projected: 150 },
    { month: "May", revenue: 149, projected: 180 }, { month: "Jun", revenue: 149, projected: 180 },
];

const mockUsers = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    avatar: `https://placehold.co/40x40.png?text=U${i+1}`,
    role: i % 5 === 0 ? 'Coach' : 'Player',
    status: i % 3 === 0 ? 'Inactive' : 'Active'
}));

const subscribedModulesMock = [
  { id: 'website-builder', name: 'Website Builder', included: true },
  { id: 'blog', name: 'Blog', included: false },
  { id: 'advanced-analytics', name: 'Advanced Analytics', included: false },
  { id: 'ai-analysis', name: 'KI-Spielanalyse', included: false },
];

const memberGrowthData = [
  { month: "Jan", users: 280 }, { month: "Feb", users: 295 },
  { month: "Mar", users: 310 }, { month: "Apr", users: 320 },
  { month: "May", users: 345 }, { month: "Jun", users: 360 },
];


const financialConfig = {
    revenue: { label: "Umsatz", color: "hsl(var(--chart-2))" },
    projected: { label: "Prognose", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

const StatCard = ({ title, value, icon: Icon }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

const ShareOptions = ({ title, text, url, attachmentGenerator }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Share failed:", err);
          setOpen(true);
        }
      }
    } else {
      setOpen(true);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link kopiert",
        description: "Der Link wurde in Ihre Zwischenablage kopiert.",
      });
    } catch (err) {
      console.error("Copy failed:", err);
      toast({
        title: "Kopieren fehlgeschlagen",
        variant: "destructive",
      });
    }
  };
  
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="flex flex-col gap-2">
            <Button variant="ghost" size="sm" asChild>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <TwintIcon className="h-4 w-4" /> WhatsApp
              </a>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsEmailModalOpen(true)} className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> E-Mail
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCopyLink} className="flex items-center gap-2">
              <Copy className="h-4 w-4" /> Link kopieren
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <EmailComposerModal 
        isOpen={isEmailModalOpen}
        onOpenChange={setIsEmailModalOpen}
        initialSubject={title}
        initialBody={text}
        attachmentGenerator={attachmentGenerator}
      />
    </>
  );
};




export const UserListModal = ({ isOpen, onOpenChange, title, users }) => {
    const generateCSV = () => {
        const headers = ["ID", "Name", "Role", "Status"];
        let csvContent = headers.join(",") + "\r\n";
        users.forEach(user => {
            const row = [user.id, `"${user.name}`, user.role, user.status].join(",");
            csvContent += row + "\r\n";
        });
        return csvContent;
    };

    const handleDownloadCSV = () => {
        const csvContent = generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${title.replace(/ /g, '_')}_mitglieder.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        window.print();
    };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <SubDialogContent className="max-w-2xl printable-area">
        <DialogHeader className="no-print">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Avatar</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person portrait" />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'Active' ? 'default' : 'secondary'} className={user.status === 'Active' ? 'bg-green-500' : ''}>
                      {user.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <SubDialogFooter className="no-print">
            <div className='flex gap-2'>
                <Button variant="outline" size="icon" onClick={handleDownloadCSV}><FileDown className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" onClick={handlePrint}><Printer className="h-4 w-4" /></Button>
                <ShareOptions 
                    title={title} 
                    text={`Hier ist die Mitgliederliste für ${title}.`} 
                    url={typeof window !== 'undefined' ? window.location.href : ''}
                    attachmentGenerator={generateCSV}
                />
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </SubDialogFooter>
      </SubDialogContent>
    </Dialog>
  );
};

export const ClubDunningModal = ({ isOpen, onOpenChange, club }) => {
    const { toast } = useToast();
    const [dunningLevels, setDunningLevels] = useState<DunningLevel[]>([]);
    const [selectedLevel, setSelectedLevel] = useState<DunningLevel | null>(null);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    const pdfComponentRef = useRef<HTMLDivElement>(null);
    
    const handlePrint = useReactToPrint({
      content: () => pdfComponentRef.current,
    });
    
    const originalAmount = 99.00;
    
    const handleLevelChange = (levelId: string, levels: DunningLevel[]) => {
        const level = levels.find(l => l.id === levelId);
        if (level && club) {
            setSelectedLevel(level);
            
            const body = level.body
                .replace('{CLUB_MANAGER}', club.manager)
                .replace('{CLUB_NAME}', club.name)
                .replace('{FEE}', `CHF ${level.fee.toFixed(2)}`);

            setEmailSubject(level.subject);
            setEmailBody(body);
            
            const qrData = generateSwissQrCodeData(club, level);
            setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?data=${qrData}&size=128x128&format=svg`);
        }
    };

    useEffect(() => {
        if (isOpen && club) {
            const clubDunningLevels = defaultSaasDunningLevels;
            setDunningLevels(clubDunningLevels);
            if (clubDunningLevels.length > 0) {
                handleLevelChange(clubDunningLevels[0].id, clubDunningLevels);
            }
        }
    }, [isOpen, club]);
    
    const dunningFee = selectedLevel?.fee || 0;
    const newTotal = originalAmount + dunningFee;

    const handleAiAssist = async () => {
        if (!emailBody) return;
        setIsGenerating(true);
        // This is a placeholder for the actual AI call
        console.log("Generating email content with AI...");
        setTimeout(() => {
             setEmailBody("Dies ist ein KI-generierter, optimierter Mahntext. Bitte überprüfen Sie die Details und senden Sie die E-Mail.");
             setIsGenerating(false);
        }, 1500);
    };

    if (!club) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <SubDialogContent className="max-w-4xl p-0">
                 <DialogHeader className="p-6 pb-0">
                    <DialogTitle>
                        <div className="flex justify-between items-start">
                             <span className="text-2xl font-bold font-headline">Club-Mahnung senden</span>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <div className="flex">
                    <div className="w-1/2 p-6 pt-0 border-r">
                        <div className="space-y-4">
                             <div className="flex items-center justify-between">
                                <Label className="font-semibold">Mahnstufe</Label>
                                 <Select onValueChange={(value) => handleLevelChange(value, dunningLevels)} value={selectedLevel?.id}>
                                    <SelectTrigger className="w-[220px]">
                                        <SelectValue placeholder="Mahnstufe auswählen..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dunningLevels.map(level => (
                                            <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label>Betreff</Label>
                                <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Betreff der Mahnung"/>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Label>Nachricht</Label>
                                    <Button variant="outline" size="sm" onClick={handleAiAssist} disabled={isGenerating || !emailBody}>
                                        {isGenerating ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                                        KI-Assistent
                                    </Button>
                                </div>
                                <Textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} placeholder="Mahntext..." className="mt-2" rows={10}/>
                            </div>
                        </div>
                    </div>
                    <div className="w-1/2 bg-muted/30 p-6 flex flex-col justify-between">
                       <Card>
                         <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Rechnungsvorschau</CardTitle>
                            <div className="text-center p-1 rounded-md bg-red-100 dark:bg-red-900/50">
                                <p className="text-xs text-red-600 dark:text-red-300">Status</p>
                                <p className="font-bold text-red-600 dark:text-red-300">Überfällig</p>
                            </div>
                         </CardHeader>
                         <CardContent className="space-y-3 text-sm">
                            <div className="flex items-center gap-4">
                                {qrCodeUrl ? (
                                    <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24" />
                                ) : (
                                    <QrCodeIcon className="w-24 h-24 text-muted-foreground" />
                                )}
                                <div className="space-y-1 flex-1">
                                    <div className="flex justify-between">
                                       <span>Empfänger:</span>
                                       <span className="font-medium">{club.manager}</span>
                                    </div>
                                     <div className="flex justify-between">
                                       <span>Club:</span>
                                       <span className="font-medium">{club.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                       <span>Datum:</span>
                                       <span className="font-medium">{new Date().toLocaleDateString('de-CH')}</span>
                                    </div>
                                </div>
                            </div>
                             <Separator/>
                             <div className="space-y-2">
                                 <div className="flex justify-between">
                                    <span>SaaS-Abonnement:</span>
                                    <span>{`CHF ${originalAmount.toFixed(2)}`}</span>
                                 </div>
                                  <div className="flex justify-between">
                                    <span>Mahngebühr:</span>
                                    <span>{`CHF ${dunningFee.toFixed(2)}`}</span>
                                 </div>
                             </div>
                             <Separator/>
                             <div className="flex justify-between font-bold text-base">
                                 <span>Totalbetrag:</span>
                                 <span>{`CHF ${newTotal.toFixed(2)}`}</span>
                             </div>
                             <Separator/>
                             <div className="text-xs text-muted-foreground pt-2">
                                <p className="font-semibold mb-1">Nachrichtenvorschau:</p>
                                <p className="whitespace-pre-wrap line-clamp-3">{emailBody}</p>
                             </div>
                         </CardContent>
                       </Card>
                        <div className="flex gap-2 mt-6">
                            <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                            <Button variant="outline" className="w-full" onClick={handlePrint}>
                                <FileDown className="mr-2 h-4 w-4" />
                                Als PDF herunterladen
                            </Button>
                            <Button className="w-full bg-green-600 hover:bg-green-700">Senden</Button>
                        </div>
                    </div>
                </div>
                <div className="hidden">
                   {selectedLevel && <ClubDunningPDF ref={pdfComponentRef} club={club} dunningInfo={{...selectedLevel, body: emailBody, subject: emailSubject}}/>}
                </div>
            </SubDialogContent>
        </Dialog>
    )
}

const InfoItem = ({ label, value, isEditing, id, onChange, type = 'text', options = [] }: { label: string; value?: string | number | null; isEditing: boolean; id: string; onChange: (e: any) => void; type?: string; options?: {value: string, label: string}[] }) => {
    return (
        <div className='space-y-1'>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            {isEditing ? (
                type === 'select' ? (
                    <Select value={value?.toString() || ''} onValueChange={(val) => onChange({ target: { id, value: val } })}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {options.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                ) : type === 'combobox' ? (
                    <Combobox items={options} value={value as string || ''} onChange={(val) => onChange({ target: { id, value: val } })} placeholder="Land..." />
                ) : (
                    <Input id={id} type={type} value={value || ''} onChange={onChange} className="h-8" />
                )
            ) : (
                <p className="font-semibold text-sm h-8 flex items-center">{value || '-'}</p>
            )}
        </div>
    );
};




export const ClubDetailModal = ({ club, isOpen, onOpenChange, isEditingDefault = false, onSave, onStatusChange }) => {
    const { currentUserRole, lang } = useTeam();
    const { sponsorTypes } = useSponsorTypes();
    const { contracts, isLoading: isLoadingContracts } = useAmigoalContracts();

    const [isEditing, setIsEditing] = useState(isEditingDefault);
    const [formData, setFormData] = useState({ ...club, sponsorshipNeeds: club?.sponsorshipNeeds || [] });
    const [isUserListModalOpen, setIsUserListModalOpen] = useState(false);
    const [userListModalTitle, setUserListModalTitle] = useState('');
    const [userList, setUserList] = useState([]);
    const [isDunningModalOpen, setIsDunningModalOpen] = useState(false);
    const [oneTimePassword, setOneTimePassword] = useState('');
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [newSponsorshipNeed, setNewSponsorshipNeed] = useState('');
    const { members, isLoading: isLoadingMembers } = useMembers(club?.id);
    const { categorizedTeams, isLoading: isLoadingTeams } = useTeams(club?.id);
    const { toast } = useToast();
    const router = useRouter();

    const pdfComponentRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        content: () => pdfComponentRef.current,
    });
    
    const [onboardingTasks, setOnboardingTasks] = useState([
        { id: 1, label: 'Club-Admin erstellt & Zugangsdaten versendet', isCompleted: true },
        { id: 2, label: 'Basis-Module konfiguriert', isCompleted: true },
        { id: 3, label: 'Zahlungsmethode für SaaS-Abo hinterlegt', isCompleted: club?.paymentStatus === 'Paid' },
        { id: 4, label: 'Mannschaften erstellt', isCompleted: true },
        { id: 5, label: 'Spieler importiert', isCompleted: false },
        { id: 6, label: 'Willkommens-E-Mail mit Anleitungen gesendet', isCompleted: false },
    ]);
    
    const clubContract = useMemo(() => {
        return contracts.find(c => c.partnerId === club?.id);
    }, [contracts, club]);

    const handleTaskToggle = (taskId: number) => {
        setOnboardingTasks(currentTasks =>
            currentTasks.map(task => 
                task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
            )
        );
    };

    useEffect(() => {
        if (club) {
            setFormData({
                ...club,
                sponsorshipNeeds: club.sponsorshipNeeds || [],
            });
        }
    }, [club]);

    useEffect(() => {
        setIsEditing(isEditingDefault);
    }, [isEditingDefault, isOpen]);


    if (!club) return null;
    
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };
  
    const handleAddressChange = (e) => {
      const { id, value } = e.target;
      setFormData(prev => ({ ...prev, address: { ...(prev.address || {}), [id]: value } }));
  }

    const handleSave = () => {
        onSave(formData);
        setIsEditing(false);
    }
    
    const handleCancelClick = () => {
      if(club) {
        setFormData({
            ...club,
            sponsorshipNeeds: club.sponsorshipNeeds || [],
        });
        setIsEditing(false);
      } else {
        onOpenChange(false);
      }
    }
    
    const handleImpersonate = () => {
        const originalAdminEmail = localStorage.getItem('amigoal_email');
        if (originalAdminEmail) {
            localStorage.setItem('original_super_admin_email', originalAdminEmail);
        }
        localStorage.setItem('impersonated_email', formData.contactEmail);
        localStorage.setItem('amigoal_impersonated_club', formData.name);
        localStorage.setItem('amigoal_active_role', 'Club-Admin');
        localStorage.setItem('amigoal_login_identifier', formData.clubLoginUser);
        window.location.reload();
    };

    const handleSponsorshipNeedToggle = (need: string) => {
        if (!isEditing) return;
        setFormData(prev => {
            const currentNeeds = prev.sponsorshipNeeds || [];
            const newNeeds = currentNeeds.includes(need)
                ? currentNeeds.filter(n => n !== need)
                : [...currentNeeds, need];
            return { ...prev, sponsorshipNeeds: newNeeds };
        });
    };

    const handleAddNewSponsorshipNeed = () => {
        if (newSponsorshipNeed.trim() && !formData.sponsorshipNeeds.includes(newSponsorshipNeed.trim())) {
            setFormData(prev => ({...prev, sponsorshipNeeds: [...prev.sponsorshipNeeds, newSponsorshipNeed.trim()]}));
            setNewSponsorshipNeed('');
        }
    };

    const handleSendResetLink = async () => {
        if (!formData.contactEmail) return;
        try {
            await sendPasswordResetEmailForClubAdmin(formData.contactEmail);
            toast({ title: 'Reset-Link gesendet', description: `Ein Link zum Zurücksetzen wurde an ${formData.contactEmail} gesendet.` });
        } catch (e) {
            toast({ title: 'Fehler', description: (e as Error).message, variant: 'destructive' });
        }
    };

    const handleCreateOneTimePassword = async () => {
        if (!formData.contactEmail) return;
        try {
            const tempPassword = await setOneTimePasswordForClubAdmin(formData.contactEmail);
            setOneTimePassword(tempPassword);
            setIsPasswordModalOpen(true);
        } catch (e) {
            toast({ title: 'Fehler', description: (e as Error).message, variant: 'destructive' });
        }
    };
    
    const coachCount = useMemo(() => members.filter(m => m.roles.includes('Trainer')).length, [members]);
    const playerCount = useMemo(() => members.filter(m => m.roles.includes('Spieler')).length, [members]);
    const teamCount = useMemo(() => Object.values(categorizedTeams).flat().length, [categorizedTeams]);


    const FinancialTabContent = ({ club, isEditing, onChange }) => {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Amigoal Abonnement</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <InfoItem label="Paket" value={club.package} isEditing={isEditing} id="package" onChange={onChange} />
                        <InfoItem label="Letzte Zahlung" value={new Date(new Date(club.contractEnd).setFullYear(new Date(club.contractEnd).getFullYear() -1)).toLocaleDateString('de-CH')} isEditing={false} id="lastPayment" onChange={() => {}} />
                        <InfoItem label="Nächste Zahlung" value={new Date(club.contractEnd).toLocaleDateString('de-CH')} isEditing={false} id="nextPayment" onChange={() => {}} />
                         <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                            {isEditing ? (
                                <Select value={club.paymentStatus} onValueChange={(val) => onChange({ target: { id: 'paymentStatus', value: val }})}>
                                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Paid">Bezahlt</SelectItem>
                                        <SelectItem value="Overdue">Überfällig</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div>
                                    <Badge variant={club.paymentStatus === 'Paid' ? 'default' : 'destructive'} className={club.paymentStatus === 'Paid' ? 'bg-green-500' : ''}>
                                        {club.paymentStatus}
                                    </Badge>
                                    {club.paymentStatus === 'Overdue' && (
                                        <Button size="xs" variant="ghost" className="ml-2 h-auto p-1" onClick={() => setIsDunningModalOpen(true)}>Mahnung</Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    };
    
    const getContractStatusBadge = (status: AmigoalContract['status']) => {
        switch(status) {
            case 'Active': return <Badge className="bg-green-500">Aktiv</Badge>;
            case 'Expired': return <Badge variant="secondary">Abgelaufen</Badge>;
            case 'Terminated': return <Badge variant="destructive">Gekündigt</Badge>;
            case 'Draft': return <Badge variant="outline">Entwurf</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };


    return (
        <>
            <Modal open={isOpen} onOpenChange={onOpenChange}>
                <ModalBody>
                     <ModalContent>
                        <div className="p-8 max-w-5xl mx-auto bg-background">
                             <div className="flex justify-between items-start mb-6">
                                <h2 className="text-2xl font-bold font-headline">Club "{formData.name}" - Details</h2>
                                <div className="flex gap-2 no-print">
                                    <Button variant="ghost" size="icon" disabled><FileDown className="h-5 w-5" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => {}}><Printer className="h-5 w-5" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => {}}><FileText className="h-5 w-5" /></Button>
                                    <ShareOptions title={`Club Details: ${formData.name}`} text={`Hier sind die Details für den Club ${formData.name}.`} url={typeof window !== 'undefined' ? window.location.href : ''} attachmentGenerator={() => 'This is a test attachment'}/>
                                    <ModalClose asChild>
                                        <Button variant="ghost" size="icon"><X/></Button>
                                    </ModalClose>
                                </div>
                            </div>
                            
                            <Card className="mb-6">
                                <CardContent className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    <InfoItem label="Club Name" id="name" value={formData.name} isEditing={isEditing} onChange={handleInputChange} />
                                    <InfoItem label="Club Manager" id="manager" value={formData.manager} isEditing={isEditing} onChange={handleInputChange} />
                                    <InfoItem label="Login-Benutzer" id="clubLoginUser" value={formData.clubLoginUser} isEditing={isEditing} onChange={handleInputChange} />
                                    <InfoItem label="Kontakt E-Mail" id="contactEmail" value={formData.contactEmail} isEditing={isEditing} onChange={handleInputChange} />
                                    <InfoItem label="Telefon" id="phone" value={formData.phone} isEditing={isEditing} onChange={handleInputChange} />
                                </CardContent>
                            </Card>

                            <Tabs defaultValue="overview" className="w-full">
                                <TabsList className="grid w-full grid-cols-5 no-print">
                                    <TabsTrigger value="overview">Übersicht</TabsTrigger>
                                    <TabsTrigger value="teams">Mannschaften</TabsTrigger>
                                    <TabsTrigger value="finance">Finanzen</TabsTrigger>
                                     <TabsTrigger value="contract">SaaS-Vertrag</TabsTrigger>
                                    <TabsTrigger value="sponsoring">Sponsoring</TabsTrigger>
                                </TabsList>
                                <TabsContent value="overview" className="mt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                        <StatCard title="Mannschaften" value={isLoadingTeams ? '...' : teamCount} icon={Users} />
                                        <StatCard title="Trainer & Staff" value={isLoadingMembers ? '...' : coachCount} icon={Users} />
                                        <StatCard title="Spieler" value={isLoadingMembers ? '...' : playerCount} icon={Users} />
                                        <StatCard title="Gesamtmitglieder" value={isLoadingMembers ? '...' : members.length} icon={Users} />
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                        <OnboardingChecklist tasks={onboardingTasks} onTaskToggle={handleTaskToggle} isEditing={isEditing && currentUserRole === 'Super-Admin'}/>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Abonnierte Module</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <ul className="space-y-2">
                                                    {subscribedModulesMock.map((module) => (
                                                        <li key={module.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                                                            <div className="font-medium flex items-center gap-2">
                                                                <CheckCircle className="h-4 w-4 text-primary" />
                                                                {module.name}
                                                            </div>
                                                            <Badge variant={module.included ? "secondary" : "default"}>
                                                                {module.included ? 'Inklusive' : 'Abonniert'}
                                                            </Badge>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                        </Card>
                                         {currentUserRole === 'Super-Admin' && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-base flex items-center gap-2"><Key/>Admin-Passwort</CardTitle>
                                                </CardHeader>
                                                <CardContent className="flex flex-col gap-2">
                                                    <Button variant="outline" size="sm" onClick={handleSendResetLink}>Reset-Link senden</Button>
                                                    <Button variant="outline" size="sm" onClick={handleCreateOneTimePassword}>Einmalpasswort erstellen</Button>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                </TabsContent>
                                <TabsContent value="teams">
                                    <Accordion type="multiple" className="w-full">
                                        {Object.entries(categorizedTeams).map(([categoryName, teams]) => (
                                            <AccordionItem value={categoryName} key={categoryName}>
                                                <AccordionTrigger className="text-lg font-semibold">{categoryName}</AccordionTrigger>
                                                <AccordionContent className="p-1">
                                                    <div className="space-y-2">
                                                        {(teams as any[]).map(team => (
                                                            <Card key={team.id}>
                                                                <CardHeader className="p-4">
                                                                    <CardTitle className="text-base">{team.name}</CardTitle>
                                                                    <CardDescription>
                                                                        Liga: {team.liga} | Trainer: {team.trainer} | Mitglieder: {team.members}
                                                                    </CardDescription>
                                                                </CardHeader>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </TabsContent>
                                <TabsContent value="finance">
                                  <FinancialTabContent club={formData} isEditing={isEditing} onChange={handleInputChange} />
                                </TabsContent>
                                <TabsContent value="contract">
                                    {isLoadingContracts ? <p>Lade Vertrag...</p> : clubContract ? (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Vertragsdetails</CardTitle>
                                            </CardHeader>
                                            <CardContent className="grid grid-cols-2 gap-4 text-sm">
                                                <InfoItem label="Vertragsart" value={clubContract.contractType} isEditing={false} id="contractType" onChange={() => {}} />
                                                <InfoItem label="Status" value={clubContract.status} isEditing={false} id="contractStatus" onChange={() => {}} />
                                                <InfoItem label="Startdatum" value={new Date(clubContract.startDate).toLocaleDateString('de-CH')} isEditing={false} id="startDate" onChange={() => {}} />
                                                <InfoItem label="Enddatum" value={new Date(clubContract.endDate).toLocaleDateString('de-CH')} isEditing={false} id="endDate" onChange={() => {}} />
                                                <InfoItem label="Monatsgebühr" value={`CHF ${clubContract.monthlyFee?.toFixed(2)}`} isEditing={false} id="monthlyFee" onChange={() => {}} />
                                                <InfoItem label="Notizen" value={clubContract.notes} isEditing={false} id="notes" onChange={() => {}} />
                                            </CardContent>
                                        </Card>
                                    ) : <p>Kein Vertrag für diesen Club gefunden.</p>}
                                </TabsContent>
                                <TabsContent value="sponsoring" className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="seekingSponsorship" checked={formData.seekingSponsorship} onCheckedChange={(checked) => isEditing && setFormData(prev => ({...prev, seekingSponsorship: !!checked}))} disabled={!isEditing} />
                                        <label htmlFor="seekingSponsorship" className="text-sm font-medium leading-none">
                                            Dieser Verein ist aktiv auf Sponsorensuche
                                        </label>
                                    </div>
                                     <div className="space-y-2">
                                        <Label>Gesuchte Sponsoring-Arten</Label>
                                        <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
                                            {sponsorTypes.map(type => {
                                                const isSelected = formData.sponsorshipNeeds.includes(type.name);
                                                return (
                                                <Button 
                                                    key={type.name}
                                                    type="button"
                                                    variant={isSelected ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => isEditing && handleSponsorshipNeedToggle(type.name)}
                                                    className={!isEditing ? 'pointer-events-none' : ''}
                                                    style={isSelected ? { backgroundColor: type.color, color: 'white', borderColor: type.color } : {}}
                                                >
                                                    {type.name}
                                                </Button>
                                            )})}
                                             {formData.sponsorshipNeeds.filter(need => !sponsorTypes.some(st => st.name === need)).map(customNeed => (
                                                <Badge key={customNeed} variant="secondary" className="flex items-center gap-1">
                                                    {customNeed}
                                                    {isEditing && <button onClick={() => handleSponsorshipNeedToggle(customNeed)}><X className="h-3 w-3"/></button>}
                                                </Badge>
                                            ))}
                                        </div>
                                         {isEditing && (
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Eigene Art hinzufügen..."
                                                    value={newSponsorshipNeed}
                                                    onChange={(e) => setNewSponsorshipNeed(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleAddNewSponsorshipNeed()}
                                                    className="h-8"
                                                />
                                                <Button type="button" size="sm" onClick={handleAddNewSponsorshipNeed} disabled={!newSponsorshipNeed.trim()}>Hinzufügen</Button>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>

                        </div>
                     </ModalContent>
                      <ModalFooter className="modal-footer-sticky bg-background p-4 border-t no-print">
                        <div className="w-full flex justify-between">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" disabled={!isEditing}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Club löschen/archivieren
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Aktion für {club.name}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Wählen Sie eine Aktion. Das Archivieren behält die Daten, deaktiviert aber den Club. Das Löschen ist endgültig.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                     <Button variant="secondary" onClick={() => onStatusChange(club.id, 'suspended')}>Sperren</Button>
                                    <Button variant="destructive" onClick={() => onStatusChange(club.id, 'archived')}>Archivieren</Button>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <div className="flex gap-2">
                                {currentUserRole === 'Super-Admin' && (
                                    <Button variant="secondary" onClick={handleImpersonate} disabled={isEditing}>
                                        <UserCog className="mr-2 h-4 w-4" /> Als Admin anmelden
                                    </Button>
                                )}
                                {isEditing ? (
                                    <>
                                        <Button variant="outline" onClick={handleCancelClick}>Abbrechen</Button>
                                        <Button onClick={handleSave}><Save className="mr-2 h-4 w-4"/> Speichern</Button>
                                    </>
                                ) : (
                                    (currentUserRole === 'Super-Admin') && (
                                    <Button onClick={() => setIsEditing(true)}>
                                        <Edit className="mr-2 h-4 w-4" /> Bearbeiten
                                    </Button>
                                    )
                                )}
                            </div>
                        </div>
                    </ModalFooter>
                </ModalBody>
            </Modal>
            <UserListModal 
              isOpen={isUserListModalOpen}
              onOpenChange={setIsUserListModalOpen}
              title={userListModalTitle}
              users={userList}
            />
            {isDunningModalOpen && (
                <ClubDunningModal
                    isOpen={isDunningModalOpen}
                    onOpenChange={setIsDunningModalOpen}
                    club={formData}
                />
            )}
             <OneTimePasswordDialog
                isOpen={isPasswordModalOpen}
                onOpenChange={setIsPasswordModalOpen}
                password={oneTimePassword}
            />
        </>
    );
};
