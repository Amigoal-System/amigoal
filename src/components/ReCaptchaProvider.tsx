
'use client';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import React from 'react';

// In a real app, you would get this key from your environment variables.
// It's safe to expose the site key in the frontend.
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || 'your_site_key_here';


export const ReCaptchaProvider = ({ children }: { children: React.ReactNode }) => {
    // Only render the provider if a key is available, otherwise it will throw an error.
    if (!RECAPTCHA_SITE_KEY || RECAPTCHA_SITE_KEY === 'your_site_key_here') {
        return <>{children}</>;
    }

    return (
        <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
            {children}
        </GoogleReCaptchaProvider>
    );
};
