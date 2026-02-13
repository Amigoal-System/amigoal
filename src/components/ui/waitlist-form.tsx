
'use client';

import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useToast } from "@/hooks/use-toast";
import { sendMail } from "@/services/email";

const SMALL_BREAKPOINT = 570;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const childVariants = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.5 },
  },
};

function useWindowWidth() {
  const [width, setWidth] = useState(0);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setWidth(window.innerWidth);
      const handleResize = () => setWidth(window.innerWidth);
  
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return width;
}

export const WaitlistForm = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const width = useWindowWidth();
  const { toast } = useToast();

  const triggerBasicConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
        toast({
            title: "E-Mail fehlt",
            description: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
            variant: "destructive"
        })
        return;
    }
    
    try {
        const adminEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@amigoal.ch';
        await sendMail({
            to: adminEmail,
            subject: 'Neuer Newsletter-Abonnent',
            html: `Eine neue Person hat sich für den Newsletter angemeldet: <strong>${email}</strong>`
        });

        // Simulate saving to waitlist using localStorage
        const currentWaitlist = JSON.parse(localStorage.getItem('amigoal_newsletter_subscribers') || '[]');
        if (!currentWaitlist.includes(email)) {
            currentWaitlist.push(email);
            localStorage.setItem('amigoal_newsletter_subscribers', JSON.stringify(currentWaitlist));
        }
        
        setSubmitted(true);
        triggerBasicConfetti();
    } catch (error) {
         toast({
            title: "Fehler",
            description: "Anmeldung zum Newsletter fehlgeschlagen.",
            variant: "destructive"
        });
    }

  };

  const ThankYouMessage = (
    <motion.div
      layout
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{
        opacity: 1,
        filter: "blur(0px)",
        transition: { duration: 0.5 },
      }}
      exit={{
        opacity: 0,
        filter: "blur(10px)",
        transition: { duration: 0.5 },
      }}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-medium bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
          Vielen Dank!
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Sie wurden zum Newsletter hinzugefügt.
        </p>
      </div>
    </motion.div>
  );

  const FormContent = (
    <motion.div
      layout
      key="form"
      className="w-full"
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{
        opacity: 1,
        filter: "blur(0px)",
        transition: { duration: 0.5 },
      }}
      exit={{
        opacity: 0,
        filter: "blur(10px)",
        transition: { duration: 0.5 },
      }}
    >
      <motion.div
        className={` ${
          width <= SMALL_BREAKPOINT ? "text-left mb-4" : "text-center mb-8"
        }`}
        variants={childVariants}
      >
        <h1 className="text-4xl font-medium bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
          Auf dem Laufenden bleiben?
          <span
            className={`pl-2 ${
              width <= SMALL_BREAKPOINT ? "" : "block"
            } bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`}
          >
            Jetzt für den Newsletter anmelden!
          </span>
        </h1>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        className={
          width <= SMALL_BREAKPOINT
            ? "flex flex-col gap-4 items-start w-full"
            : "relative w-full "
        }
        variants={childVariants}
      >
        <div
          className={
            width <= SMALL_BREAKPOINT
              ? "flex flex-col gap-4 w-full"
              : "flex flex-row items-center w-full space-x-4 rounded-full border border-border bg-background p-2"
          }
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="deine.email@adresse.ch"
            className={`${
              width <= SMALL_BREAKPOINT
                ? "px-4 py-4 w-full text-lg focus:outline-none rounded-full border border-border bg-background"
                : "flex-1 rounded-full bg-transparent px-4 py-4 text-lg focus:outline-none"
            }`}
            required
          />
          <button
            type="submit"
            className={`${
              width <= SMALL_BREAKPOINT
                ? "rounded-full bg-primary px-6 py-4 text-lg font-medium text-primary-foreground hover:bg-primary/90 transition w-full"
                : "rounded-full bg-primary px-6 py-4 text-lg font-medium text-primary-foreground hover:bg-primary/90 transition"
            }`}
          >
            Anmelden
          </button>
        </div>
      </motion.form>
    </motion.div>
  );

  return (
    <motion.div
      layout
      className={`w-[95%] max-w-2xl rounded-3xl bg-card border border-border/10 shadow-lg ${
        width <= SMALL_BREAKPOINT ? "p-8" : "p-12"
      } min-h-[300px] flex items-center`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="wait">
        {!submitted ? FormContent : ThankYouMessage}
      </AnimatePresence>
    </motion.div>
  );
};
