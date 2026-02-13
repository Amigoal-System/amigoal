
'use client';

import { FaqSectionWithCategories } from "@/components/ui/faq-with-categories";
import { DEMO_FAQS } from "@/lib/faq-data";

export default function GetHelpPage() {
    return (
        <FaqSectionWithCategories 
            title="Hilfe-Center"
            description="Finden Sie Antworten auf die häufigsten Fragen."
            items={DEMO_FAQS}
        />
    )
}
