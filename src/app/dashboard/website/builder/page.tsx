
'use client';

import React from 'react';
import { PlateEditor } from '@/components/plate-ui/plate-editor';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTeam } from '@/hooks/use-team';

export default function WebsiteBuilderPage() {
  const searchParams = useSearchParams();
  const page = searchParams.get('page') || 'Startseite';
  const { toast } = useToast();
  const { currentUserRole } = useTeam();

  const handleSave = () => {
    toast({
      title: "Inhalt gespeichert!",
      description: `Die Änderungen für die Seite "${page}" wurden gespeichert.`
    });
  };

  // This is the builder for individual CLUB websites.
  if (currentUserRole !== 'Club-Admin' && currentUserRole !== 'Manager' && currentUserRole !== 'Board') {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Kein Zugriff</CardTitle>
                <CardDescription>Diese Funktion ist nur für Club-Administratoren verfügbar.</CardDescription>
            </CardHeader>
        </Card>
    );
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Club-Webseite bearbeiten: {page}</CardTitle>
            <CardDescription>
                Passen Sie hier den Inhalt für die ausgewählte Seite Ihrer Club-Webseite an.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="rounded-lg border bg-background shadow-sm">
                <PlateEditor />
            </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4"/>
                Speichern
            </Button>
        </CardFooter>
    </Card>
  );
}
