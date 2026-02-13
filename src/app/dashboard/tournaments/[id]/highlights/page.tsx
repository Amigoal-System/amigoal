
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Check, Upload, X } from 'lucide-react';
import React, { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

const mockUploads = [
    { id: 1, type: 'image', url: 'https://placehold.co/600x400.png', dataAiHint: 'soccer goal celebration', user: 'Fan123', status: 'pending' },
    { id: 2, type: 'image', url: 'https://placehold.co/600x400.png', dataAiHint: 'fans cheering', user: 'ZuschauerX', status: 'pending' },
    { id: 3, type: 'video', url: 'https://placehold.co/600x400.png', dataAiHint: 'soccer skill move', user: 'Papa_von_Tim', status: 'approved' },
    { id: 4, type: 'image', url: 'https://placehold.co/600x400.png', dataAiHint: 'team huddle', user: 'Fan123', status: 'rejected' },
    { id: 5, type: 'image', url: 'https://placehold.co/600x400.png', dataAiHint: 'child playing soccer', user: 'Mama_von_Anna', status: 'pending' },
];

export default function TournamentHighlightsPage() {
    const params = useParams();
    const tournamentId = params.id;
    const lang = params.lang;
    const [uploads, setUploads] = useState(mockUploads);
    
    const handleStatusChange = (id: number, status: 'approved' | 'rejected') => {
        setUploads(prev => prev.map(u => u.id === id ? { ...u, status } : u));
    }

    const pendingUploads = uploads.filter(u => u.status === 'pending');

    return (
        <div className="space-y-6">
            <Button asChild variant="ghost">
                <Link href={`/${lang}/dashboard/tournaments/${tournamentId}`}>
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Zurück zum Turnier-Cockpit
                </Link>
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>Highlight-Verwaltung</CardTitle>
                    <CardDescription>
                       Geben Sie hier von Zuschauern hochgeladene Fotos und Videos für die öffentliche Highlight-Seite frei.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {pendingUploads.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pendingUploads.map(upload => (
                                <Card key={upload.id}>
                                    <CardContent className="p-0">
                                        <div className="aspect-video">
                                             <Image src={upload.url} alt={`Upload von ${upload.user}`} width={600} height={400} className="w-full h-full object-cover rounded-t-lg" data-ai-hint={upload.dataAiHint}/>
                                        </div>
                                        <p className="text-xs text-muted-foreground p-2">Eingereicht von: {upload.user}</p>
                                    </CardContent>
                                    <CardFooter className="flex justify-between p-2">
                                        <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => handleStatusChange(upload.id, 'rejected')}>
                                            <X className="mr-1.5 h-4 w-4" /> Ablehnen
                                        </Button>
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange(upload.id, 'approved')}>
                                            <Check className="mr-1.5 h-4 w-4" /> Freigeben
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>Keine neuen Einreichungen zur Prüfung vorhanden.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
