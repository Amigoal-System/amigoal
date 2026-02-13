
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HelpCircle, DollarSign, Tag, Rocket, Info, Users, UserPlus, Upload, Wallet, Calendar } from 'lucide-react';


const iconMap = {
    HelpCircle, DollarSign, Tag, Rocket, Info, Users, UserPlus, Upload, Wallet, Calendar
};


interface FaqSectionWithCategoriesProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  items: {
    question: string;
    answer: string;
    category?: string;
    icon?: string;
  }[];
  contactInfo?: {
    title: string;
    description?: string;
    buttonText: string;
    onContact?: () => void;
  };
}

const FaqSectionWithCategories = React.forwardRef<HTMLElement, FaqSectionWithCategoriesProps>(
  ({ className, title, description, items, contactInfo, ...props }, ref) => {
    
    const categories = React.useMemo(() => {
        const cats = new Set(items.map(item => item.category).filter(Boolean));
        return ["Alle", ...Array.from(cats)];
    }, [items]);

    return (
      <section
        ref={ref}
        className={cn("py-16 w-full", className)}
        {...props}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-4xl font-bold text-foreground">
                {title}
              </h2>
              {description && (
                <p className="text-muted-foreground">
                  {description}
                </p>
              )}
            </div>

             {/* FAQ Items */}
            <Tabs defaultValue={categories[0]} className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
                    {categories.map(category => (
                        <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                    ))}
                </TabsList>
                 {categories.map(category => (
                    <TabsContent key={category} value={category}>
                        <Accordion type="single" collapsible className="space-y-4">
                            {items.filter(item => category === "Alle" || item.category === category).map((item, index) => {
                                const Icon = item.icon ? iconMap[item.icon] : null;
                                return (
                                <AccordionItem
                                    key={`${'\'\'\''}{category}-${index}`}
                                    value={`item-${'\'\'\''}{index}`}
                                    className={cn(
                                    "mb-4 rounded-xl",
                                    "bg-card text-card-foreground",
                                    "border border-border/60",
                                    "shadow-sm dark:shadow-black/10"
                                    )}
                                >
                                    <AccordionTrigger 
                                    className={cn(
                                        "px-6 py-4 text-left hover:no-underline",
                                        "data-[state=open]:border-b data-[state=open]:border-border/60"
                                    )}
                                    >
                                    <div className="flex items-center gap-4">
                                        {Icon && <div className="text-primary"><Icon className="h-5 w-5" /></div>}
                                        <div className="flex flex-col gap-2 text-left">
                                        <h3 className="text-lg font-medium text-foreground group-hover:text-primary">
                                            {item.question}
                                        </h3>
                                        </div>
                                    </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pt-4 pb-6">
                                    <p className="text-muted-foreground leading-relaxed">
                                        {item.answer}
                                    </p>
                                    </AccordionContent>
                                </AccordionItem>
                                )
                            })}
                        </Accordion>
                    </TabsContent>
                ))}
            </Tabs>

            {/* Contact Section */}
            {contactInfo && (
              <div className="mt-12 text-center">
                <p className="text-muted-foreground mb-4">
                  {contactInfo.title}
                </p>
                {contactInfo.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {contactInfo.description}
                  </p>
                )}
                <Button size="sm" onClick={contactInfo.onContact}>
                  {contactInfo.buttonText}
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }
);
FaqSectionWithCategories.displayName = "FaqSectionWithCategories";

export { FaqSectionWithCategories };
