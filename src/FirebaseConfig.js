import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB2Mk7xEWcf0iwlPDos7jZAESdtIcvq1qE",
  authDomain: "popularsiterecreation.firebaseapp.com",
  projectId: "popularsiterecreation",
  storageBucket: "popularsiterecreation.appspot.com",
  messagingSenderId: "954536702091",
  appId: "1:954536702091:web:27fa2b7214da0932ed248e",
  measurementId: "G-LN15HHRJ6Z",
};

const app = firebase.initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
//const firestore = firebase.firestore();
const db = getFirestore(app);
//const auth = getAuth(app);
const storage = getStorage(app);

export { db, app, analytics, storage, firebase };
