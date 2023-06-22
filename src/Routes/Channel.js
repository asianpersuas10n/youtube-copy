import { startTransition, useContext, useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import UploadVideo from "../Components/UploadVideo";
import { StoreContext } from "../Components/Data";
import FirebaseFirestore from "../FirebaseFirestore";

function Channel() {
  const { userStore } = useContext(StoreContext);
  const [user] = userStore;
  const [pageSetUP, setPageSetUp] = useState(null);
  const [uploadVideo, setUploadVideo] = useState(false);
  const [ownChannel, setOwnChannel] = useState(false);
  const [userData, setUserData] = useState();
  const [noUser, setNoUser] = useState(false);

  // gets info from url and sets up page
  async function pageSetUp() {
    const reference = window.location.pathname.replace("/channel/", "");
    if (user?.uid === reference) {
      setOwnChannel(true);
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
        setPageSetUp(true);
        console.log("somehow this passed", data[0]);
      } catch (error) {
        setNoUser(true);
        console.log(error);
      }
    }
  }

  // runs on page start
  useEffect(() => {
    pageSetUp();
  }, []);

  return (
    <div id="channel">
      <Navbar />
      {pageSetUP ? (
        <div id="channelBody">
          <div id="channelHeader">
            <div id="channelHeaderTop">
              <div id="channelHeaderInfo">
                <div id="channelHeaderImage">
                  {ownChannel ? (
                    <img src={user.photoURL} alt="profile" />
                  ) : (
                    <img src="" alt="profile" />
                  )}
                </div>
                <div id="channelHeaderText"></div>
              </div>
              {ownChannel && (
                <div id="channelHeaderButtons">
                  <div
                    onClick={() => startTransition(() => setUploadVideo(true))}
                  >
                    Upload Video
                  </div>
                  <div>Delete Video</div>
                </div>
              )}
            </div>
            <div id="channelHeaderBottom"></div>
          </div>
          {uploadVideo && <UploadVideo />}
        </div>
      ) : noUser ? (
        <div>No user detected</div>
      ) : (
        <div>loading info</div>
      )}
    </div>
  );
}

export default Channel;
