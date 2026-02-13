
'use client';
import { Button } from "@/components/ui/button";
import { NavHeader } from "@/components/ui/nav-header";
import { TrueFocus } from "@/components/ui/true-focus";
import { ContainerTextFlip } from "@/components/ui/modern-animated-multi-words";
import { ArrowRight, BarChart, Users, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useState } from "react";
import { PitchDeckRequestModal } from "@/components/ui/pitch-deck-request-modal";
import { SiteFooter } from "@/components/ui/footer";
import { addInvestorLead } from "@/ai/flows/investorLeads";

const StatCard = ({ value, label, icon: Icon }) => (
    <motion.div 
        className="text-center p-6 bg-background/50 backdrop-blur-sm rounded-xl border"
        whileHover={{ y: -5, scale: 1.05 }}
    >
        <Icon className="h-8 w-8 text-primary mx-auto mb-2" />
        <p className="text-4xl font-bold">{value}</p>
        <p className="text-muted-foreground text-sm">{label}</p>
    </motion.div>
)

export default function InvestorsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showLogin, setShowLogin] = useState(false);

    const handleRequestSubmit = async (data) => {
        await addInvestorLead({
            name: data.name,
            company: data.company,
            email: data.email,
            message: data.message,
        });
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2, delayChildren: 0.3 },
        },
    };

    return (
        <div className="min-h-screen bg-muted/20 text-foreground">
            <NavHeader onLoginClick={() => setShowLogin(true)} />

            <main className="py-32 text-center space-y-12">
                <div className="container mx-auto px-4">
                    <TrueFocus
                        sentence="Invest in the Future of Football"
                        className="text-4xl md:text-6xl font-bold"
                    />
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                    >
                         <ContainerTextFlip 
                            words={["Management", "Community", "Engagement", "Success"]}
                            className="mt-8"
                            textClassName="text-2xl md:text-4xl"
                        />
                    </motion.div>
                </div>

                <motion.div 
                    className="container mx-auto px-4 max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <StatCard value="150+" label="Aktive Vereine" icon={Users}/>
                    <StatCard value="12k+" label="Engagierte Nutzer" icon={BarChart}/>
                    <StatCard value="3x" label="Jährliches Wachstum" icon={Zap}/>
                </motion.div>

                <Card className="container mx-auto max-w-4xl text-left bg-background/80 backdrop-blur-lg">
                    <CardHeader>
                        <CardTitle className="text-3xl">Werden Sie Teil der Revolution</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>
                            Amigoal ist nicht nur eine Software, sondern ein wachsendes Ökosystem, das den Amateur- und Breitenfussball digitalisiert. Wir schaffen einen vernetzten, effizienten und transparenten Marktplatz für Vereine, Spieler, Sponsoren und Fans.
                        </p>
                        <p>
                            Wir suchen strategische Partner, die unsere Vision teilen und mit uns die nächste Stufe des Wachstums zünden wollen.
                        </p>
                        <div className="pt-4">
                            <Button size="lg" onClick={() => setIsModalOpen(true)}>
                                Pitch Deck anfordern <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
             <SiteFooter onLoginClick={() => setShowLogin(true)} />
            <PitchDeckRequestModal 
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSubmit={handleRequestSubmit}
            />
        </div>
    );
}
