
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getTestDocuments } from '@/ai/flows/testFlow';

const COOKIE_NAME = 'amigoal_maintenance_mode';

const serviceList = [
    { id: 'firebase-auth', name: 'Firebase Auth & Server' },
    { id: 'firestore', name: 'Firestore Database' },
    { id: 'genkit', name: 'Genkit AI Flows' },
];

type ServiceStatus = 'Operational' | 'Checking' | 'Error';


export default function StatusPage() {
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const [statuses, setStatuses] = useState<Record<string, ServiceStatus>>({
        'firebase-auth': 'Operational',
        'firestore': 'Operational',
        'genkit': 'Operational',
    });

    const { toast } = useToast();

    useEffect(() => {
        const cookieValue = document.cookie.split('; ').find(row => row.startsWith(`${COOKIE_NAME}=`));
        setIsMaintenanceMode(cookieValue ? cookieValue.split('=')[1] === 'true' : false);
    }, []);

    const handleMaintenanceToggle = (enabled: boolean) => {
        setIsMaintenanceMode(enabled);
        document.cookie = `${COOKIE_NAME}=${enabled}; path=/; max-age=${enabled ? 86400 : 0}`; // Expires in 1 day or immediately
        toast({
            title: `Wartungsmodus ${enabled ? 'aktiviert' : 'deaktiviert'}`,
            description: enabled ? 'Besucher werden nun auf die Wartungsseite umgeleitet.' : 'Ihre Seite ist wieder für alle Besucher erreichbar.',
        });
    };

    const handleCheckStatus = async () => {
        setIsCheckingStatus(true);
        const checkingState: Record<string, ServiceStatus> = {};
        serviceList.forEach(service => {
            checkingState[service.id] = 'Checking';
        });
        setStatuses(checkingState);

        try {
            // This flow attempts to read from Firestore. If it succeeds, we know the whole stack is working.
            await getTestDocuments();
            
            const operationalState: Record<string, ServiceStatus> = {};
            serviceList.forEach(service => {
                operationalState[service.id] = 'Operational';
            });
            setStatuses(operationalState);

            toast({
                title: "Systemstatus aktualisiert",
                description: "Alle Dienste sind betriebsbereit.",
            });
        } catch (error: any) {
            console.error("System status check failed:", error);
            const errorState: Record<string, ServiceStatus> = {};
            serviceList.forEach(service => {
                errorState[service.id] = 'Error';
            });
            setStatuses(errorState);

            toast({
                title: "Fehler bei der Systemprüfung",
                description: "Eine oder mehrere Komponenten antworten nicht. Prüfen Sie die Konsole für Details.",
                variant: "destructive",
            });
        } finally {
            setIsCheckingStatus(false);
        }
    };

    const getStatusBadge = (status: ServiceStatus) => {
        switch(status) {
            case 'Operational':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-200"><CheckCircle className="mr-1 h-3 w-3"/>{status}</Badge>;
            case 'Error':
                return <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3"/>{status}</Badge>;
            case 'Checking':
                return <Badge variant="outline" className="animate-pulse"><Loader2 className="mr-1 h-3 w-3 animate-spin"/>{status}...</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Überprüfen Sie den Status der Systemdienste und verwalten Sie den Wartungsmodus.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {serviceList.map(service => (
                     <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <p>{service.name}</p>
                        {getStatusBadge(statuses[service.id])}
                    </div>
                 ))}
                 <div className="flex items-center space-x-2 pt-4 border-t">
                    <Switch 
                        id="maintenance-mode" 
                        checked={isMaintenanceMode}
                        onCheckedChange={handleMaintenanceToggle}
                    />
                    <Label htmlFor="maintenance-mode">Wartungsmodus aktivieren</Label>
                </div>
            </CardContent>
            <CardFooter>
                 <Button onClick={handleCheckStatus} disabled={isCheckingStatus}>
                    {isCheckingStatus ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Status erneut prüfen
                </Button>
            </CardFooter>
        </Card>
    );
}
