
export function formatDateRange(from: Date, to: Date): string {
    const fromTime = from.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
    const toTime = to.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
    return `${fromTime} - ${toTime}`;
}
