import { limit } from "firebase/firestore";
import { startTransition, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import FirebaseFirestore from "../FirebaseFirestore";
import utilities from "../UtilityFunctions";

function App() {
  const [videos, setVideos] = useState();
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  async function contentPreview() {
    try {
      const getVideos = await FirebaseFirestore.readDocuments({
        collectionType: "videos",
        limits: limit(12),
      });
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
      setVideos(htmlMap);
      setLoaded(true);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    contentPreview();
  }, []);

  return (
    <div id="app">
      <Navbar />
      <div id="contentPreview">{loaded && videos}</div>
    </div>
  );
}

export default App;
