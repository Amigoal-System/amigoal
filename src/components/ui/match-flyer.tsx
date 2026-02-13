
'use client';

import React from 'react';
import Image from 'next/image';
import { AmigoalLogo } from '@/components/icons';
import { motion } from 'framer-motion';

const PulseTemplate = ({ match, primaryColor, secondaryColor, sponsorLogo, customText }) => {
    return (
        <div className="relative w-full h-full text-white font-headline overflow-hidden flex flex-col justify-between" style={{ backgroundColor: primaryColor }}>
            {/* Background Pulse */}
            <motion.div 
                className="absolute top-1/2 left-1/2 w-full h-full rounded-full"
                style={{ background: `radial-gradient(circle, ${secondaryColor}22 0%, ${primaryColor} 70%)`}}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
            
            <header className="p-8 text-center z-10">
                <p className="font-semibold">{match.league}</p>
                <p className="text-sm opacity-80">{new Date(match.date).toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long' })} - {match.time} Uhr</p>
            </header>

            <main className="z-10 flex items-center justify-around px-8">
                <div className="text-center">
                    <div className="w-32 h-32 mx-auto flex items-center justify-center">
                        <match.homeLogo className="w-full h-full"/>
                    </div>
                    <h2 className="text-2xl font-bold mt-2">{match.home}</h2>
                </div>
                <div className="text-4xl font-extrabold -mt-16" style={{color: secondaryColor}}>VS</div>
                <div className="text-center">
                     <div className="w-32 h-32 mx-auto flex items-center justify-center">
                        <match.awayLogo className="w-full h-full"/>
                    </div>
                    <h2 className="text-2xl font-bold mt-2">{match.away}</h2>
                </div>
            </main>

            <footer className="p-8 text-center z-10">
                {sponsorLogo && <img src={sponsorLogo} alt="Sponsor" className="h-10 mx-auto mb-4"/>}
                <p className="font-semibold text-lg">{customText}</p>
                <p className="text-sm opacity-80">{match.location}</p>
            </footer>
        </div>
    );
};

const ClashTemplate = ({ match, primaryColor, secondaryColor, sponsorLogo, customText }) => {
    return (
        <div className="relative w-full h-full font-headline text-white overflow-hidden flex flex-col" style={{backgroundColor: '#111'}}>
            <div className="flex-1 flex items-center justify-center relative">
                <div className="absolute w-1/2 h-full top-0 left-0" style={{backgroundColor: primaryColor}}></div>
                <div className="absolute w-1/2 h-full top-0 right-0" style={{backgroundColor: secondaryColor}}></div>
                
                <div className="z-10 w-36 h-36 flex items-center justify-center bg-background rounded-full shadow-2xl">
                     <AmigoalLogo className="w-24 h-24"/>
                </div>

                <div className="absolute top-1/2 -translate-y-1/2 left-0 w-1/2 flex justify-center items-center">
                    <div className="w-32 h-32"><match.homeLogo className="w-full h-full"/></div>
                </div>
                 <div className="absolute top-1/2 -translate-y-1/2 right-0 w-1/2 flex justify-center items-center">
                    <div className="w-32 h-32"><match.awayLogo className="w-full h-full"/></div>
                </div>
            </div>

            <div className="p-6 bg-background text-foreground z-10">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold">{match.home}</h2>
                    <span className="text-2xl font-light">vs</span>
                    <h2 className="text-3xl font-bold">{match.away}</h2>
                </div>
                 <div className="text-center mt-4">
                    <p className="font-semibold text-lg">{new Date(match.date).toLocaleDateString('de-CH', { weekday: 'long', day: '2-digit', month: '2-digit' })} - {match.time} Uhr</p>
                    <p className="text-sm text-muted-foreground">{match.location}</p>
                </div>
                {sponsorLogo && <img src={sponsorLogo} alt="Sponsor" className="h-10 mx-auto mt-4"/>}
                 {customText && <p className="text-center text-sm font-semibold mt-2">{customText}</p>}
            </div>
        </div>
    );
};


const ClassicTemplate = ({ match, primaryColor, secondaryColor, sponsorLogo, customText }) => {
    return (
        <div className="relative w-full h-full font-sans bg-gray-100 text-gray-800 flex flex-col p-8 border-4" style={{borderColor: primaryColor}}>
            <header className="text-center mb-6">
                <h1 className="text-4xl font-bold font-headline" style={{color: primaryColor}}>{match.league}</h1>
            </header>
            
            <main className="flex-1 flex flex-col justify-center items-center">
                <div className="text-center mb-6">
                     <div className="w-24 h-24 mx-auto mb-2"><match.homeLogo className="w-full h-full"/></div>
                    <h2 className="text-3xl font-bold">{match.home}</h2>
                </div>
                
                 <div className="text-2xl font-bold my-4" style={{color: secondaryColor}}>VS</div>

                <div className="text-center mt-6">
                    <div className="w-24 h-24 mx-auto mb-2"><match.awayLogo className="w-full h-full"/></div>
                    <h2 className="text-3xl font-bold">{match.away}</h2>
                </div>
            </main>

            <footer className="text-center mt-8">
                 <p className="text-xl font-semibold">{new Date(match.date).toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                 <p className="text-lg">{match.time} Uhr @ {match.location}</p>
                 {customText && <p className="mt-4 text-base font-medium p-2 rounded-md" style={{backgroundColor: `${primaryColor}22`}}>{customText}</p>}
                 {sponsorLogo && <img src={sponsorLogo} alt="Sponsor" className="h-12 mx-auto mt-4"/>}
            </footer>
        </div>
    );
};

export const MatchFlyer = ({ match, template, primaryColor, secondaryColor, sponsorLogo, customText }) => {
    const templates = {
        pulse: PulseTemplate,
        clash: ClashTemplate,
        classic: ClassicTemplate,
    };

    const SelectedTemplate = templates[template] || PulseTemplate;

    return <SelectedTemplate match={match} primaryColor={primaryColor} secondaryColor={secondaryColor} sponsorLogo={sponsorLogo} customText={customText} />;
};

