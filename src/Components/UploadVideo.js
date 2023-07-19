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
import { ReactComponent as X } from "../SVGs/x.svg";
import { serverTimestamp } from "firebase/firestore";

function UploadVideo({ setUploadVideo, formatVideos }) {
  const { userStore } = useContext(StoreContext);
  const [user] = userStore;
  const [videoStore, setVideoStore] = useState(null);
  const [disableUpload, setDisableUpload] = useState(false);
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
  const videoFileButtonRef = useRef(null);
  const textareaContainerRef = useRef(null);
  const arrowTipRef = useRef(null);
  const arrowLineRef = useRef(null);
  const arrowUnderlineRef = useRef(null);
  const smokeRef = useRef(null);
  const strokeRef = useRef(null);
  const speedLinesRef = useRef(null);
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
      const url = await uploadFile(videoStore);
      const urls = await uploadImages(images, url);
      const info = {
        duration: duration,
        views: 0,
        title: title,
        description: description,
        scrubImages: urls,
        thumbnail: urls[0],
        user: user.uid,
      };

      FirebaseFirestore.uploadVideo(tempID[0], url, info);
      info.time = await serverTimestamp();
      formatVideos([info]);
    } catch (error) {
      console.log(error);
    }
  }

  async function uploadImages(arr, link) {
    const promises = [];
    for (let i = 0; i < arr.length; i++) {
      const uploadRef = ref(
        fireStorage,
        `images/${Date.now()}${Math.floor(Math.random() * 9)}${Math.floor(
          Math.random() * 9
        )}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}`
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
        smokeRef.current.classList.toggle("endAnimation");
        arrowTipRef.current.classList.toggle("endAnimation");
        arrowLineRef.current.classList.toggle("endAnimation");
        setTimeout(() => {
          strokeRef.current.classList.toggle("startAnimation");
          speedLinesRef.current.classList.toggle("startAnimation");
        }, 250);
        setTimeout(() => {
          setTest2(true);
          setDisableUpload(false);
        }, 1499);
      }
    }
    setImages(imageArr);
    setTestVideo(video.src);
  }

  async function fileCheck() {
    setDisableUpload(true);
    const file = videoFileRef.current.files[0];
    const regexTest = /video\//;
    startTransition(() => setImages([]));
    try {
      if (file.size > 100000000 || !regexTest.test(file.type)) {
        alert("too large or wrong file type");
        videoFileRef.current.value = "";
        return;
      }
    } catch (error) {
      console.log(error);
      startTransition(() => {
        setDisableUpload(false);
        setUploadVideo(false);
      });
      alert("Something went wrong. Try again.");
      return;
    }
    videoFileButtonRef.current.classList.toggle("startAnimation");
    speedLinesRef.current.classList.toggle("startAnimation");
    arrowUnderlineRef.current.classList.toggle("startAnimation");
    smokeRef.current.classList.toggle("startAnimation");
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
        reader.onerror = (error) => reject(() => console.log(error));
      });
    const getImages = await videoDuration(file);
    getImages();
    setVideoStore(file);
  }

  // sets the height of the text area based on the height of its content
  function setTextAreaHeight(event) {
    textareaContainerRef.current.style.height = "0px";
    const tempHeight = event.target.scrollHeight;
    const height = Math.floor(tempHeight / 16);
    textareaContainerRef.current.style.height =
      Math.max(5, height) * 16 + 51 + "px";
  }

  // toggles active class on references
  function toggleActive() {
    arrowTipRef.current.classList.toggle("active");
    arrowLineRef.current.classList.toggle("active");
  }

  return (
    <div id="uploadVideo">
      <div id="uploadVideoContainer">
        <div id="uploadVideoHeader">
          <div>Upload videos</div>
          <div
            className="svg"
            onClick={() => startTransition(() => setUploadVideo(false))}
          >
            <X />
          </div>
        </div>
        <div id="uploadVideoBody">
          {!test2 && (
            <div
              id="videoFileInputContainer"
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleActive();
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleActive();
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                if (disableUpload) return;
                e.preventDefault();
                e.stopPropagation();
                toggleActive();
                videoFileRef.current.files = e.dataTransfer.files;
                fileCheck();
              }}
            >
              <label
                htmlFor="videoFileInput"
                onClick={(e) => {
                  if (!e.target.classList.contains("ignore") || disableUpload) {
                    e.preventDefault();
                  }
                }}
                id="videoFileInputInnerContainer"
              >
                <label htmlFor="videoFileInput" id="circle" className="ignore">
                  <div id="arrowGroup" className="ignore">
                    <div id="arrow" className="ignore">
                      <div
                        id="arrowTip"
                        ref={arrowTipRef}
                        className="ignore"
                      ></div>
                      <div id="smoke" ref={smokeRef} className="ignore"></div>
                      <div
                        id="arrowLine"
                        ref={arrowLineRef}
                        className="ignore"
                      ></div>
                    </div>
                    <div
                      id="arrowUnderline"
                      ref={arrowUnderlineRef}
                      className="ignore"
                    ></div>
                  </div>
                  <div id="speedLines" ref={speedLinesRef} className="ignore">
                    <img
                      className="ignore"
                      alt="speed lines"
                      src="https://www.gstatic.com/youtube/img/creator/uploads/speed_line_darkmode.svg"
                    />
                  </div>
                  <div id="burst" className="ignore">
                    <div id="stroke" ref={strokeRef} className="ignore"></div>
                  </div>
                </label>
                <div>Drag and drop video files to upload</div>
                <div>
                  <label
                    id="videoFileInputButton"
                    ref={videoFileButtonRef}
                    onClick={(e) => {
                      e.target.classList.add("clicked");
                      if (disableUpload) {
                        e.preventDefault();
                      }
                    }}
                    onAnimationEnd={(e) => {
                      e.target.classList.remove("clicked");
                    }}
                    className="ignore"
                  >
                    SELECT FILES
                    <input
                      ref={videoFileRef}
                      type="file"
                      accept="video/*"
                      onChange={() => fileCheck()}
                      id="videoFileInput"
                      className="ignore"
                      disabled={disableUpload}
                    ></input>
                  </label>
                </div>
              </label>
            </div>
          )}
          {test2 && (
            <div id="uploadVideoFormContainer">
              <div>Details</div>
              <div>
                <label
                  htmlFor="uploadedVideoTitle"
                  id="uploadedVideoTitleContainer"
                >
                  Title (required)
                  <input
                    id="uploadedVideoTitle"
                    name="title"
                    value={title}
                    placeholder="Add a title that describes your video"
                    onChange={(e) =>
                      startTransition(() => setTitle(e.target.value))
                    }
                    required
                  ></input>
                </label>
              </div>
              <div>
                <label
                  htmlFor="uploadedVideoDescription"
                  id="uploadedVideoDescriptionContainer"
                  ref={textareaContainerRef}
                >
                  Description
                  <textarea
                    id="uploadedVideoDescription"
                    placeholder="Tell viewers about your video"
                    onChange={(e) => {
                      startTransition(() => setDescription(e.target.value));
                      setTextAreaHeight(e);
                    }}
                  ></textarea>
                </label>
              </div>
              <button
                onMouseUp={() => handleUpload()}
                ref={uploadButtonRef}
                disabled={!test2}
              >
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
            </div>
          )}
          <div>
            <video
              id="videoCanvas"
              src={testVideo}
              onLoadedDataCapture={(e) =>
                setTimeout(() => getImagesForVideo(e.target), 1000)
              }
            ></video>
          </div>
          {/*test2 &&
          images.map((image, i) => {
            const tempImage = URL.createObjectURL(image);
            return (
              <div key={i}>
                <img src={tempImage} alt="test" />
              </div>
            );
          })*/}
        </div>
      </div>
    </div>
  );
}

export default UploadVideo;
