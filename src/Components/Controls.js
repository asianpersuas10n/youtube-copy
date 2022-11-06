import { ReactComponent as Play } from "../SVGs/play.svg";
import { ReactComponent as Pause } from "../SVGs/pause.svg";
import { useEffect, useRef } from "react";

function Controls({
  videoElement,
  handlePlayPause,
  playBool,
  setPlayBool,
  videoDuration,
  currentTimeline,
}) {
  const timelineRef = useRef(null);

  useEffect(() => {
    const timelineWidth = currentTimeline / videoDuration;
    timelineRef.current.style.width = timelineWidth * 100 + "%";
  }, [currentTimeline, videoDuration]);
  return (
    <div className="controls">
      <div className="timelineContainer">
        <div className="timeline" ref={timelineRef}></div>
      </div>
      <div className="buttons">
        <button className="playButton" onClick={() => handlePlayPause()}>
          {playBool ? <Pause /> : <Play />}
        </button>
        <button></button>
        <button></button>
        <button></button>
      </div>
    </div>
  );
}

export default Controls;
