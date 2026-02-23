# Cold Email & Internship Tracker

This is a responsive single-page static web app (HTML/CSS/vanilla JS) that uses Firebase Firestore to persist application entries and update them in real time.

Features
- Add application entries with company, type, position, approach, status, email date, resume version, and notes
- Real-time list of application cards (auto-updates across clients)
- Quick status updates from each card (syncs instantly to Firestore)
- Click a card to open a modal with full details
- Deployable as a static site (Netlify, Vercel)

Setup
1. Create a Firebase project at https://console.firebase.google.com/
2. In the Firebase console enable Firestore (create database in production or test mode)
3. Add a Web App in Firebase (Project settings → Your apps) and copy the config
4. Open `firebase-config.js` and replace the placeholder values with your project's config

Run locally
This is a static frontend. You can serve it locally using a simple static server. Example using `npx serve`:

```powershell
npx serve .
```

Or open `index.html` directly in your browser (for best results use a local server due to module loading).

Deploy
- On Netlify: drag & drop the folder, or connect the repo and deploy from `main` branch.
- On Vercel: `vercel` from the project folder or connect Git repository.

Notes & security
- Firestore rules: for a public static deploy, configure Firestore rules to restrict access to only authenticated users if needed. This sample uses client SDK but no auth; you should add rules in production.
- You can enable offline persistence if desired, but this app uses Firestore real-time sync for cross-client updates.
