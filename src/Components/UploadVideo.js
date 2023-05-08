import {
  useRef,
  useState,
  startTransition,
  useContext,
  useEffect,
} from "react";
import {
  ref,
  getDownloadURL,
  uploadBytesResumable,
  uploadBytes,
} from "firebase/storage";
import { storage } from "../FirebaseConfig";
import FirebaseFirestore from "../FirebaseFirestore";
import { StoreContext } from "../Components/Data";

function UploadVideo() {
  const { userStore } = useContext(StoreContext);
  const [user] = userStore;
  const [uploadProgress, setUploadProgress] = useState(-1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [images, setImages] = useState([]);
  const [test, setTest] = useState(false);
  const [test2, setTest2] = useState(false);
  const [testVideo, setTestVideo] = useState();
  const videoFileRef = useRef(null);
  const uploadButtonRef = useRef(null);
  const fireStorage = storage;

  async function handleUpload() {
    try {
      const queries = [{ field: "uid", condition: "==", value: user.uid }];
      const isCurrentUser = await FirebaseFirestore.readDocuments({
        collectionType: "users",
        queries: queries,
      });
      const tempID = isCurrentUser.docs.map((doc) => {
        return doc.id;
      });
      const url = await uploadFile(videoFileRef.current.files[0]);
      const urls = await uploadImages(images, url);

      FirebaseFirestore.uploadVideo(tempID[0], url, {
        duration: duration,
        views: 0,
        title: title,
        description: description,
        scrubImages: urls,
        thumbnail: urls[0],
      });
    } catch (error) {
      console.log(error);
    }
  }

  async function uploadImages(arr, link) {
    const promises = [];
    for (let i = 0; i < arr.length; i++) {
      const uploadRef = ref(
        fireStorage,
        `images/${Date.now()}${Math.floor(
          Math.random() * (9 - 0) + 0
        )}${Math.floor(Math.random() * (9 - 0) + 0)}${Math.floor(
          Math.random() * (9 - 0) + 0
        )}${Math.floor(Math.random() * (9 - 0) + 0)}`
      );
      promises.push(
        uploadBytes(uploadRef, arr[i], { contentType: "image/jpeg" }).then(
          async (result) => await getDownloadURL(result.ref)
        )
      );
    }
    const urlArr = await Promise.all(promises);
    return urlArr;
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

  function getImagesForVideo(video) {
    const videoDuration = video.duration;
    const imagesNeeded = videoDuration > 61 ? 12 : 6;
    const multiplier = videoDuration > 61 ? 0.083 : 0.166;
    const imageArr = [];
    for (let i = 0; i < imagesNeeded; i++) {
      (() => {
        setTimeout(() => draw(i), i * 1000);
      })(i);
    }
    function draw(i) {
      video.currentTime = Math.floor(
        (videoDuration * ((i + 1) * multiplier * 1000)) / 1000
      );
      console.log(video.currentTime);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => imageArr.push(blob), "image/jpeg", 0.1);
      if (i === imagesNeeded - 1) {
        setTest2(true);
      }
    }
    setImages(imageArr);
    setTestVideo(video.src);
  }

  async function fileCheck() {
    const file = videoFileRef.current.files[0];
    const regexTest = /video\//;
    startTransition(() => setImages([]));
    if (file.size > 100000000 || !regexTest.test(file.type)) {
      alert("too large or wrong file type");
      videoFileRef.current.value = "";
      return;
    }
    const videoDuration = (tempFile) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const media = document.createElement("video");
          media.onloadedmetadata = () => {
            resolve(() => {
              console.log("test2");
              setTestVideo(media.src);
              setTest(true);
              setDuration(Math.round(Number(media.duration)));
            });
          };
          media.src = reader.result;
        };
        reader.readAsDataURL(tempFile);
        reader.onerror = (error) => reject(error);
      });
    const getImages = await videoDuration(file);
    getImages();
  }

  useEffect(() => {
    if (test2) {
      setTimeout(() => (uploadButtonRef.current.disabled = false), 1000);
    }
  }, [test2]);
  return (
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
          <input
            id="uploadedVideoTitle"
            name="title"
            value={title}
            placeholder="Title/Video Name"
            onChange={(e) => startTransition(() => setTitle(e.target.value))}
            required
          ></input>
        </div>
        <div>
          <label htmlFor="uploadedVideoDescription">Description</label>
          <textarea
            id="uploadedVideoDescription"
            onChange={(e) =>
              startTransition(() => setDescription(e.target.value))
            }
          ></textarea>
        </div>
        <button onMouseUp={handleUpload} ref={uploadButtonRef} disabled>
          upload video
        </button>
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
        {test && (
          <div>
            <video
              src={testVideo}
              onLoadedDataCapture={(e) =>
                setTimeout(() => getImagesForVideo(e.target), 1000)
              }
            ></video>
          </div>
        )}
        {test2 &&
          images.map((image, i) => {
            return (
              <div key={i}>
                <img src={image} alt="test" />
              </div>
            );
          })}
      </div>
      <p>uploaded videos</p>
    </div>
  );
}

export default UploadVideo;
