
'use server';

import nodemailer from 'nodemailer';

interface MailOptions {
    to: string;
    subject: string;
    text?: string;
    html: string;
}

export async function sendMail({ to, subject, text, html }: MailOptions) {
    const smtpPort = Number(process.env.SMTP_PORT);

    // If SMTP host is not configured, simulate email sending by logging to console
    if (!process.env.SMTP_HOST) {
        console.warn("****************************************************************");
        console.warn("⚠️ SMTP_HOST not set. Email will not be sent, only logged.");
        console.warn("To enable email sending, configure SMTP variables in .env.local");
        console.warn("****************************************************************");
        console.log("--- Email Simulation ---");
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body (HTML): ${html}`);
        console.log("------------------------");
        // Return a mock success response to prevent calling functions from failing
        return { messageId: `simulated-${Date.now()}`};
    }

    // These credentials should be in your .env.local file
    const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: smtpPort,
        secure: smtpPort === 465, // `secure: true` is only for port 465. Other ports use STARTTLS.
        requireTLS: smtpPort !== 465, // Explicitly require STARTTLS for other ports like 587
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            // Do not fail on invalid certs. Useful for development with self-signed certs.
            // IMPORTANT: Remove this in production.
            rejectUnauthorized: false
        }
    });
    
    try {
        console.log(`[Amigoal Email Service] Attempting to authenticate with user: ${process.env.SMTP_USER}`);
        await transport.verify();
        console.log("[Amigoal Email Service] ✅ SMTP connection verified successfully.");
        
        const info = await transport.sendMail({
            from: '"Amigoal" <info@amigoal.ch>',
            to,
            subject,
            text,
            html,
        });

        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error: any) {
        // Log the detailed error for better debugging
        console.error('[Amigoal Email Service] ❌ Error sending email:', error);
        // Re-throw a more informative error to the caller
        throw new Error(`Could not send email. Reason: ${error.message}`);
    }
}
