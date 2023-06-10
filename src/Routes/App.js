import { limit } from "firebase/firestore";
import { startTransition, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import FirebaseFirestore from "../FirebaseFirestore";

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
            onClick={() => {
              const urlRegex = /\d{17}/;
              const parsedUrl = data.url.match(urlRegex);
              startTransition(() => navigate("/watch/" + parsedUrl[0]));
            }}
            key={index}
          >
            <img src={data.thumbnail} alt="thumbnail" />
            <div>{data.duration}</div>
            <img src={userMap.photoURL} alt="profile" />
            <div>
              <div>{data.title}</div>
              <div>{userMap.displayName}</div>
              <div>{data.views} views</div>
              <div>{data.time.toString()}</div>
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
