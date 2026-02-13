
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function TournamentFinancesPage() {
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
                    <CardTitle>Finanzübersicht des Turniers</CardTitle>
                    <CardDescription>
                        Hier sehen Sie alle Einnahmen und Ausgaben im Detail.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Coming Soon: Detaillierte Finanzstatistiken, Übersicht der Startgelder und Einnahmen aus dem POS.</p>
                </CardContent>
            </Card>
        </div>
    );
}
