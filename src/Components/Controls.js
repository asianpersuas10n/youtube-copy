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
import { useEffect, useRef, useState } from "react";

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
  const timelineRef = useRef(null);
  const previewImgRef = useRef(null);
  const timelineContainerRef = useRef(null);
  let scrubbingBool = false;

  //let you interact with timeline;

  function handleScrubbing(e) {
    const rect = timelineContainerRef.current.getBoundingClientRect();
    const percent =
      Math.min(Math.max(0, e.pageX - rect.x), rect.width) / rect.width;
    scrubbingBool = (e.buttons & 1) === 1;
    if (scrubbingBool) {
      videoContainerRef.current.classList.add("scrubbing");
      videoElement.pause();
      setPlayBool(false);
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
    previewImgRef.current.src = test; // will call backend images and use previewImgNumber to decide which preview to use
    e.target.style.setProperty("--preview", percent);
    if ((e.buttons & 1) === 1) {
      e.preventDefault();
      thumbnailRef.current.src = previewImgRef.current.src;
      timelineContainerRef.current.style.setProperty("--progress", percent);
    }
  }

  //mounts an event listener so you can scrub when off the video player and unmounts when video unmounts

  useEffect(() => {
    document.addEventListener("mouseup", (e) => {
      if (scrubbingBool) {
        handleScrubbing(e);
      }
    });
    document.addEventListener("mousemove", (e) => {
      if (scrubbingBool) {
        handleTimeline(e);
      }
    });

    return () => {
      document.addEventListener("mouseup", (e) => {
        if (scrubbingBool) {
          handleScrubbing(e);
        }
      });
      document.addEventListener("mousemove", (e) => {
        if (scrubbingBool) {
          handleTimeline(e);
        }
      });
    };
  });

  // updates timeline and voume on either values changing

  useEffect(() => {
    volumeCheck(false);

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
          <img className="previewImage" ref={previewImgRef}></img>
          <div className="pointer"></div>
        </div>
      </div>
      <div className="buttons">
        <button className="playButton" onClick={() => handlePlayPause()}>
          {playBool ? <Pause /> : <Play />}
        </button>
        <div className="volumeContainer">
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
          <input
            className="volumeSlider"
            type="range"
            min="0"
            max="1"
            step="any"
            value={volumeValue}
            onChange={(e) => setVolumeValue(e.target.value)}
          ></input>
        </div>
        <div id="timeDisplay">
          {Math.floor(currentTimeline / 60) > 0
            ? Math.floor(currentTimeline / 60) + ":"
            : "0:"}
          {Math.floor(currentTimeline % 60) < 10 ? "0" : null}
          {Math.floor(currentTimeline % 60)}
          {" / "}
          {Math.floor(videoDuration / 60) > 0
            ? Math.floor(videoDuration / 60) + ":"
            : "0:"}
          {Math.floor(videoDuration % 60) < 10 ? "0" : null}
          {Math.floor(videoDuration % 60)}
        </div>
        <button
          id={ccBool ? "closedCaptions" : "cc"}
          className={`${ccExist ? "" : ".noCC"}`}
          onClick={() => {
            if (!ccExist) {
              return;
            }
            setCCBool(!ccBool);
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
              theaterBool ? setTheaterBool(false) : setTheaterBool(true);
            }}
          >
            {theaterBool ? <ExitTheater /> : <Theater />}
          </button>
        )}
        <button
          className="fullScreenButton"
          onClick={() => {
            fullscreenBool ? setFullscreenBool(false) : setFullscreenBool(true);
          }}
        >
          {fullscreenBool ? <ExitFullscreen /> : <Fullscreen />}
        </button>
      </div>
    </div>
  );
}

export default Controls;
