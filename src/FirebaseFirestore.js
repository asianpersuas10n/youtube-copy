import { firebase } from "./FirebaseConfig";
import {
  addDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";

const firestore = firebase.firestore();

const createDocument = (collectionType, information) => {
  return addDoc(collection(firestore, collectionType), information);
};

const readDocuments = async ({ collectionType, queries }) => {
  const collectionRef = collection(firestore, collectionType);
  const queryConstraints = [];

  if (queries && queries.length > 0) {
    for (const query of queries) {
      queryConstraints.push(where(query.field, query.condition, query.value));
    }
  }

  const fireStoreQuery = query(collectionRef, ...queryConstraints);

  return getDocs(fireStoreQuery);
};

const updateDocument = (collectionType, id, information) => {
  return updateDoc(doc(collection(firestore, collectionType), id), information);
};

const uploadVideo = async (id, url, information) => {
  await updateDoc(doc(collection(firestore, "users"), id), url);
  await createDocument("videos", {
    url: information,
  });
};

const FirebaseFirestore = {
  createDocument,
  readDocuments,
  updateDocument,
  uploadVideo,
};

export default FirebaseFirestore;
