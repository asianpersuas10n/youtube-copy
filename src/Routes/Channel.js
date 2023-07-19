import { startTransition, useContext, useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import UploadVideo from "../Components/UploadVideo";
import { StoreContext } from "../Components/Data";
import FirebaseFirestore from "../FirebaseFirestore";
import utilities from "../UtilityFunctions";
import { useNavigate } from "react-router-dom";

function Channel() {
  const { userStore } = useContext(StoreContext);
  const user = userStore[0];
  const [pageSetUP, setPageSetUp] = useState(null);
  const [uploadVideo, setUploadVideo] = useState(false);
  const [ownChannel, setOwnChannel] = useState(false);
  const [userData, setUserData] = useState();
  const [noUser, setNoUser] = useState(false);
  const [prefilteredVideos, setPrefilteredVideos] = useState([]);
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();

  // gets info from url and sets up page
  async function pageSetUp() {
    const reference = window.location.pathname.replace("/channel/", "");
    if (user?.uid === reference) {
      setOwnChannel(true);
      getUsersVideos(user.videos);
      setPageSetUp(true);
    } else {
      try {
        const queries = [{ field: "uid", condition: "==", value: reference }];
        const isCurrentUser = await FirebaseFirestore.readDocuments({
          collectionType: "users",
          queries: queries,
        });
        const data = isCurrentUser.docs.map((doc) => {
          return doc.data();
        });
        if (data[0] === undefined) throw data[0];
        setUserData(data[0]);
        getUsersVideos(data[0].videos);
        setPageSetUp(true);
      } catch (error) {
        setNoUser(true);
        console.log(error);
      }
    }
  }

  //gets all of a users video information
  async function getUsersVideos(url) {
    try {
      const promises = [];
      for (let i = 0; i < url.length; i++) {
        const queries = [{ field: "url", condition: "==", value: url[i] }];
        promises.push(
          FirebaseFirestore.readDocuments({
            collectionType: "videos",
            queries: queries,
          }).then((result) => {
            const data = result.docs.map((doc) => doc.data());
            return data[0];
          })
        );
      }
      const videoArr = await Promise.all(promises);
      formatVideos(videoArr);
    } catch (error) {
      console.log(error);
    }
  }

  // sets up formating for called videos
  function formatVideos(videosArr) {
    const tempVideos = videosArr.map((data, i) => {
      const index = Number(500 + `${i}${Math.random() * (9 - 0)}`);
      return (
        <div
          className="contentContainer"
          onClick={() => {
            const urlRegex = /\d{17}/;
            const parsedUrl = data.url.match(urlRegex);
            startTransition(() => navigate("/watch/" + parsedUrl[0]));
          }}
          key={index}
        >
          <div className="contentThumbnailContainer">
            <img
              src={data.thumbnail}
              alt="thumbnail"
              className="contentThumbnail"
            />
          </div>
          <div className="contentDuration">{data.duration}</div>
          <div className="contentBottom">
            <div className="contentText">
              <div className="contentTitle">{data.title}</div>
              <div className="contentTextBottom">
                <div className="contentViews">{data.views} views </div>
                <div className="contentDate">
                  • {utilities.generateUploadDate(data.time)}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    });
    setVideos([...tempVideos, ...prefilteredVideos]);
    setPrefilteredVideos([...tempVideos, ...prefilteredVideos]);
  }

  // runs on page start
  useEffect(() => {
    pageSetUp(true);
  }, [user]);

  return (
    <div id="channel">
      <Navbar />
      {pageSetUP ? (
        <div id="channelBody">
          <div id="channelHeaderContainer">
            <div id="channelHeader">
              <div id="channelHeaderTop">
                <div id="channelHeaderInfo">
                  <div id="channelHeaderImage">
                    {ownChannel ? (
                      <img src={user.photoURL} alt="profile" />
                    ) : (
                      <img src={userData.photoURL} alt="profile" />
                    )}
                  </div>
                  <div id="channelHeaderText"></div>
                </div>
                {ownChannel && (
                  <div id="channelHeaderButtons">
                    <div
                      onClick={() =>
                        startTransition(() => setUploadVideo(true))
                      }
                    >
                      Upload Video
                    </div>
                    <div>Delete Video</div>
                  </div>
                )}
              </div>
              <div id="channelHeaderBottom">
                <div>HOME</div>
                <div>VIDEOS</div>
                <div>ABOUT</div>
              </div>
            </div>
          </div>
          <div id="contentPreview">{videos}</div>
        </div>
      ) : noUser ? (
        <div>No user detected</div>
      ) : (
        <div>loading info</div>
      )}
      {uploadVideo && (
        <UploadVideo
          formatVideos={formatVideos}
          setUploadVideo={setUploadVideo}
        />
      )}
    </div>
  );
}

export default Channel;
