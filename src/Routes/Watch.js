import Navbar from "../Components/Navbar";
import { useEffect, useRef, useState, useContext } from "react";
import Controls from "../Components/Controls";
import video from "../TestVideo/testVideo.mp4";
import { StoreContext } from "../Components/Data";

function Watch() {
  const { searchFocusStore } = useContext(StoreContext);
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
  const videoStorage =
    "https://firebasestorage.googleapis.com/v0/b/popularsiterecreation.appspot.com/o/testVideo.mp4?alt=media&token=cbfa2e6b-b6f4-4d39-99bf-1907e947c0d7";
  //need this for later when uploading just to get link FirebaseStorage.downloadVideo("testVideo.mp4");

  //handles playing and pausing

  const handlePlayPause = () => {
    videoElement.paused ? videoElement.play() : videoElement.pause();
  };

  //keydown shortcuts for the video player

  const handleKeyDown = (e) => {
    if (searchFocus) return;
    const keyPress = e.key.toLowerCase();
    switch (keyPress) {
      case " ":
      case "k":
        handlePlayPause();
        break;
      case "esc":
      case "escape":
        setFullscreenBool(false);
        break;
      case "f":
        fullscreenBool ? setFullscreenBool(false) : setFullscreenBool(true);
        break;
      case "t":
        if (fullscreenBool) {
          setFullscreenBool(false);
        }
        theaterBool ? setTheaterBool(false) : setTheaterBool(true);
        break;
      case "m":
        volumeCheck(true);
        break;
      case "arrowup":
        const volumeUp = (Math.floor(volumeValue / 0.05) + 1) * 0.05;
        if (volumeUp > 1) {
          return;
        }
        setVolumeValue(volumeUp);
        break;
      case "arrowdown":
        const volumeDown = (Math.floor(volumeValue / 0.05) - 1) * 0.05;
        if (volumeDown < 0) {
          return;
        }
        setVolumeValue(volumeDown);
        break;
      case "c":
        ccBool ? setCCBool(false) : setCCBool(true);
        break;
      default:
        return;
    }
  };

  // sets up logic for timeline

  const handleTimedisplay = () => {
    setVideoElement(videoRef.current);
    if (videoElement) {
      let videoTotalDuration = Number(videoElement.duration);
      let videoDuration = Number(videoElement.currentTime);
      setVideoTotalDuration(videoTotalDuration);
      setCurrentTimeline(videoDuration);
    }
  };

  //logic for keeping css in working order when entering or exiting fullscreen

  /*
   * Mini-player functionality will be added later when the home page is created
   */

  useEffect(() => {
    if (fullscreenBool) {
      if (theaterBool) {
        setWasDefault(false);
      } else {
        setWasDefault(true);
      }
      setTheaterBool(false);
      videoContainerRef.current.requestFullscreen();
    } else {
      if (!wasDefault) {
        setTheaterBool(true);
      }
      document.exitFullscreen().catch((error) => Promise.resolve(error));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullscreenBool]);

  //sets up reference to video on page mount and adds event listeners

  useEffect(() => {
    setVideoElement(videoRef.current);
    videoRef.current.textTracks[0].mode = "hidden";
    /*
      
    delete this when cc is finished
    ||
    ||
    ||
    ||
    \/
    */
    setCCExist(false);
  }, []);

  //Logic for volume

  const volumeCheck = (wasMuteClicked) => {
    if (wasMuteClicked) {
      muteBool ? unmute() : mute();
    } else {
      if (volumeValue > 0.0001) {
        setMuteBool(false);
      }
      if (muteBool) {
        return;
      }
      volumeValue > 0.5 ? setHighVolumeBool(true) : setHighVolumeBool(false);
      volumeValue == 0 ? slideToMute() : setMuteBool(false);
      videoRef.current.volume = volumeValue;
    }
  };

  const slideToMute = () => {
    setMuteBool(true);
    setVolumeBeforeMute(1);
  };

  const mute = () => {
    setVolumeBeforeMute(volumeValue);
    setMuteBool(true);
    setVolumeValue(0);
  };

  const unmute = () => {
    setMuteBool(false);
    setVolumeValue(volumeBeforeMute);
  };

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
        setFullscreenBool(false);
      }
    });
    return document.addEventListener("fullscreenchange", () => {
      if (
        !document.webkitIsFullScreen &&
        !document.mozFullScreen &&
        !document.msFullscreenElement
      ) {
        setFullscreenBool(false);
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
          onPlay={() => setPlayBool(true)}
          onPause={() => setPlayBool(false)}
          onDoubleClick={() =>
            fullscreenBool ? setFullscreenBool(false) : setFullscreenBool(true)
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
        <img className="thumbnail" ref={thumbnailRef}></img>
      </div>
    </div>
  );
}

export default Watch;
