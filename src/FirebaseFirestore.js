import { firebase } from "./FirebaseConfig";
import {
  addDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  getCountFromServer,
} from "firebase/firestore";

const firestore = firebase.firestore();

function createDocument(collectionType, information) {
  return addDoc(collection(firestore, collectionType), information);
}

async function readDocuments({
  collectionType,
  queries,
  orderBy,
  startAfter,
  limits,
}) {
  const collectionRef = collection(firestore, collectionType);
  const queryConstraints = [];

  if (queries && queries.length > 0) {
    for (const query of queries) {
      queryConstraints.push(where(query.field, query.condition, query.value));
    }
  }

  if (orderBy) {
    queryConstraints.push(orderBy);
  }

  if (startAfter) {
    queryConstraints.push(startAfter);
  }

  if (limits) {
    queryConstraints.push(limits);
  }

  const fireStoreQuery = query(collectionRef, ...queryConstraints);

  return getDocs(fireStoreQuery);
}

function updateDocument(collectionType, id, information) {
  return updateDoc(doc(collection(firestore, collectionType), id), information);
}

async function uploadVideo(id, url, information) {
  const newInformation = information;
  newInformation.time = serverTimestamp();
  newInformation.url = url;
  await updateDoc(doc(collection(firestore, "users"), id), {
    videos: arrayUnion(url),
  });
  await createDocument("videos", newInformation);
}

async function count(collectionType) {
  const collectionCount = await getCountFromServer(
    collection(firestore, collectionType)
  );
  return collectionCount;
}

const FirebaseFirestore = {
  createDocument,
  readDocuments,
  updateDocument,
  uploadVideo,
  count,
};

export default FirebaseFirestore;
