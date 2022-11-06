import { useEffect, useRef, useState } from "react";
import Controls from "../Components/Controls";
import video from "../TestVideo/testVideo.mp4";

function Watch() {
  const videoRef = useRef(null);
  const [videoElement, setVideoElement] = useState();
  const [playBool, setPlayBool] = useState(false);
  const [videoDuration, setVideoTotalDuration] = useState(0);
  const [currentTimeline, setCurrentTimeline] = useState(0);

  //handles playing and pausing

  const handlePlayPause = () => {
    videoElement.paused ? videoElement.play() : videoElement.pause();
  };

  //keydown shortcuts

  const handleKeyDown = (e) => {
    const keyPress = e.key.toLowerCase();
    if (keyPress === " " || keyPress === "k") {
      handlePlayPause();
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

  //references video on page mount

  useEffect(() => {
    setVideoElement(videoRef.current);
  }, []);

  return (
    <div id="watch" tabIndex={0} onKeyDown={handleKeyDown}>
      <div className="videoContainer">
        <video
          autoPlay
          ref={videoRef}
          id="video"
          src={video}
          onClick={() => handlePlayPause()}
          onTimeUpdate={handleTimeline}
          onPlay={() => setPlayBool(true)}
          onPause={() => setPlayBool(false)}
        ></video>
        <Controls
          videoElement={videoElement}
          playBool={playBool}
          setPlayBool={setPlayBool}
          handlePlayPause={handlePlayPause}
          videoDuration={videoDuration}
          currentTimeline={currentTimeline}
        />
      </div>
    </div>
  );
}

export default Watch;
