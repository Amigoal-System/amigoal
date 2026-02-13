
'use client';

import React from 'react';
import { FloatingDock } from '@/components/ui/floating-dock';

const squad = {
  starters: [
    { id: 1, number: 1, name: 'Beat Meier', position: 'Goal' },
    { id: 2, number: 2, name: 'Leo Dietrich', position: 'Verteidiger' },
    { id: 3, number: 3, name: 'Luc Sutter', position: 'Verteidiger' },
    { id: 4, number: 4, name: 'Müller', position: 'Verteidiger' },
    { id: 5, number: 8, name: 'Peter', position: 'Verteidiger' },
    { id: 6, number: 6, name: 'Tim Arnold', position: 'Mittelfeld' },
    { id: 7, number: 7, name: 'Jan-Luc Bernhard', position: 'Mittelfeld' },
    { id: 8, number: 10, name: 'Lionel Messi', position: 'Mittelfeld' },
    { id: 9, number: 16, name: 'Müller Jr', position: 'Mittelfeld' },
    { id: 10, number: 11, name: 'Ueli Sutter', position: 'Sturm' },
    { id: 11, number: 12, name: 'Franz Müller', position: 'Sturm' },
  ],
  bench: [
    { id: 12, number: 13, name: 'Fritz Walter', position: 'Sturm' },
    { id: 13, number: 14, name: 'Hans Schäfer', position: 'Mittelfeld' },
    { id: 14, number: 15, name: 'Uwe Seeler', position: 'Sturm' },
    { id: 15, number: 17, name: 'Lukas Podolski', position: 'Sturm' },
  ],
};


export default function MatchPrepPage() {
  return (
    <div className="h-full">
        <FloatingDock squad={squad} />
    </div>
  );
}
