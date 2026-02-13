
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function TournamentSettingsPage() {
    const params = useParams();
    const tournamentId = params.id;
    const lang = params.lang;

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
                    <CardTitle>Turnier-Einstellungen</CardTitle>
                    <CardDescription>
                        Bearbeiten Sie hier die Stammdaten und Konfigurationen Ihres Turniers.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Coming Soon: Formular zur Bearbeitung von Turniername, Datum, Regeln, etc.</p>
                </CardContent>
            </Card>
        </div>
    );
}
