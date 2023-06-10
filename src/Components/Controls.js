import { ReactComponent as Play } from "../SVGs/play.svg";
import { ReactComponent as Pause } from "../SVGs/pause.svg";
import { ReactComponent as MiniPlayer } from "../SVGs/miniPlayer.svg";
import { ReactComponent as Theater } from "../SVGs/theater.svg";
import { ReactComponent as ExitTheater } from "../SVGs/exitTheater.svg";
import { ReactComponent as Fullscreen } from "../SVGs/fullscreen.svg";
import { ReactComponent as ExitFullscreen } from "../SVGs/exitFullscreen.svg";
import { ReactComponent as HighVolume } from "../SVGs/highVolume.svg";
import { ReactComponent as LowVolume } from "../SVGs/lowVolume.svg";
import { ReactComponent as Mute } from "../SVGs/mute.svg";
import { ReactComponent as CC } from "../SVGs/closedCaption.svg";
import test from "../TestImage/test.jpeg";
import {
  useEffect,
  useRef,
  useState,
  useContext,
  startTransition,
} from "react";
import { StoreContext } from "../Components/Data";
import { Timestamp } from "firebase/firestore";

function Controls({
  videoElement,
  handlePlayPause,
  playBool,
  setPlayBool,
  videoDuration,
  currentTimeline,
  theaterBool,
  setTheaterBool,
  fullscreenBool,
  setFullscreenBool,
  muteBool,
  setMuteBool,
  highVolumeBool,
  setHighVolumeBool,
  volumeValue,
  setVolumeValue,
  volumeCheck,
  ccBool,
  setCCBool,
  ccExist,
  setCCExist,
  thumbnailRef,
  videoContainerRef,
}) {
  const { searchFocusStore } = useContext(StoreContext);
  const [searchFocus, setSearchFocus] = searchFocusStore;
  const [currentDisplayTime, setCurrentDisplayTime] = useState("00:00");
  const [videoDisplayDuration, setVideoDisplayDuration] = useState("00:00");
  const [previewTime, setPreviewTime] = useState("00:00");
  const timelineRef = useRef(null);
  const previewImgRef = useRef(null);
  const previewTimeRef = useRef(null);
  const timelineContainerRef = useRef(null);
  const volumeSliderRef = useRef(null);
  const volumeSliderContainerRef = useRef(null);
  const volumeContainerRef = useRef(null);
  let scrubbingBool = false;
  let volumeScrubBool = false;
  let previousVolume = 0;

  //let you interact with timeline;

  function handleScrubbing(e) {
    const rect = timelineContainerRef.current.getBoundingClientRect();
    const percent =
      Math.min(Math.max(0, e.pageX - rect.x), rect.width) / rect.width;
    scrubbingBool = (e.buttons & 1) === 1;
    if (scrubbingBool) {
      videoContainerRef.current.classList.add("scrubbing");
      videoElement.pause();
      startTransition(() => setPlayBool(false));
    } else {
      videoContainerRef.current.classList.remove("scrubbing");
      videoElement.currentTime = percent * videoDuration;
      if (!playBool) {
        videoElement.play();
      }
    }
    handleTimeline(e);
  }

  function handleTimeline(e) {
    const rect = timelineContainerRef.current.getBoundingClientRect();
    const percent =
      Math.min(Math.max(0, e.pageX - rect.x), rect.width) / rect.width;
    const previewImgNumber = Math.max(
      1,
      Math.floor((percent * videoDuration) / 10)
    );
    let previewImagePercent = percent;
    previewImgRef.current.src = test; // will call backend images and use previewImgNumber to decide which preview to use
    e.target.style.setProperty("--preview", percent);
    //need to implement better way to prevent overflow of video container
    if (percent > 0.925) {
      previewImagePercent = 0.925;
    } else if (percent < 0.075) {
      previewImagePercent = 0.075;
    }
    previewImgRef.current.style.setProperty("--preview", previewImagePercent);
    previewTimeRef.current.style.setProperty("--preview", previewImagePercent);
    startTransition(() => setPreviewTime(displayTime(percent * videoDuration)));
    if (scrubbingBool) {
      e.preventDefault();
      thumbnailRef.current.src = previewImgRef.current.src;
      timelineContainerRef.current.style.setProperty("--progress", percent);
    }
  }

  // interactable volume slider

  function handleVolumeChange(e) {
    const rect = volumeSliderContainerRef.current.getBoundingClientRect();
    let percent =
      Math.min(Math.max(0, e.pageX - rect.x), rect.width) / rect.width;
    volumeScrubBool = (e.buttons & 1) === 1;
    if (volumeScrubBool) {
      volumeContainerRef.current.classList.add("volumeScrub");
      videoContainerRef.current.classList.add("volumeScrub");
      volumeSliderContainerRef.current.style.setProperty(
        "--volumeProgress",
        percent
      );
      startTransition(() => setVolumeValue(percent));
      volumeCheck(false);
    } else {
      volumeContainerRef.current.classList.remove("volumeScrub");
      videoContainerRef.current.classList.remove("volumeScrub");
    }
    handleVolume(e);
  }

  function handleVolume(e) {
    const rect = volumeSliderContainerRef.current.getBoundingClientRect();
    let percent =
      Math.min(Math.max(0, e.pageX - rect.x), rect.width) / rect.width;
    if (volumeScrubBool) {
      e.preventDefault();
      if (isNaN(percent)) {
        percent = previousVolume > 0.5 ? 1 : 0;
      }
      previousVolume = percent;
      startTransition(() => setVolumeValue(percent));
      volumeCheck(false);
      volumeSliderContainerRef.current.style.setProperty(
        "--volumeProgress",
        percent
      );
    }
  }

  // displays time

  function displayTime(timeVariable) {
    let timeString = "";
    timeString +=
      Math.floor(timeVariable / 60) > 0
        ? Math.floor(timeVariable / 60) + ":"
        : "0:";
    timeString += Math.floor(timeVariable % 60) < 10 ? "0" : "";
    timeString += Math.floor(timeVariable % 60);
    return timeString.includes("NaN") ? "00:00" : timeString;
  }

  //mounts an event listener so you can scrub when off the video player and unmounts when video unmounts

  useEffect(() => {
    document.addEventListener("mouseup", (e) => {
      if (scrubbingBool) {
        handleScrubbing(e);
      } else if (volumeScrubBool) {
        handleVolumeChange(e);
      }
    });
    document.addEventListener("mousemove", (e) => {
      if (scrubbingBool) {
        handleTimeline(e);
      } else if (volumeScrubBool) {
        handleVolume(e);
      }
    });

    return () => {
      document.addEventListener("mouseup", (e) => {
        if (scrubbingBool) {
          handleScrubbing(e);
        } else if (volumeScrubBool) {
          handleVolumeChange(e);
        }
      });
      document.addEventListener("mousemove", (e) => {
        if (scrubbingBool) {
          handleTimeline(e);
        } else if (volumeScrubBool) {
          handleVolume(e);
        }
      });
    };
  });

  useEffect(() => {
    volumeSliderContainerRef.current.style.setProperty("--volumeProgress", 1);
  }, []);

  // constantly updates volume on either volume or timeline values changing

  useEffect(() => {
    volumeCheck(false);
    startTransition(() => setCurrentDisplayTime(displayTime(currentTimeline)));
    startTransition(() => setVideoDisplayDuration(displayTime(videoDuration)));

    timelineContainerRef.current.style.setProperty(
      "--progress",
      currentTimeline / videoDuration
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTimeline, videoDuration, volumeValue]);
  return (
    <div className="controls">
      <div
        className="timelineContainer"
        onMouseMove={(e) => {
          handleTimeline(e);
        }}
        onMouseUp={(e) => {
          handleScrubbing(e);
        }}
        onMouseDown={(e) => {
          handleScrubbing(e);
        }}
        ref={timelineContainerRef}
      >
        <div className="timeline" ref={timelineRef}>
          <img className="previewImage" ref={previewImgRef} alt="preview"></img>
          <div className="previewTime" ref={previewTimeRef}>
            {previewTime}
          </div>
          <div className="pointer"></div>
        </div>
      </div>
      <div className="buttons">
        <div className="divider">
          <button
            className="playButton"
            onClick={() => startTransition(() => handlePlayPause())}
          >
            {playBool ? <Pause /> : <Play />}
          </button>
          <div className="volumeContainer" ref={volumeContainerRef}>
            <button
              className="muteButton"
              onClick={() => {
                volumeCheck(true);
              }}
            >
              {muteBool ? (
                <Mute />
              ) : highVolumeBool ? (
                <HighVolume />
              ) : (
                <LowVolume />
              )}
            </button>
            <div
              className="volumeSliderContainer"
              onMouseMove={(e) => {
                handleVolume(e);
              }}
              onMouseUp={(e) => {
                handleVolumeChange(e);
              }}
              onMouseDown={(e) => {
                handleVolumeChange(e);
              }}
              ref={volumeSliderContainerRef}
            >
              <div className="volumeSlider" ref={volumeSliderRef}>
                <div className="volumePointer"></div>
              </div>
            </div>
          </div>
          <div id="timeDisplay">
            {currentDisplayTime}
            {" / "}
            {videoDisplayDuration}
          </div>
        </div>
        <div className="divider">
          <button
            id={ccBool ? "closedCaptions" : "cc"}
            className={`${ccExist ? "" : "noCC"}`}
            onClick={() => {
              if (!ccExist) {
                return;
              }
              startTransition(() => setCCBool(!ccBool));
            }}
          >
            <CC />
          </button>
          {!fullscreenBool && (
            <button className="miniPlayerButton">
              <MiniPlayer />
            </button>
          )}
          {!fullscreenBool && (
            <button
              className="theaterButton"
              onClick={() => {
                theaterBool
                  ? startTransition(() => setTheaterBool(false))
                  : startTransition(() => setTheaterBool(true));
              }}
            >
              {theaterBool ? <ExitTheater /> : <Theater />}
            </button>
          )}
          <button
            className="fullScreenButton"
            onClick={() => {
              fullscreenBool
                ? startTransition(() => setFullscreenBool(false))
                : startTransition(() => setFullscreenBool(true));
              startTransition(() => setSearchFocus(false));
            }}
          >
            {fullscreenBool ? <ExitFullscreen /> : <Fullscreen />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Controls;
