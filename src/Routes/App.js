import { limit, orderBy, startAfter } from "firebase/firestore";
import { startTransition, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import FirebaseFirestore from "../FirebaseFirestore";
import utilities from "../UtilityFunctions";

function App() {
  const [videos, setVideos] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [videoCount, setVideoCount] = useState(0);
  const [currentVideoCount, setCurrentVideoCount] = useState(0);
  const [scrollCheck, setScrollCheck] = useState(true);
  const [lastVisible, setLastVisible] = useState();
  const bottomRef = useRef(null);
  const navigate = useNavigate();

  async function contentPreview(readRules) {
    try {
      const getVideos = await FirebaseFirestore.readDocuments(readRules);
      const mappedVideos = await Promise.all(
        getVideos.docs.map(async (video) => {
          const data = video.data();
          const queries = [{ field: "uid", condition: "==", value: data.user }];
          const getUser = await FirebaseFirestore.readDocuments({
            collectionType: "users",
            queries: queries,
          });
          const userMap = getUser.docs.map((map) => map.data());
          return { userMap: userMap[0], data: data };
        })
      );
      const htmlMap = mappedVideos.map(({ userMap, data }, i) => {
        const index = Number(500 + `${i}`);
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
              <img
                src={userMap.photoURL}
                alt="profile"
                className="contentProfile"
              />
              <div className="contentText">
                <div className="contentTitle">{data.title}</div>
                <div className="contentUserName">{userMap.displayName}</div>
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
      setCurrentVideoCount(currentVideoCount + htmlMap.length);
      setVideos([...videos, ...htmlMap]);
      if (loaded) {
      } else {
        setLoaded(true);
      }
      setLastVisible(getVideos.docs[getVideos.docs.length - 1]);
    } catch (error) {
      console.log(error);
    }
  }

  // checks how many total videos there are
  async function videoTotalCheck() {
    const count = await FirebaseFirestore.count(`videos`);
    const parsedCount = count.data().count;
    setVideoCount(parsedCount);
  }

  // checks if bottomPage div is fully visible in height on the viewport
  function infiniteScroll() {
    if (scrollCheck && videoCount - currentVideoCount !== 0) {
      window.requestAnimationFrame(() => {
        setScrollCheck(false);
        const rect = bottomRef.current.getBoundingClientRect();
        const elemTop = rect.top;
        const elemBottom = rect.bottom;
        if (elemTop >= 0 && elemBottom <= window.innerHeight) {
          contentPreview({
            collectionType: "videos",
            startAfter: startAfter(lastVisible),
            orderBy: orderBy("time", "desc"),
            limits: limit(24),
          });
        } else {
          setScrollCheck(true);
        }
      });
    }
  }

  // sets up event listeners
  useEffect(() => {
    document.addEventListener("scroll", infiniteScroll);
    return () => document.removeEventListener("scroll", infiniteScroll);
  }, [videoCount, currentVideoCount, scrollCheck, lastVisible]);

  useEffect(() => {
    contentPreview({
      collectionType: "videos",
      orderBy: orderBy("time", "desc"),
      limits: limit(24),
    });
    videoTotalCheck();
  }, []);

  return (
    <div id="app">
      <Navbar />
      <div id="contentPreview">{loaded && videos}</div>
      {videoCount - currentVideoCount > 0 ? (
        <div ref={bottomRef}></div>
      ) : (
        <div>You've reached the bottom of the page :)</div>
      )}
    </div>
  );
}

export default App;
