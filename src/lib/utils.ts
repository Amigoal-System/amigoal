import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generateSwissQrCodeData = (club, dunningInfo) => {
    const total = 99.00 + (dunningInfo?.fee || 0);
    // This is a simplified example of the Swiss QR Bill payload data.
    const data = `SPC
0200
1
CH8830700114000121119
K
Amigoal
Musterstrasse 1
8000
Zürich
CH





${total.toFixed(2)}
CHF
K
${club.manager}
${club.address?.street || 'Strasse'} ${club.address?.house_number || ''}
${club.address?.zip || '8000'}
${club.address?.city || 'Stadt'}
CH
QRR
210000000000000000000000001
Rechnung für Amigoal Abo`;
    return encodeURIComponent(data.replace(/\n\s*/g, '\n'));
};
