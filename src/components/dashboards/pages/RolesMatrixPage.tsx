
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { rolesConfig, moduleOrder, moduleDescriptions } from '@/lib/roles';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RolesMatrixPage() {
    const [currentRoles, setCurrentRoles] = useState(rolesConfig);
    const { toast } = useToast();

    const handlePermissionChange = (role: string, module: string, permission: string) => {
        const moduleIndex = moduleOrder.indexOf(module);
        if (moduleIndex === -1) return;

        setCurrentRoles(prev => {
            const newRoleConfig = { ...prev[role] };
            newRoleConfig[moduleIndex] = permission;
            return {
                ...prev,
                [role]: newRoleConfig
            };
        });
    };
    
    const handleSaveChanges = () => {
        // In a real app, this would call a flow to save the config to the backend.
        console.log("Saving new roles config:", currentRoles);
        toast({
            title: "Gespeichert!",
            description: "Die Rollen- und Rechtekonfiguration wurde aktualisiert."
        })
    }

    const getBadgeVariant = (permission: string) => {
        switch (permission) {
            case 'Voll': return 'default';
            case 'Limit': return 'secondary';
            case 'Kein': return 'destructive';
            default: return 'outline';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Rollen & Rechte Matrix</CardTitle>
                <CardDescription>
                    Verwalten Sie hier die Zugriffsrechte für jede Benutzerrolle auf die verschiedenen Module der Plattform.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="sticky left-0 bg-card z-10 w-48">Modul</TableHead>
                                {Object.keys(currentRoles).map(role => (
                                    <TableHead key={role} className="text-center">{role}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {moduleOrder.map(moduleName => (
                                <TableRow key={moduleName}>
                                    <TableCell className="font-medium sticky left-0 bg-card z-10">
                                        <p>{moduleName}</p>
                                        <p className="text-xs text-muted-foreground">{moduleDescriptions[moduleName] || ''}</p>
                                    </TableCell>
                                    {Object.keys(currentRoles).map(role => {
                                        const moduleIndex = moduleOrder.indexOf(moduleName);
                                        const permission = currentRoles[role]?.[moduleIndex] || 'Kein';

                                        return (
                                            <TableCell key={`${moduleName}-${role}`} className="text-center">
                                                <Select value={permission} onValueChange={(value) => handlePermissionChange(role, moduleName, value)}>
                                                    <SelectTrigger className="w-24 mx-auto">
                                                         <SelectValue>
                                                            <Badge variant={getBadgeVariant(permission)}>{permission}</Badge>
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Voll">Voll</SelectItem>
                                                        <SelectItem value="Limit">Limit</SelectItem>
                                                        <SelectItem value="Kein">Kein</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
             <CardFooter className="flex justify-end">
                <Button onClick={handleSaveChanges}><Save className="mr-2 h-4 w-4"/> Änderungen speichern</Button>
            </CardFooter>
        </Card>
    );
}
