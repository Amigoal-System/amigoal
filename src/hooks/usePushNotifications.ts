
'use client';

import { useState, useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getFirebaseServices } from '@/lib/firebase/client';
import { useToast } from './use-toast';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export const usePushNotifications = () => {
    const [permission, setPermission] = useState<'default' | 'granted' | 'denied'>('default');
    const { toast } = useToast();

    useEffect(() => {
        // Set initial permission state on client-side mount
        setPermission(Notification.permission);

        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
            console.warn('Firebase Messaging: Service Worker not supported.');
            return;
        }

        const { app } = getFirebaseServices();
        const messaging = getMessaging(app);

        // Request permission if not already granted or denied
        if (Notification.permission === 'default') {
            const requestPermission = async () => {
                try {
                    const permissionResult = await Notification.requestPermission();
                    setPermission(permissionResult);

                    if (permissionResult === 'granted') {
                        console.log('Notification permission granted.');
                        await setupToken();
                    } else {
                        console.log('Notification permission denied.');
                    }
                } catch (error) {
                    console.error('Error requesting notification permission:', error);
                }
            };
            requestPermission();
        } else if (Notification.permission === 'granted') {
            setupToken();
        }

        // Handle incoming messages when the app is in the foreground
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Foreground message received.', payload);
            toast({
                title: payload.notification?.title || 'Neue Benachrichtigung',
                description: payload.notification?.body || '',
            });
        });
        
        async function setupToken() {
            if (!VAPID_KEY) {
                console.error("VAPID Key for FCM is not set in environment variables.");
                return;
            }
            try {
                const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
                if (currentToken) {
                    console.log('FCM Token:', currentToken);
                    // In a real app, you would send this token to your server
                    // to associate it with the current user.
                } else {
                    console.log('No registration token available. Request permission to generate one.');
                }
            } catch (err) {
                console.error('An error occurred while retrieving token. ', err);
            }
        }
        

        return () => {
            unsubscribe();
        };

    }, [toast]);

    return { permission };
};
