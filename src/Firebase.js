import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB2Mk7xEWcf0iwlPDos7jZAESdtIcvq1qE",
  authDomain: "popularsiterecreation.firebaseapp.com",
  projectId: "popularsiterecreation",
  storageBucket: "popularsiterecreation.appspot.com",
  messagingSenderId: "954536702091",
  appId: "1:954536702091:web:27fa2b7214da0932ed248e",
  measurementId: "G-LN15HHRJ6Z",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

export { db };
