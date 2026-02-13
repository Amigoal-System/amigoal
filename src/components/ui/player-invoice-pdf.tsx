
'use client';
import React from 'react';
import { AmigoalLogo, QrCodeIcon } from '../icons';

type PlayerInvoicePDFProps = {
  invoice: any;
};

export const PlayerInvoicePDF = React.forwardRef<HTMLDivElement, PlayerInvoicePDFProps>(({ invoice }, ref) => {
    const today = new Date();
    const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : new Date(new Date().setDate(today.getDate() + 30));

    const formatCurrency = (value: number) => {
        return value.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div ref={ref} className="bg-white text-black p-8 font-sans text-xs">
            <div className="grid grid-cols-2 gap-8">
                <div>
                    <AmigoalLogo className="h-16 w-16 text-black mb-4" />
                    <p className="font-bold">FC Amigoal</p>
                    <p>Musterstrasse 123</p>
                    <p>8000 Zürich</p>
                </div>
                <div className="text-right">
                    <p className="text-sm">FC Amigoal, Musterstrasse 123, 8000 Zürich</p>
                    <div className="mt-8 text-left">
                        <p>{invoice.name}</p>
                        <p>c/o Eltern</p>
                        <p>Beispielweg 4</p>
                        <p>8001 Zürich</p>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <p><span className="font-bold">Rechnungsnummer:</span> {`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`}</p>
                        <p><span className="font-bold">Datum:</span> {today.toLocaleDateString('de-CH')}</p>
                        <p><span className="font-bold">Zahlbar bis:</span> {dueDate.toLocaleDateString('de-CH')}</p>
                    </div>
                </div>
            </div>

            <h1 className="text-lg font-bold mt-8 mb-4">Rechnung: {invoice.description}</h1>

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
                    {invoice.items.map((item, index) => (
                        <tr key={index} className="border-b border-black">
                            <td className="py-1">{index + 1}</td>
                            <td>{item.description}</td>
                            <td className="text-right">1.00</td>
                            <td className="text-right">{formatCurrency(item.amount)}</td>
                            <td className="text-right">{formatCurrency(item.amount)}</td>
                        </tr>
                    ))}
                    <tr className="border-b-2 border-black">
                        <td colSpan={5} className="py-1">&nbsp;</td>
                    </tr>
                    <tr>
                        <td colSpan={4} className="text-right font-bold pt-2">Total</td>
                        <td className="text-right font-bold pt-2">{formatCurrency(invoice.totalAmount)}</td>
                    </tr>
                </tbody>
            </table>

            <p className="mt-8">Für deinen Beitrag bedankt sich der FC Amigoal ganz herzlich und wünscht dir weiterhin viel Erfolg.</p>
            <p className="mt-4">Sportliche Grüsse</p>
            <p className="mt-2">FC Amigoal</p>

            {/* Swiss QR Bill Section */}
            <div style={{ pageBreakBefore: 'always' }} className="pt-16">
                 <div className="grid grid-cols-[1fr_2fr] gap-4">
                    {/* Empfangsschein */}
                    <div>
                        <h2 className="font-bold text-base mb-4">Empfangsschein</h2>
                        <div className="space-y-2">
                             <div>
                                <p className="font-bold">Konto / Zahlbar an</p>
                                <p>CH56 0070 0110 0001 2345 6</p>
                                <p>FC Amigoal</p>
                                <p>Musterstrasse 123</p>
                                <p>8000 Zürich</p>
                            </div>
                            <div>
                                <p className="font-bold">Referenz</p>
                                <p>RF12 3456 7890</p>
                            </div>
                            <div>
                                 <p className="font-bold">Zahlbar durch</p>
                                <p>{invoice.name}</p>
                                <p>Beispielweg 4</p>
                                <p>8001 Zürich</p>
                            </div>
                            <div className="flex justify-between">
                                <div>
                                    <p className="font-bold">Währung</p>
                                    <p>CHF</p>
                                </div>
                                 <div>
                                    <p className="font-bold">Betrag</p>
                                    <p>{formatCurrency(invoice.totalAmount)}</p>
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
                                <QrCodeIcon className="w-full h-full"/>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <p className="font-bold">Konto / Zahlbar an</p>
                                    <p>CH56 0070 0110 0001 2345 6</p>
                                    <p>FC Amigoal</p>
                                    <p>Musterstrasse 123</p>
                                    <p>8000 Zürich</p>
                                </div>
                                <div>
                                    <p className="font-bold">Referenz</p>
                                    <p>RF12 3456 7890</p>
                                </div>
                            </div>
                         </div>
                        <div className="mt-4 space-y-2">
                            <div>
                                <p className="font-bold">Zusätzliche Informationen</p>
                                <p>Rechnung für: {invoice.description}</p>
                            </div>
                             <div>
                                 <p className="font-bold">Zahlbar durch</p>
                                <p>{invoice.name}</p>
                                <p>Beispielweg 4</p>
                                <p>8001 Zürich</p>
                            </div>
                        </div>
                         <div className="flex justify-between mt-4">
                                <div>
                                    <p className="font-bold">Währung</p>
                                    <p>CHF</p>
                                </div>
                                 <div>
                                    <p className="font-bold">Betrag</p>
                                    <p>{formatCurrency(invoice.totalAmount)}</p>
                                </div>
                            </div>
                     </div>
                 </div>
            </div>
            <footer className="text-center text-gray-500 text-[10px] mt-16 pt-4 border-t">
                FC Amigoal | Vertragsdokument | Seite 1 von 1
            </footer>
        </div>
    );
});
PlayerInvoicePDF.displayName = "PlayerInvoicePDF";
