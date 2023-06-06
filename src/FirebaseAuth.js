import { firebase } from "./FirebaseConfig";
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";

const auth = firebase.auth();

function logoutUser() {
  return auth.signOut();
}

function login() {
  const provider = new GoogleAuthProvider();

  return signInWithPopup(auth, provider);
}

function subscribeToAuthChanges(handleAuthChange) {
  onAuthStateChanged(auth, (user) => {
    handleAuthChange(user);
  });
}

const FirebaseAuth = {
  logoutUser,
  login,
  subscribeToAuthChanges,
};

export default FirebaseAuth;
