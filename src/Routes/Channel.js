import { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import UploadVideo from "../Components/UploadVideo";
import { StoreContext } from "../Components/Data";

function Channel() {
  const [uploadVideo, setUploadVideo] = useState(true);
  const [ownChannel, setOwnChannel] = useState(true);

  // gets info from url and sets up page
  async function pageSetUp() {
    const reference = window.location.pathname.replace("/channel/", "");
  }

  // runs on page start
  useEffect(() => {
    pageSetUp();
  }, []);

  return (
    <div id="channel">
      <Navbar />
      <div id="channelBody">
        <div id="channelHeader">
          <div id="channelHeaderTop">
            <div id="channelHeaderInfo">
              <div id="channelHeaderImage">
                {ownChannel ? (
                  <img src="" alt="profile" />
                ) : (
                  <img src="" alt="profile" />
                )}
              </div>
              <div id="channelHeaderText"></div>
            </div>
            {ownChannel && (
              <div id="channelHeaderButtons">
                <div>Upload Video</div>
                <div>Delete Video</div>
              </div>
            )}
          </div>
          <div id="channelHeaderBottom"></div>
        </div>
        {uploadVideo && <UploadVideo />}
      </div>
    </div>
  );
}

export default Channel;
