
'use client';

import { ShieldAlert } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "./card";

export const NotAuthorized = () => {
    return (
        <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto bg-destructive/10 text-destructive w-fit p-4 rounded-full mb-4">
                        <ShieldAlert className="h-10 w-10" />
                    </div>
                    <CardTitle>Kein Zugriff</CardTitle>
                    <CardDescription>
                        Sie haben nicht die erforderlichen Berechtigungen, um auf diese Seite zuzugreifen.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    )
}
