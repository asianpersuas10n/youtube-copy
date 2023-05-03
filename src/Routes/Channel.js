import Navbar from "../Components/Navbar";
import { useRef, useState, startTransition, useContext } from "react";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { storage } from "../FirebaseConfig";
import FirebaseFirestore from "../FirebaseFirestore";
import { StoreContext } from "../Components/Data";
import { arrayUnion } from "firebase/firestore";

function Channel() {
  const { userStore } = useContext(StoreContext);
  const [user] = userStore;
  const [uploadProgress, setUploadProgress] = useState(-1);
  const videoFileRef = useRef(null);
  const fireStorage = storage;

  async function handleUpload() {
    try {
      let tempID;
      const queries = [{ field: "uid", condition: "==", value: user.uid }];
      const isCurrentUser = await FirebaseFirestore.readDocuments({
        collectionType: "users",
        queries: queries,
      });
      const userData = isCurrentUser.docs.map((doc) => {
        tempID = doc.id;
        return doc.data();
      });
      const url = await uploadFile(
        videoFileRef.current.files[0],
        setUploadProgress
      );
      FirebaseFirestore.uploadVideo(tempID, { videos: arrayUnion(url) }, {});
    } catch (error) {
      console.log(error);
    }
  }

  async function uploadFile(file) {
    if (file === null) {
      alert("no file");
      return;
    }
    const uploadRef = ref(
      fireStorage,
      `videos/${Date.now()}${Math.floor(
        Math.random() * (9 - 0) + 0
      )}${Math.floor(Math.random() * (9 - 0) + 0)}${Math.floor(
        Math.random() * (9 - 0) + 0
      )}${Math.floor(Math.random() * (9 - 0) + 0)}`
    );

    const uploadTask = uploadBytesResumable(uploadRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        console.log(progress);
        startTransition(() => {
          setUploadProgress(progress);
        });
      },
      (error) => {
        console.log(error);
      }
    );

    return uploadTask.then(async () => {
      const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

      return downloadUrl;
    });
  }

  function fileCheck() {
    const file = videoFileRef.current.files[0];
    const regexTest = /video\//;
    console.log(file, file.size > 100000000 || !regexTest.test(file.type));
    if (file.size > 100000000 || !regexTest.test(file.type)) {
      alert("too large or wrong file type");
      videoFileRef.current.value = "";
    }
  }

  return (
    <div id="channel">
      <Navbar />
      <div>
        <div>
          <div>
            <p>drag video here</p>
            <div>
              <input
                ref={videoFileRef}
                type="file"
                accept="video/*"
                onChange={() => fileCheck()}
              ></input>
            </div>
          </div>
          <div>
            <label htmlFor="uploadedVideoTitle">Title (required)</label>
            <input id="uploadedVideoTitle"></input>
          </div>
          <div>
            <label htmlFor="uploadedVideoDescription">Description</label>
            <textarea id="uploadedVideoDescription"></textarea>
          </div>
          <button onMouseUp={handleUpload}>upload video</button>
          {uploadProgress > -1 && uploadProgress < 100 && (
            <div>
              <label htmlFor="file">Upload Progress:</label>
              <progress id="file" value={uploadProgress} max="100">
                {uploadProgress}%
              </progress>
              <span>{uploadProgress}%</span>
            </div>
          )}
          {uploadProgress === 100 && (
            <div>
              <span>Upload Complete</span>
            </div>
          )}
        </div>
        <p>uploaded videos</p>
      </div>
    </div>
  );
}

export default Channel;
