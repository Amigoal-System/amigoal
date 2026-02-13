
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDoc, doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { AmigoalStaff } from '@/ai/flows/amigoalStaff.types';
import { Loader2, ArrowLeft, Mail, Phone, Home, Briefcase, FileText, Calendar, Hourglass } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Timeline, TimelineItem, TimelineConnector, TimelineHeader, TimelineIcon, TimelineTitle, TimelineBody } from '@/components/ui/timeline';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import Image from 'next/image';

const StatCard = ({ title, value, icon, className = '' }) => (
    <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
)

export default function StaffDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const db = useFirestore();
    const [staffMember, setStaffMember] = useState<AmigoalStaff | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStaffMember = async () => {
            if (!db || !id) return;
            setIsLoading(true);
            try {
                const docRef = doc(db, "amigoalStaff", id as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setStaffMember({ id: docSnap.id, ...docSnap.data() } as AmigoalStaff);
                } else {
                    console.log("No such document!");
                }
            } catch(e) {
                console.error("Error fetching document:", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStaffMember();
    }, [id, db]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8"/></div>;
    }

    if (!staffMember) {
        return <div>Mitarbeiter nicht gefunden.</div>;
    }

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4"/> Zurück zur Übersicht
            </Button>
            <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={staffMember.avatar || `https://placehold.co/128x128.png?text=${staffMember.name.split(' ').map(n=>n[0]).join('')}`} />
                    <AvatarFallback>{staffMember.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-3xl font-bold font-headline">{staffMember.name}</h1>
                    <p className="text-xl text-muted-foreground">{staffMember.position}</p>
                    <div className="flex gap-2 mt-2">
                        {staffMember.roles.map(role => <Badge key={role}>{role}</Badge>)}
                    </div>
                </div>
            </div>
            
            <Tabs defaultValue="overview">
                <TabsList>
                    <TabsTrigger value="overview">Übersicht</TabsTrigger>
                    <TabsTrigger value="data">Stammdaten</TabsTrigger>
                    <TabsTrigger value="performance">Leistungen & Stunden</TabsTrigger>
                    <TabsTrigger value="requests">Anfragen</TabsTrigger>
                    <TabsTrigger value="history">Verlauf</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-4">
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard title="Projekte" value="5" icon={<Briefcase/>}/>
                        <StatCard title="Erfasste Stunden (Monat)" value="128" icon={<Hourglass/>}/>
                        <StatCard title="Offene Spesen" value="CHF 250" icon={<FileText/>}/>
                        <StatCard title="Verbleibende Ferientage" value="18" icon={<Calendar/>}/>
                    </div>
                </TabsContent>
                <TabsContent value="data" className="mt-4">
                    <Card>
                        <CardHeader><CardTitle>Stammdaten</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6 text-sm">
                            <div className="space-y-1"><p className="text-muted-foreground">E-Mail</p><p>{staffMember.email}</p></div>
                            <div className="space-y-1"><p className="text-muted-foreground">Telefon</p><p>{staffMember.phone}</p></div>
                            <div className="space-y-1"><p className="text-muted-foreground">Geburtstag</p><p>{staffMember.birthdate}</p></div>
                            <div className="space-y-1 col-span-2"><p className="text-muted-foreground">Adresse</p><p>{`${staffMember.address?.street}, ${staffMember.address?.zip} ${staffMember.address?.city}`}</p></div>
                            <div className="space-y-1"><p className="text-muted-foreground">AHV-Nummer</p><p>{staffMember.ahvNumber}</p></div>
                            <div className="space-y-1"><p className="text-muted-foreground">Mitarbeiternummer</p><p>{staffMember.employment?.mitarbeiterNummer || '-'}</p></div>
                            <div className="space-y-1"><p className="text-muted-foreground">Anstellungsart</p><p>{staffMember.employment?.anstellungsart || '-'}</p></div>
                            <div className="space-y-1"><p className="text-muted-foreground">Eintrittsdatum</p><p>{staffMember.employment?.entryDate}</p></div>
                            <div className="space-y-1"><p className="text-muted-foreground">Pensum</p><p>{staffMember.employment?.workload}%</p></div>
                            <div className="space-y-1"><p className="text-muted-foreground">Lohn</p><p>CHF {staffMember.employment?.salary}</p></div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="performance" className="mt-4">
                    <Card>
                        <CardHeader><CardTitle>Leistungen & Stunden</CardTitle></CardHeader>
                        <CardContent><p>Platzhalter für Zeiterfassung und Leistungsbeurteilungen.</p></CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="requests" className="mt-4">
                     <Card>
                        <CardHeader><CardTitle>Anfragen</CardTitle></CardHeader>
                        <CardContent><p>Platzhalter für Ferien-, Spesen- und andere Anfragen.</p></CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="history" className="mt-4">
                     <Card>
                        <CardHeader><CardTitle>Änderungsverlauf</CardTitle></CardHeader>
                        <CardContent>
                            <Timeline>
                                {staffMember.history?.map((item, index) => (
                                    <TimelineItem key={index}>
                                        <TimelineConnector />
                                        <TimelineHeader>
                                            <TimelineIcon>
                                                <div className="w-3 h-3 rounded-full bg-primary" />
                                            </TimelineIcon>
                                            <TimelineTitle>{item.action}</TimelineTitle>
                                        </TimelineHeader>
                                        <TimelineBody>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(item.date), "dd. MMMM yyyy, HH:mm", { locale: de })} von {item.author}
                                            </p>
                                            <p className="text-sm">{item.details}</p>
                                        </TimelineBody>
                                    </TimelineItem>
                                ))}
                            </Timeline>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
