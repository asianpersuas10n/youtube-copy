import {
  useEffect,
  useRef,
  useState,
  useContext,
  startTransition,
} from "react";
import Navbar from "../Components/Navbar";
import Controls from "../Components/Controls";
import CommentSection from "../Components/CommentSection";
import video from "../TestVideo/testVideo.mp4";
import { StoreContext } from "../Components/Data";
import { storage } from "../FirebaseConfig";
import { getDownloadURL, ref } from "firebase/storage";

function Watch() {
  const { searchFocusStore, userStore, inputFocusStore } =
    useContext(StoreContext);
  const [inputFocus] = inputFocusStore;
  const [user] = userStore;
  const [searchFocus] = searchFocusStore;
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const thumbnailRef = useRef(null);
  const [videoElement, setVideoElement] = useState(videoRef.current);
  const [playBool, setPlayBool] = useState(false);
  const [videoDuration, setVideoTotalDuration] = useState(0);
  const [currentTimeline, setCurrentTimeline] = useState(0);
  const [theaterBool, setTheaterBool] = useState(false);
  const [fullscreenBool, setFullscreenBool] = useState(false);
  const [wasDefault, setWasDefault] = useState(true);
  const [muteBool, setMuteBool] = useState(false);
  const [highVolumeBool, setHighVolumeBool] = useState(true);
  const [volumeValue, setVolumeValue] = useState(1);
  const [volumeBeforeMute, setVolumeBeforeMute] = useState(0);
  const [ccBool, setCCBool] = useState(false);
  const [ccExist, setCCExist] = useState(true);
  const [videoStorage, setVideoStorage] = useState("");
  const [videoID, setVideoID] = useState();

  //grabs id from firebase video url

  async function pageSetUp() {
    const reference = window.location.pathname.replace("/watch/", "");
    console.log(reference);
    const test = "testVideo.mp4";
    const getURL = await getDownloadURL(ref(storage, test));
    setVideoID(test);
    startTransition(() => setVideoStorage(getURL));
  }

  //handles playing and pausing

  function handlePlayPause() {
    videoElement.paused ? videoElement.play() : videoElement.pause();
  }

  //keydown shortcuts for the video player

  function handleKeyDown(e) {
    if (searchFocus || inputFocus) return;
    const keyPress = e.key.toLowerCase();
    switch (keyPress) {
      case " ":
      case "k":
        handlePlayPause();
        break;
      case "esc":
      case "escape":
        startTransition(() => setFullscreenBool(false));
        break;
      case "f":
        fullscreenBool
          ? startTransition(() => setFullscreenBool(false))
          : startTransition(() => setFullscreenBool(true));
        break;
      case "t":
        if (fullscreenBool) {
          startTransition(() => setFullscreenBool(false));
        }
        theaterBool
          ? startTransition(() => setTheaterBool(false))
          : startTransition(() => setTheaterBool(true));
        break;
      case "m":
        volumeCheck(true);
        break;
      case "arrowup":
        const volumeUp = (Math.floor(volumeValue / 0.05) + 1) * 0.05;
        if (volumeUp > 1) {
          return;
        }
        startTransition(() => setVolumeValue(volumeUp));
        break;
      case "arrowdown":
        const volumeDown = (Math.floor(volumeValue / 0.05) - 1) * 0.05;
        if (volumeDown < 0) {
          return;
        }
        startTransition(() => setVolumeValue(volumeDown));
        break;
      case "c":
        ccBool
          ? startTransition(() => setCCBool(false))
          : startTransition(() => setCCBool(true));
        break;
      default:
        return;
    }
  }

  // sets up logic for timeline

  function handleTimedisplay() {
    startTransition(() => setVideoElement(videoRef.current));
    if (videoElement) {
      let videoTotalDuration = Number(videoElement.duration);
      let videoDuration = Number(videoElement.currentTime);
      startTransition(() => setVideoTotalDuration(videoTotalDuration));
      startTransition(() => setCurrentTimeline(videoDuration));
    }
  }

  //logic for keeping css in working order when entering or exiting fullscreen

  /*
   * Mini-player functionality will be added later when the home page is created
   */

  useEffect(() => {
    if (fullscreenBool) {
      if (theaterBool) {
        startTransition(() => setWasDefault(false));
      } else {
        startTransition(() => setWasDefault(true));
      }
      startTransition(() => setTheaterBool(false));
      videoContainerRef.current.requestFullscreen();
    } else {
      if (!wasDefault) {
        startTransition(() => setTheaterBool(true));
      }
      document.exitFullscreen().catch((error) => Promise.resolve(error));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullscreenBool]);

  //sets up reference to video on page mount and adds event listeners

  useEffect(() => {
    pageSetUp();
    startTransition(() => setVideoElement(videoRef.current));
    videoRef.current.textTracks[0].mode = "hidden";

    /*
      
    delete this when cc is finished
    ||
    ||
    ||
    ||
    \/
    */
    startTransition(() => setCCExist(false));
  }, []);

  //Logic for volume

  function volumeCheck(wasMuteClicked) {
    if (wasMuteClicked) {
      muteBool ? unmute() : mute();
    } else {
      if (volumeValue > 0.0001) {
        startTransition(() => setMuteBool(false));
      }
      if (muteBool) {
        return;
      }
      volumeValue > 0.5
        ? startTransition(() => setHighVolumeBool(true))
        : startTransition(() => setHighVolumeBool(false));
      volumeValue == 0
        ? slideToMute()
        : startTransition(() => setMuteBool(false));
      videoRef.current.volume = volumeValue;
    }
  }

  function slideToMute() {
    startTransition(() => setMuteBool(true));
    startTransition(() => setVolumeBeforeMute(1));
  }

  function mute() {
    startTransition(() => setVolumeBeforeMute(volumeValue));
    startTransition(() => setMuteBool(true));
    startTransition(() => setVolumeValue(0));
  }

  function unmute() {
    startTransition(() => setMuteBool(false));
    startTransition(() => setVolumeValue(volumeBeforeMute));
  }

  useEffect(() => {
    videoRef.current.muted = !videoRef.current.muted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [muteBool]);

  //Logic for captions

  useEffect(() => {
    const captions = videoRef.current.textTracks[0];
    captions.mode = ccBool ? "showing" : "hidden";
  }, [ccBool]);

  //fully exit fullscreen

  useEffect(() => {
    document.addEventListener("fullscreenchange", () => {
      if (
        !document.webkitIsFullScreen &&
        !document.mozFullScreen &&
        !document.msFullscreenElement
      ) {
        startTransition(() => setFullscreenBool(false));
      }
    });
    return document.addEventListener("fullscreenchange", () => {
      if (
        !document.webkitIsFullScreen &&
        !document.mozFullScreen &&
        !document.msFullscreenElement
      ) {
        startTransition(() => setFullscreenBool(false));
      }
    });
  }, []);

  return (
    <div id="watch" tabIndex={0} onKeyDown={handleKeyDown}>
      <Navbar />
      <div
        className={`videoContainer ${theaterBool ? "theater" : ""} ${
          fullscreenBool ? "fullscreen" : ""
        }`}
        ref={videoContainerRef}
      >
        <video
          ref={videoRef}
          id="video"
          src={videoStorage}
          onClick={() => handlePlayPause()}
          onTimeUpdate={() => handleTimedisplay()}
          onPlay={() => startTransition(() => setPlayBool(true))}
          onPause={() => startTransition(() => setPlayBool(false))}
          onDoubleClick={() =>
            fullscreenBool
              ? startTransition(() => setFullscreenBool(false))
              : startTransition(() => setFullscreenBool(true))
          }
        >
          <track
            kind="captions"
            srcLang="en"
            src={() => {
              // set up logic for a track to be here
            }}
          ></track>
        </video>
        <Controls
          videoElement={videoElement}
          playBool={playBool}
          setPlayBool={setPlayBool}
          handlePlayPause={handlePlayPause}
          videoDuration={videoDuration}
          currentTimeline={currentTimeline}
          theaterBool={theaterBool}
          setTheaterBool={setTheaterBool}
          fullscreenBool={fullscreenBool}
          setFullscreenBool={setFullscreenBool}
          muteBool={muteBool}
          setMuteBool={setMuteBool}
          highVolumeBool={highVolumeBool}
          setHighVolumeBool={setHighVolumeBool}
          volumeValue={volumeValue}
          setVolumeValue={setVolumeValue}
          volumeCheck={volumeCheck}
          ccBool={ccBool}
          setCCBool={setCCBool}
          ccExist={ccExist}
          setCCExist={setCCExist}
          thumbnailRef={thumbnailRef}
          videoContainerRef={videoContainerRef}
        />
        <img className="thumbnail" ref={thumbnailRef} alt="thumbnail"></img>
      </div>
      {videoID && <CommentSection id={videoID} user={user} />}
    </div>
  );
}

export default Watch;
