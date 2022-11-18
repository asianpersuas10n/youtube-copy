import { useEffect, useRef, useState } from "react";
import Controls from "../Components/Controls";
import video from "../TestVideo/testVideo.mp4";

function Watch() {
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

  //handles playing and pausing

  const handlePlayPause = () => {
    videoElement.paused ? videoElement.play() : videoElement.pause();
  };

  //keydown shortcuts

  const handleKeyDown = (e) => {
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

  const handleTimeline = () => {
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

  //sets up reference to video on page mount

  useEffect(() => {
    setVideoElement(videoRef.current);
    videoRef.current.textTracks[0].mode = "hidden";
    //delete this when cc is finished
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

  return (
    <div id="watch" tabIndex={0} onKeyDown={handleKeyDown}>
      <div
        className={`videoContainer ${theaterBool ? "theater" : ""} ${
          fullscreenBool ? "fullscreen" : ""
        }`}
        ref={videoContainerRef}
      >
        <video
          autoPlay
          ref={videoRef}
          id="video"
          src={video}
          onClick={() => handlePlayPause()}
          onTimeUpdate={handleTimeline}
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
