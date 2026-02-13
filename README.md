# Firebase Studio - Amigoal

This is a Next.js starter project for Amigoal, a comprehensive soccer club management platform built in Firebase Studio.

## Getting Started for Local Development or Deployment

To get this application running on your local machine or another hosting provider, you need to configure your environment variables. These variables are essential for connecting to backend services like Firebase and Google AI.

### 1. Create Your Local Environment File

First, rename the example environment file `.env.example` to `.env.local`. This file will hold all your secret keys and configurations. **It is crucial to use `.env.local` as it is excluded from Git version control, ensuring your secrets are not exposed.**

```bash
mv .env.example .env.local
```

### 2. Configure Firebase

#### a. Get Client-Side Configuration

1.  Navigate to your [Firebase Console](https://console.firebase.google.com/).
2.  Select your project (or create a new one).
3.  Go to **Project Settings** (click the gear icon ⚙️).
4.  In the "Your apps" card, select the web app for this project.
5.  Under "Firebase SDK snippet", select **Config**.
6.  Copy the key-value pairs from the `firebaseConfig` object into the corresponding `NEXT_PUBLIC_FIREBASE_*` variables in your `.env.local` file.

#### b. Get Server-Side Service Account Key

The backend (Genkit) requires a service account to interact with Firebase services securely.

1.  In your Firebase Project Settings, go to the **Service accounts** tab.
2.  Click **Generate new private key**. A JSON file will be downloaded.
3.  **Crucial Step:** You must encode the **entire content** of this JSON file into a **Base64 string**. You can use an online tool or a command-line utility:
    *   **macOS/Linux:** `base64 -i [your-downloaded-file].json`
    *   **Windows (PowerShell):** `[Convert]::ToBase64String([System.IO.File]::ReadAllBytes("[your-downloaded-file].json"))`
4.  Copy the resulting single-line Base64 string and paste it as the value for `FIREBASE_SERVICE_ACCOUNT_KEY` in your `.env.local` file.

### 3. Configure Google AI (Gemini)

1.  Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Create or copy your API key.
3.  Paste this key as the value for `NEXT_PUBLIC_GEMINI_API_KEY` in your `.env.local` file.

### 4. Configure Google reCAPTCHA v3

1.  Go to the [reCAPTCHA Admin Console](https://g.co/recaptcha/v3).
2.  Register your site and get your **Site Key** and **Secret Key**.
3.  Paste the Site Key as the value for `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`.
4.  Paste the Secret Key as the value for `RECAPTCHA_SECRET_KEY`.


### 5. Install Dependencies and Run

Once all your environment variables in `.env.local` are set, you can install the necessary packages and start the development server.

```bash
npm install
npm run dev
```

The application will now be running on `http://localhost:3000`.

## Key Technologies

*   **Framework**: Next.js (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **UI Components**: shadcn/ui
*   **Backend & AI**: Genkit (with Google AI)
*   **Database**: Firebase Firestore
*   **Authentication**: Firebase Auth
