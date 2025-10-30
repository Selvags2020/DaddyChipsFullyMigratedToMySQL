import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
 

 apiKey: "AIzaSyDqzbNaLnr4k3abV98GJIzy9jYk9R4VURY",
  authDomain: "rpatientsurvey-adeef.firebaseapp.com",
  databaseURL: "https://rpatientsurvey-adeef-default-rtdb.firebaseio.com",
  projectId: "rpatientsurvey-adeef",
  storageBucket: "rpatientsurvey-adeef.firebasestorage.app",
  messagingSenderId: "178823786604",
  appId: "1:178823786604:web:c557d03767359da8f3a849",
  measurementId: "G-J24GQZPNH0"
}
// Initialize Firebase only if it hasn't been initialized already
let app;
let auth;
let database;
let storage;

if (typeof window !== "undefined") {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  database = getDatabase(app);
    storage = getStorage(app);
}

export { auth, database ,storage};