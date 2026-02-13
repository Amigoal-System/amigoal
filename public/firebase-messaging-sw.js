
// Check if Firebase is already initialized
if (typeof self.firebase === 'undefined' || !self.firebase.apps.length) {
    self.importScripts('https://www.gstatic.com/firebasejs/9.17.1/firebase-app-compat.js');
    self.importScripts('https://www.gstatic.com/firebasejs/9.17.1/firebase-messaging-compat.js');

    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID",
        measurementId: "YOUR_MEASUREMENT_ID"
    };

    self.firebase.initializeApp(firebaseConfig);
}

if (typeof self.firebase.messaging === 'function') {
    const messaging = self.firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);
        const notificationTitle = payload.notification.title;
        const notificationOptions = {
            body: payload.notification.body,
            icon: '/amigoal-logo.png' 
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    });
} else {
    console.error('Firebase messaging is not available in the service worker.');
}

// self.addEventListener('push', (event) => {
//     const data = event.data.json();
//     const title = data.notification.title || 'New Message';
//     const options = {
//         body: data.notification.body || 'You have a new message.',
//         icon: data.notification.image || '/amigoal-logo.png'
//     };
//     event.waitUntil(self.registration.showNotification(title, options));
// });
