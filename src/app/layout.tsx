
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import * as React from 'react';
import { CookieBanner } from '@/components/ui/cookie-banner';
import { ReCaptchaProvider } from '@/components/ReCaptchaProvider';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';

const APP_NAME = "Amigoal";
const APP_DESCRIPTION = "The ultimate platform for soccer clubs and players.";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: "default",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#4285F4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning={true}>
      <head>
        {/* The dynamic fonts will be injected here by the branding page logic */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Roboto:wght@400;700&family=Lato:wght@400;700&family=Montserrat:wght@400;700&family=Oswald:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <ReCaptchaProvider>
              {children}
            </ReCaptchaProvider>
            <Toaster />
            <CookieBanner />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
