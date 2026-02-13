
'use client';
import React from 'react';
import { AmigoalLogo, QrCodeIcon } from '../icons';
import { generateSwissQrCodeData } from '@/lib/utils';

export const ClubDunningPDF = React.forwardRef<HTMLDivElement, { club: any, dunningInfo: any }>(({ club, dunningInfo }, ref) => {
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 20);

    const formatCurrency = (value: number) => {
        return value.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    if (!club || !dunningInfo) {
        return <div ref={ref}>Loading...</div>;
    }

    const qrData = generateSwissQrCodeData(club, dunningInfo);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${qrData}&size=128x128&format=svg`;

    return (
        <div ref={ref} className="bg-white text-black p-8 font-sans text-xs">
            <header className="flex justify-between items-center border-b-2 border-black pb-4">
                <div>
                    <h1 className="text-2xl font-bold">Mahnung</h1>
                    <p>SaaS Abonnement</p>
                </div>
                <AmigoalLogo className="h-20 w-20 text-black" />
            </header>

            <main className="my-8">
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <p className="font-semibold">Von:</p>
                        <p>Amigoal</p>
                        <p>c/o Awesome Inc.</p>
                        <p>Musterstrasse 1</p>
                        <p>8000 Zürich</p>
                    </div>
                    <div className="text-left">
                        <p className="font-semibold">An:</p>
                        <p>{club.name}</p>
                        <p>{club.manager}</p>
                        <p>Zürcherstrasse 82</p>
                        <p>5432 Neuenhof</p>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p><span className="font-bold">Rechnungsnummer:</span> {Math.floor(1000 + Math.random() * 9000)}</p>
                            <p><span className="font-bold">Datum:</span> {today.toLocaleDateString('de-CH')}</p>
                            <p><span className="font-bold">Zahlbar bis:</span> {dueDate.toLocaleDateString('de-CH')}</p>
                        </div>
                    </div>
                </div>

                <h1 className="text-lg font-bold mt-8 mb-4">{dunningInfo.subject}</h1>

                <p className="mb-4">Sehr geehrte/r {club.manager},</p>
                <div className="mb-8 whitespace-pre-wrap">{dunningInfo.body}</div>

                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b-2 border-black">
                            <th className="pb-1">Pos</th>
                            <th className="pb-1">Beschreibung</th>
                            <th className="text-right pb-1">Menge</th>
                            <th className="text-right pb-1">Einzelpreis</th>
                            <th className="text-right pb-1">Preis (CHF)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-black">
                            <td className="py-1">1</td>
                            <td>Amigoal SaaS Abonnement</td>
                            <td className="text-right">1.00</td>
                            <td className="text-right">{formatCurrency(99.00)}</td>
                            <td className="text-right">{formatCurrency(99.00)}</td>
                        </tr>
                        <tr className="border-b-2 border-black">
                            <td className="py-1">2</td>
                            <td>Mahngebühr</td>
                            <td className="text-right">1.00</td>
                            <td className="text-right">{formatCurrency(dunningInfo.fee)}</td>
                            <td className="text-right">{formatCurrency(dunningInfo.fee)}</td>
                        </tr>
                        <tr>
                            <td colSpan={4} className="text-right font-bold pt-2">Total</td>
                            <td className="text-right font-bold pt-2">{formatCurrency(99.00 + dunningInfo.fee)}</td>
                        </tr>
                    </tbody>
                </table>

                <p className="mt-8">Für Ihren Beitrag bedankt sich Amigoal ganz herzlich und wünscht Ihnen und Ihrem Unternehmen weiterhin grösstmöglichen Erfolg.</p>
                <p className="mt-4">Sportliche Grüsse</p>
                <p className="mt-2">Amigoal Team</p>

                {/* Swiss QR Bill Section */}
                <div style={{ pageBreakBefore: 'always' }} className="pt-16">
                     <div className="grid grid-cols-[1fr_2fr] gap-4">
                        {/* Empfangsschein */}
                        <div>
                            <h2 className="font-bold text-base mb-4">Empfangsschein</h2>
                            <div className="space-y-2">
                                 <div>
                                    <p className="font-bold">Konto / Zahlbar an</p>
                                    <p>CH88 3070 0114 0001 2111 9</p>
                                    <p>Amigoal</p>
                                    <p>Musterstrasse 1</p>
                                    <p>8000 Zürich</p>
                                </div>
                                <div>
                                    <p className="font-bold">Referenz</p>
                                    <p>97 66890 00000 00000 00000 12776</p>
                                </div>
                                <div>
                                     <p className="font-bold">Zahlbar durch</p>
                                    <p>{club.name}</p>
                                    <p>{club.manager}</p>
                                    <p>Zürcherstrasse 82</p>
                                    <p>5432 Neuenhof</p>
                                </div>
                                <div className="flex justify-between">
                                    <div>
                                        <p className="font-bold">Währung</p>
                                        <p>CHF</p>
                                    </div>
                                     <div>
                                        <p className="font-bold">Betrag</p>
                                        <p>{formatCurrency(99.00 + dunningInfo.fee)}</p>
                                    </div>
                                </div>
                                <div className="text-right pt-4">
                                    <p>Annahmestelle</p>
                                </div>
                            </div>
                        </div>
                        {/* Zahlteil */}
                         <div className="border-l-2 border-dashed border-black pl-4">
                             <h2 className="font-bold text-base mb-4">Zahlteil</h2>
                             <div className="flex gap-4">
                                <div className="w-32 h-32 flex-shrink-0">
                                    <img src={qrCodeUrl} alt="QR Code" />
                                </div>
                                <div className="space-y-2">
                                    <div>
                                        <p className="font-bold">Konto / Zahlbar an</p>
                                        <p>CH88 3070 0114 0001 2111 9</p>
                                        <p>Amigoal</p>
                                        <p>Musterstrasse 1</p>
                                        <p>8000 Zürich</p>
                                    </div>
                                    <div>
                                        <p className="font-bold">Referenz</p>
                                        <p>97 66890 00000 00000 00000 12776</p>
                                    </div>
                                </div>
                             </div>
                            <div className="mt-4 space-y-2">
                                <div>
                                    <p className="font-bold">Zusätzliche Informationen</p>
                                    <p>Rechnungsnummer: {Math.floor(1000 + Math.random() * 9000)}</p>
                                    <p>{dunningInfo.subject}</p>
                                </div>
                                 <div>
                                     <p className="font-bold">Zahlbar durch</p>
                                    <p>{club.name}</p>
                                    <p>{club.manager}</p>
                                    <p>Zürcherstrasse 82</p>
                                    <p>5432 Neuenhof</p>
                                </div>
                            </div>
                             <div className="flex justify-between mt-4">
                                    <div>
                                        <p className="font-bold">Währung</p>
                                        <p>CHF</p>
                                    </div>
                                     <div>
                                        <p className="font-bold">Betrag</p>
                                        <p>{formatCurrency(99.00 + dunningInfo.fee)}</p>
                                    </div>
                                </div>
                         </div>
                     </div>
                </div>
            </main>

            <footer className="text-center text-gray-500 text-[10px] mt-16 pt-4 border-t">
                FC Amigoal | Vertragsdokument | Seite 1 von 1
            </footer>
        </div>
    );
});

ClubDunningPDF.displayName = "ClubDunningPDF";
