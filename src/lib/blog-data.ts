// src/lib/blog-data.ts

export interface Post {
  slug: string;
  title: string;
  publishDate: string;
  author: {
    name: string;
    avatar: string;
  };
  summary: string;
  content: string; // Markdown content
  stats: {
      views: number;
      likes: number;
      comments: number;
  }
}

export const blogData: Post[] = [
  {
    slug: 'die-zukunft-der-vereinsverwaltung',
    title: 'Die Zukunft der Vereinsverwaltung ist digital',
    publishDate: '2024-07-28',
    author: {
      name: 'Dr. Peter Clubmann',
      avatar: 'https://placehold.co/40x40.png?text=PC',
    },
    summary: 'Entdecken Sie, wie Amigoal die Art und Weise, wie Fussballvereine verwaltet werden, revolutioniert.',
    content: `
In der heutigen schnelllebigen Welt ist Effizienz der Schlüssel zum Erfolg. Das gilt auch für Fussballvereine.
Die Tage von veralteten Excel-Listen und unzähligen WhatsApp-Gruppen sind gezählt. Amigoal bietet eine
zentrale Plattform, um alle Aspekte Ihres Vereins zu verwalten – von der Mitgliederverwaltung bis
zur Finanzplanung.

### Warum digitalisieren?

- **Zeitersparnis:** Automatisieren Sie Routineaufgaben und gewinnen Sie mehr Zeit für das Wesentliche: den Fussball.
- **Transparenz:** Alle Daten an einem Ort, zugänglich für die richtigen Personen zur richtigen Zeit.
- **Kommunikation:** Bündeln Sie die gesamte Vereinskommunikation an einem Ort und stellen Sie sicher, dass keine Information verloren geht.
`,
    stats: {
        views: 1258,
        likes: 256,
        comments: 32
    }
  },
  {
    slug: 'ki-im-amateurfussball',
    title: 'KI im Amateurfussball: Mehr als nur ein Hype?',
    publishDate: '2024-07-15',
    author: {
      name: 'Alex "Taktikfuchs" Schmidt',
      avatar: 'https://placehold.co/40x40.png?text=AS',
    },
    summary: 'Künstliche Intelligenz ist nicht mehr nur den Profis vorbehalten. Wir zeigen, wie Amigoal KI nutzt, um Trainern und Spielern zu helfen.',
    content: `
Künstliche Intelligenz (KI) klingt für viele nach Science-Fiction, aber sie hat bereits Einzug in den Amateurfussball gehalten. Mit Amigoal nutzen wir die Kraft der KI, um Ihnen wertvolle Einblicke zu geben.

### Anwendungsfälle in Amigoal

1.  **Spielanalyse:** Nach einem Spiel kann unsere KI automatisch einen Bericht erstellen, der Stärken, Schwächen und Schlüsselmomente hervorhebt.
2.  **Trainingsplanung:** Basierend auf der Belastung der letzten Wochen und den Ergebnissen der letzten Spiele schlägt die KI den optimalen Trainingsfokus vor.
3.  **Chatbot "Amigo":** Unser KI-Assistent beantwortet rund um die Uhr die häufigsten Fragen Ihrer Mitglieder und entlastet so die Administration.
`,
    stats: {
        views: 2345,
        likes: 512,
        comments: 64
    }
  },
    {
    slug: 'tokenization-die-naechste-evolution',
    title: 'Tokenization: Die nächste Evolution im Vereinssponsoring',
    publishDate: '2024-07-01',
    author: {
      name: 'Mia Fin-Tech',
      avatar: 'https://placehold.co/40x40.png?text=MF',
    },
    summary: 'Binden Sie Ihre Fans und Sponsoren auf eine völlig neue Art und Weise. Tokenization eröffnet neue Einnahmequellen und stärkt die Community.',
    content: `
Stellen Sie sich vor, Ihre Fans könnten nicht nur zuschauen, sondern aktiv am Erfolg des Vereins teilhaben. Mit der Tokenization-Funktion von Amigoal wird das möglich.

### Was sind Vereinstoken?

Vereinstoken sind digitale Vermögenswerte, die Ihren Fans und Sponsoren exklusive Rechte und Vorteile bieten. Das kann von einem Stimmrecht bei der Wahl des neuen Trikotdesigns bis hin zu exklusiven Meet & Greets mit den Spielern reichen.

**Die Vorteile:**

*   **Neue Einnahmequellen:** Verkaufen Sie Tokens und generieren Sie frisches Kapital für Ihren Verein.
*   **Stärkere Fanbindung:** Binden Sie Ihre Community enger an den Verein und belohnen Sie Treue.
*   **Innovatives Image:** Positionieren Sie Ihren Verein als modern und zukunftsorientiert.
`,
    stats: {
        views: 890,
        likes: 180,
        comments: 12
    }
  },
];
