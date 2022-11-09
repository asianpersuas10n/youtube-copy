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
import { useEffect, useRef } from "react";

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
}) {
  const timelineRef = useRef(null);

  useEffect(() => {
    const timelineWidth = currentTimeline / videoDuration;
    timelineRef.current.style.width = timelineWidth * 100 + "%";
    volumeCheck(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTimeline, videoDuration, volumeValue]);
  return (
    <div className="controls">
      <div className="timelineContainer">
        <div className="timeline" ref={timelineRef}></div>
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
