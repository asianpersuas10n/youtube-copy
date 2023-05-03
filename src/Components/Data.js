import { createContext, useEffect, useState } from "react";
import { db } from "../FirebaseConfig";
import FirebaseAuth from "../FirebaseAuth";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
export const StoreContext = createContext(null);

// eslint-disable-next-line import/no-anonymous-default-export
export default ({ children }) => {
  const [searchFocus, setSearchFocus] = useState(false);
  const [userInformation, setUserInformation] = useState({});
  const [user, setUser] = useState(null);

  FirebaseAuth.subscribeToAuthChanges(setUser);

  useEffect(() => {
    console.log(user);
    databaseUserCall();
    async function databaseUserCall() {
      const userRef = collection(db, "users");
      if (await getDoc(query(userRef, where("uid", "==", user.uid)))) {
        await setDoc(doc(db, "users"), {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        });
      }
    }
  }, [user]);

  const store = {
    searchFocusStore: [searchFocus, setSearchFocus],
    userInformationStore: [userInformation, setUserInformation],
    userStore: [user, setUser],
  };

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};
