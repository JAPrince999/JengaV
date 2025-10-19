// Fix: Switched to firebase/compat to avoid module resolution conflicts with local files.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';


// ==================================================================
// IMPORTANT: PASTE YOUR FIREBASE CONFIGURATION OBJECT HERE
// You can get this from your Firebase project settings.
// ==================================================================
const firebaseConfig = {
  apiKey: "AIzaSyA0Tdi4dVnjK_pD6X-UPBwSKRgT9JwaiGY",
  authDomain: "jengav-42f63.firebaseapp.com",
  projectId: "jengav-42f63",
  storageBucket: "jengav-42f63.appspot.com",
  messagingSenderId: "757012418619",
  appId: "1:757012418619:web:a0428dc5283d171dffcc1e",
  measurementId: "G-YHQGENVEFP"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}


// Export Firebase services
// Fix: Use v8 compat syntax to get auth and firestore services.
export const auth = firebase.auth();
export const db = firebase.firestore();