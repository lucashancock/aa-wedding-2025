// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB9fRMVVufRCh5TXz1SCoJAAOAT_ZQ6KnI",
  authDomain: "aa-wedding-photo-share.firebaseapp.com",
  projectId: "aa-wedding-photo-share",
  storageBucket: "aa-wedding-photo-share.firebasestorage.app",
  messagingSenderId: "595600301415",
  appId: "1:595600301415:web:358997aad77045d6c863c2",
  measurementId: "G-QPY2E975X8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
