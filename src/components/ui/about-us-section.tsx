
"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  Pen,
  PaintBucket,
  Home,
  Ruler,
  PenTool,
  Building2,
  Award,
  Users,
  Calendar,
  CheckCircle,
  Sparkles,
  Star,
  ArrowRight,
  Zap,
  TrendingUp,
} from "lucide-react"
import { motion, useScroll, useTransform, useInView, useSpring } from "framer-motion"
import useMeasure from "react-use-measure"
import { TextShimmerWave } from "./text-shimmer-wave"
import { AmigoalLogo } from "@/components/icons";
import { Button } from "./button"
import Link from "next/link"
import { useParams } from "next/navigation"
import { CardFooter } from "./card"
import { getAllClubs } from "@/ai/flows/clubs";
import { getAllMembers } from "@/ai/flows/members";

const defaultContent = {
    subtitle: "ENTDECKEN SIE UNSERE GESCHICHTE",
    title: "Über Uns",
    paragraph: "Wir sind ein leidenschaftliches Team aus Entwicklern, Designern und Fussball-Enthusiasten, das sich zum Ziel gesetzt hat, die Vereinsverwaltung zu revolutionieren. Mit Liebe zum Detail und dem Streben nach Exzellenz verwandeln wir Visionen in Realität.",
    services: [
        { icon: 'Users', title: 'Für Vereine', description: 'Zentrale Verwaltung aller Mitglieder, Teams und Finanzen. Sparen Sie Zeit und professionalisieren Sie Ihre Abläufe.' },
        { icon: 'Home', title: 'Für Trainer', description: 'Planen Sie Trainings, analysieren Sie Spiele und kommunizieren Sie direkt mit Ihrem Team – alles in einer App.' },
        { icon: 'Star', title: 'Für Spieler', description: 'Verfolgen Sie Ihre Leistungen, bleiben Sie mit dem Team in Kontakt und verwalten Sie Ihre Anwesenheiten und Aufgaben.' },
        { icon: 'PaintBucket', title: 'Für Eltern', description: 'Bleiben Sie immer auf dem Laufenden über die Termine und Erfolge Ihrer Kinder. Einfache Kommunikation mit Trainern und Verein.' },
        { icon: 'Ruler', title: 'Für Sponsoren', description: 'Verwalten Sie Ihre Engagements, entdecken Sie neue Möglichkeiten und verfolgen Sie die Wirkung Ihres Sponsorings.' },
        { icon: 'Building2', title: 'Für Verbände', description: 'Optimieren Sie die Kommunikation mit Ihren Vereinen und digitalisieren Sie administrative Prozesse.' },
    ],
    ctaTitle: "Bereit, Ihren Verein zu transformieren?",
    ctaDescription: "Lassen Sie uns gemeinsam Grosses schaffen."
};


const serviceIcons = {
  Users,
  Home,
  Star,
  PaintBucket,
  Ruler,
  Building2
};


export default function AboutUsSection({ content }) {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: false, amount: 0.1 })
  const isStatsInView = useInView(statsRef, { once: false, amount: 0.3 })
  const params = useParams();
  const lang = params.lang;
  
  const pageContent = content || defaultContent;

  const [statsData, setStatsData] = useState({
    clubs: 0,
    users: 0,
    experience: 12,
    satisfaction: 98,
  });

  const fetchStats = useCallback(async () => {
    try {
      const [clubsData, membersData] = await Promise.all([
        getAllClubs({ includeArchived: false }),
        getAllMembers('*'),
      ]);
      setStatsData(prev => ({
        ...prev,
        clubs: clubsData.length,
        users: membersData.length,
      }));
    } catch (error) {
      console.error("Could not fetch stats for about page:", error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);


  // Parallax effect for decorative elements
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 50])
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 20])
  const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -20])

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  const services = pageContent.services.map((service, index) => ({
      ...service,
      icon: serviceIcons[service.icon] || Users, // Fallback to Users icon
      secondaryIcon: index % 2 === 0 ? <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-primary-foreground/50" /> : <CheckCircle className="w-4 h-4 absolute -top-1 -right-1 text-primary-foreground/50" />,
      position: index < 3 ? 'left' : 'right'
  }));

  const stats = [
    { icon: <Award />, value: statsData.clubs, label: "Aktive Vereine", suffix: "+" },
    { icon: <Users />, value: statsData.users, label: "Zufriedene Nutzer", suffix: "+" },
    { icon: <Calendar />, value: statsData.experience, label: "Jahre im Sportbusiness", suffix: "" },
    { icon: <TrendingUp />, value: statsData.satisfaction, label: "Kundenzufriedenheit", suffix: "%" },
  ]

  return (
    <section
      id="about-section"
      ref={sectionRef}
      className="w-full py-24 px-4 bg-background text-foreground overflow-hidden relative"
    >
      {/* Decorative background elements */}
      <motion.div
        className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl"
        style={{ y: y1, rotate: rotate1 }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-accent/5 blur-3xl"
        style={{ y: y2, rotate: rotate2 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/4 w-4 h-4 rounded-full bg-primary/30"
        animate={{
          y: [0, -15, 0],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-6 h-6 rounded-full bg-accent/30"
        animate={{
          y: [0, 20, 0],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <motion.div
        className="container mx-auto max-w-6xl relative z-10"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <motion.div className="flex flex-col items-center mb-6" variants={itemVariants}>
          <motion.span
            className="text-primary font-medium mb-2 flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Zap className="w-4 h-4" />
            {pageContent.subtitle}
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-light mb-4 text-center">{pageContent.title}</h2>
          <motion.div
            className="w-24 h-1 bg-primary"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 1, delay: 0.5 }}
          ></motion.div>
        </motion.div>

        <motion.p className="text-center max-w-2xl mx-auto mb-16 text-foreground/80" variants={itemVariants}>
            {pageContent.paragraph}
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Left Column */}
          <div className="space-y-16">
            {services
              .filter((service) => service.position === "left")
              .map((service, index) => (
                <ServiceItem
                  key={`left-${''}{index}`}
                  icon={React.createElement(service.icon)}
                  secondaryIcon={service.secondaryIcon}
                  title={service.title}
                  description={service.description}
                  variants={itemVariants}
                  delay={index * 0.2}
                  direction="left"
                />
              ))}
          </div>

          {/* Center Image */}
          <div className="flex justify-center items-center order-first md:order-none mb-8 md:mb-0">
            <motion.div className="relative w-full max-w-xs" variants={itemVariants}>
              <motion.div
                className="rounded-md overflow-hidden shadow-xl bg-muted/30"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
              >
                 <div className="w-full h-[400px] flex items-center justify-center p-8">
                  <AmigoalLogo className="w-48 h-48 text-primary" />
                </div>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent flex items-end justify-center p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                >
                  <Button asChild>
                    <Link href="#" className="flex items-center gap-2">
                        Unser Team <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
              <motion.div
                className="absolute inset-0 border-4 border-primary/30 rounded-md -m-3 z-[-1]"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              ></motion.div>

              {/* Floating accent elements */}
              <motion.div
                className="absolute -top-4 -right-8 w-16 h-16 rounded-full bg-primary/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.9 }}
                style={{ y: y1 }}
              ></motion.div>
              <motion.div
                className="absolute -bottom-6 -left-10 w-20 h-20 rounded-full bg-accent/15"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.1 }}
                style={{ y: y2 }}
              ></motion.div>

              {/* Additional decorative elements */}
              <motion.div
                className="absolute -top-10 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary"
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              ></motion.div>
              <motion.div
                className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-accent"
                animate={{
                  y: [0, 10, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              ></motion.div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-16">
            {services
              .filter((service) => service.position === "right")
              .map((service, index) => (
                <ServiceItem
                  key={`right-${''}{index}`}
                  icon={React.createElement(service.icon)}
                  secondaryIcon={service.secondaryIcon}
                  title={service.title}
                  description={service.description}
                  variants={itemVariants}
                  delay={index * 0.2}
                  direction="right"
                />
              ))}
          </div>
        </div>

        {/* Stats Section */}
        <motion.div
          ref={statsRef}
          className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="hidden"
          animate={isStatsInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {stats.map((stat, index) => (
            <StatCounter
              key={index}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              suffix={stat.suffix}
              delay={index * 0.1}
            />
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="mt-20 bg-foreground text-background p-8 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={isStatsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="flex-1">
            <h3 className="text-2xl font-medium mb-2">{pageContent.ctaTitle}</h3>
            <p className="text-background/80">{pageContent.ctaDescription}</p>
          </div>
          <Button asChild className="px-6 py-3 font-medium transition-colors" size="lg">
              <Link href={`/${lang}/register`}>
                  Jetzt starten <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  )
}

interface ServiceItemProps {
  icon: React.ReactNode
  secondaryIcon?: React.ReactNode
  title: string
  description: string
  variants: {
    hidden: { opacity: number; y?: number }
    visible: { opacity: number; y?: number; transition: { duration: number; ease: string } }
  }
  delay: number
  direction: "left" | "right"
}

function ServiceItem({ icon, secondaryIcon, title, description, variants, delay, direction }: ServiceItemProps) {
  return (
    <motion.div
      className="flex flex-col group"
      variants={variants}
      transition={{ delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <motion.div
        className="flex items-center gap-3 mb-3"
        initial={{ x: direction === "left" ? -20 : 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: delay + 0.2 }}
      >
        <motion.div
          className="text-primary bg-primary/10 p-3 rounded-lg transition-colors duration-300 group-hover:bg-primary/20 relative"
          whileHover={{ rotate: [0, -10, 10, -5, 0], transition: { duration: 0.5 } }}
        >
          {icon}
          {secondaryIcon}
        </motion.div>
        <h3 className="text-xl font-medium text-foreground group-hover:text-primary transition-colors duration-300">
           <TextShimmerWave className='[--base-color:hsl(var(--primary))] [--base-gradient-color:hsl(var(--foreground))] text-xl font-medium' duration={2}>
              {title}
            </TextShimmerWave>
        </h3>
      </motion.div>
      <motion.p
        className="text-sm text-foreground/80 leading-relaxed pl-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: delay + 0.4 }}
      >
        {description}
      </motion.p>
      <motion.div
        className="mt-3 pl-12 flex items-center text-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0 }}
      >
        <span className="flex items-center gap-1">
          Learn more <ArrowRight className="w-3 h-3" />
        </span>
      </motion.div>
    </motion.div>
  )
}

interface StatCounterProps {
  icon: React.ReactNode
  value: number
  label: string
  suffix: string
  delay: number
}

function StatCounter({ icon, value, label, suffix, delay }: StatCounterProps) {
  const countRef = useRef(null)
  const isInView = useInView(countRef, { once: false })
  const [hasAnimated, setHasAnimated] = useState(false)

  const springValue = useSpring(0, {
    stiffness: 50,
    damping: 10,
  })

  useEffect(() => {
    if (isInView && !hasAnimated) {
      springValue.set(value)
      setHasAnimated(true)
    } else if (!isInView && hasAnimated) {
      springValue.set(0)
      setHasAnimated(false)
    }
  }, [isInView, value, springValue, hasAnimated])

  const displayValue = useTransform(springValue, (latest) => Math.floor(latest))

  return (
    <motion.div
      className="bg-card/50 backdrop-blur-sm p-6 rounded-xl flex flex-col items-center text-center group hover:bg-card transition-colors duration-300"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, delay },
        },
      }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <motion.div
        className="w-14 h-14 rounded-full bg-foreground/5 flex items-center justify-center mb-4 text-primary group-hover:bg-primary/10 transition-colors duration-300"
        whileHover={{ rotate: 360, transition: { duration: 0.8 } }}
      >
        {icon}
      </motion.div>
      <motion.div ref={countRef} className="text-3xl font-bold text-foreground flex items-center">
        <motion.span>{displayValue}</motion.span>
        <span>{suffix}</span>
      </motion.div>
      <p className="text-foreground/70 text-sm mt-1">{label}</p>
      <motion.div className="w-10 h-0.5 bg-primary mt-3 group-hover:w-16 transition-all duration-300" />
    </motion.div>
  )
}
