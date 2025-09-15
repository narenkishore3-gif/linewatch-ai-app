
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "studio-6206256702-d9d62",
  "appId": "1:856301626254:web:70f73f5113289b1193fadf",
  "storageBucket": "studio-6206256702-d9d62.firebasestorage.app",
  "apiKey": "AIzaSyC9Z-MUnA614z2DHpYiJbz67KMLfw0C_wI",
  "authDomain": "studio-6206256702-d9d62.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "856301626254"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
