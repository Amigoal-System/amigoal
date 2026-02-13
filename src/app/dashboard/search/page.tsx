
'use client';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Suchergebnisse</h1>
             <Card>
                <CardHeader>
                    <CardTitle>Suche nach: "{query}"</CardTitle>
                    <CardDescription>
                       Hier werden bald die Suchergebnisse aus der gesamten App angezeigt.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Placeholder for search results */}
                </CardContent>
            </Card>
        </div>
    )
}
