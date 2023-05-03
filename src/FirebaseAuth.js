import { firebase } from "./FirebaseConfig";
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";

const auth = firebase.auth();

const logoutUser = () => {
  return auth.signOut();
};

const login = () => {
  const provider = new GoogleAuthProvider();

  return signInWithPopup(auth, provider);
};

const subscribeToAuthChanges = (handleAuthChange) => {
  onAuthStateChanged(auth, (user) => {
    handleAuthChange(user);
  });
};

const FirebaseAuth = {
  logoutUser,
  login,
  subscribeToAuthChanges,
};

export default FirebaseAuth;
