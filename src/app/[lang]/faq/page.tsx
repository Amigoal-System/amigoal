
'use client';

import Link from "next/link";
import React, { useState, useEffect } from 'react';
import { FaqSectionWithCategories } from "@/components/ui/faq-with-categories";
import { NavHeader } from "@/components/ui/nav-header";
import { Button } from "@/components/ui/button";
import { ContactModal } from "@/components/ui/contact-modal";
import { FeatureRequestModal } from "@/components/ui/feature-request-modal";
import { Mail, Lightbulb, FileText as BlogIcon, UserSquare } from 'lucide-react';
import { useParams } from "next/navigation";
import { SiteFooter } from "@/components/ui/footer";
import { getAllFaqs } from '@/ai/flows/faqs';
import type { FAQ } from '@/ai/flows/faqs.types';

export default function FaqPage() {
  const params = useParams();
  const lang = params.lang;
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const fetchFaqs = async () => {
        try {
            const data = await getAllFaqs();
            setFaqs(data);
        } catch (error) {
            console.error("Failed to fetch FAQs:", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchFaqs();
  }, []);

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Lade FAQs...</p>
        </div>
    );
  }

  return (
    <div>
        <NavHeader onLoginClick={() => setShowLogin(true)} />
        <FaqSectionWithCategories
          title="Häufig gestellte Fragen"
          description="Finden Sie Antworten auf häufige Fragen zu unseren Dienstleistungen"
          items={faqs}
          contactInfo={{
            title: "Haben Sie noch Fragen?",
            buttonText: "Support kontaktieren",
            onContact: () => setIsContactModalOpen(true),
          }}
        />
         <SiteFooter onLoginClick={() => setShowLogin(true)} />
         <ContactModal 
            isOpen={isContactModalOpen}
            onOpenChange={setIsContactModalOpen}
        />
         <FeatureRequestModal 
            isOpen={isIdeaModalOpen}
            onOpenChange={setIsIdeaModalOpen}
            source="FAQ Page"
        />
    </div>
  );
}
