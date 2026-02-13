'use client';
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";

type AccordionItem = {
  id: number;
  title: string;
  description: string;
  image: string;
  dataAiHint: string;
};

const accordionItems: AccordionItem[] = [
  {
    id: 1,
    title: "Spielanalyse",
    description: "Erhalten Sie detaillierte Einblicke in jedes Spiel mit KI-gestützten Analysen. Verfolgen Sie die Leistung der Spieler und erkennen Sie Muster, um Ihre Strategie zu optimieren.",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "soccer analytics chart",
  },
  {
    id: 2,
    title: "Trainingsplanung",
    description: "Planen und verwalten Sie Trainingseinheiten mühelos. Erstellen Sie individuelle Pläne und verfolgen Sie die Anwesenheit und Entwicklung Ihrer Spieler.",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "soccer training session",
  },
  {
    id: 3,
    title: "Mitgliederverwaltung",
    description: "Eine zentrale Anlaufstelle für alle Mitgliederdaten. Verwalten Sie Profile, Beiträge und Kommunikation an einem Ort.",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "team members group",
  },
  {
    id: 4,
    title: "Finanz-Dashboard",
    description: "Behalten Sie die Finanzen Ihres Vereins im Griff. Verfolgen Sie Einnahmen, Ausgaben und Sponsoring-Deals mit übersichtlichen Dashboards.",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "finance dashboard chart",
  },
];

export const LandingAccordionItem = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="p-4 bg-background">
      <div className="flex flex-col lg:flex-row items-stretch gap-4 max-w-6xl mx-auto">
        {accordionItems.map((item, index) => (
          <motion.div
            key={item.id}
            onClick={() => setOpen(index)}
            className={cn(
              "relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ease-in-out",
              open === index ? "flex-[4]" : "flex-[1]"
            )}
            animate={{ flex: open === index ? 4 : 1 }}
          >
            <Image
              src={item.image}
              alt={item.title}
              width={800}
              height={600}
              className="w-full h-full object-cover"
              data-ai-hint={item.dataAiHint}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 text-white w-full">
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: open === index ? 1 : 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={cn("text-sm transition-opacity", open !== index && "opacity-0")}
              >
                {item.description}
              </motion.div>
              <motion.h3
                className="text-xl lg:text-2xl font-bold mt-2"
                layout
              >
                {item.title}
              </motion.h3>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
