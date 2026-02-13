
'use client';
import React from 'react';
import { AmigoalLogo, QrCodeIcon } from '../icons';

export const PlayerContractPDF = React.forwardRef(({ contract }, ref) => {
    const today = new Date();
    
    if (!contract) return null;

    const formatCurrency = (value: number) => {
        return value.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div ref={ref} className="bg-white text-black p-12 font-sans text-xs">
            <header className="flex justify-between items-center border-b-2 border-black pb-4">
                <div>
                    <h1 className="text-2xl font-bold">SPIELERVERTRAG</h1>
                    <p>Saison {contract.name.split(' ')[1]}</p>
                </div>
                <AmigoalLogo className="h-20 w-20 text-black" />
            </header>

            <main className="my-8">
                <h2 className="font-bold text-base mb-4">Zwischen</h2>
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <p className="font-semibold">Dem Verein</p>
                        <p>FC Amigoal</p>
                        <p>Musterstrasse 123</p>
                        <p>8000 Zürich</p>
                    </div>
                    <div>
                        <p className="font-semibold">Und dem Spieler</p>
                        <p>Lionel Messi</p>
                        <p>Beispielweg 4</p>
                        <p>8001 Zürich</p>
                    </div>
                </div>

                <h2 className="font-bold text-base mb-4">Gegenstand des Vertrags</h2>
                <p className="mb-4">
                    Dieser Vertrag regelt die Rechte und Pflichten zwischen dem Verein und dem Spieler für die Dauer der im Vertrag genannten Saison. Der Spieler verpflichtet sich, nach bestem Wissen und Gewissen für den Verein zu spielen und an den von den Trainern angesetzten Trainings und Spielen teilzunehmen.
                </p>

                <h2 className="font-bold text-base mb-4">Vertragsdauer</h2>
                <p className="mb-4">
                    Dieser Vertrag ist gültig vom <strong>{new Date(contract.from).toLocaleDateString('de-CH')}</strong> bis zum <strong>{new Date(contract.to).toLocaleDateString('de-CH')}</strong>.
                </p>

                <h2 className="font-bold text-base mb-4">Leistungen und Klauseln</h2>
                <ul className="list-disc list-inside space-y-1 mb-8">
                    {contract.clauses?.map((clause, i) => (
                        <li key={i}>{clause}</li>
                    ))}
                </ul>

                 <h2 className="font-bold text-base mb-4">Finanzielle Vereinbarungen</h2>
                <ul className="list-disc list-inside space-y-1 mb-8">
                    <li>Grundgehalt: CHF {formatCurrency(contract.financials?.salary || 0)} / Monat</li>
                    <li>Tor-Prämie: CHF {formatCurrency(contract.financials?.goalBonus || 0)} / Tor</li>
                    <li>Assist-Prämie: CHF {formatCurrency(contract.financials?.assistBonus || 0)} / Assist</li>
                    {contract.financials?.cleanSheetBonus && <li>Zu-Null-Bonus: CHF {formatCurrency(contract.financials.cleanSheetBonus)}</li>}
                </ul>

                <h2 className="font-bold text-base mb-4">Unterschriften</h2>
                <div className="grid grid-cols-2 gap-8 mt-16 pt-8">
                    <div className="border-t pt-2">
                        <p>Ort, Datum</p>
                        <p className="mt-8">Unterschrift Verein</p>
                    </div>
                    <div className="border-t pt-2">
                        <p>Ort, Datum</p>
                        <p className="mt-8">Unterschrift Spieler</p>
                    </div>
                </div>
            </main>

            <footer className="text-center text-gray-500 text-[10px] mt-16 pt-4 border-t">
                FC Amigoal | Vertragsdokument | Seite 1 von 1
            </footer>
        </div>
    );
});
PlayerContractPDF.displayName = "PlayerContractPDF";
