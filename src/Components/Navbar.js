import { ReactComponent as Menu } from "../SVGs/hamburgerMenu.svg";
import { ReactComponent as SearchIcon } from "../SVGs/searchIcon.svg";
import { ReactComponent as Microphone } from "../SVGs/microphone.svg";
import { ReactComponent as Upload } from "../SVGs/upload.svg";
import { ReactComponent as UploadActive } from "../SVGs/uploadActive.svg";
import { ReactComponent as Notification } from "../SVGs/notification.svg";
import { ReactComponent as NotificationActive } from "../SVGs/notificationActive.svg";
import { ReactComponent as Elipsis } from "../SVGs/elipsis.svg";
import { ReactComponent as SignIn } from "../SVGs/signIn.svg";
import { ReactComponent as UploadVideo } from "../SVGs/uploadVideo.svg";
import { ReactComponent as CreatePost } from "../SVGs/createPost.svg";
import { ReactComponent as Hide } from "../SVGs/hide.svg";
import { ReactComponent as ChannelSVG } from "../SVGs/channel.svg";
import { ReactComponent as SignOutSVG } from "../SVGs/signout.svg";
import test from "../TestImage/test.jpeg";
import { startTransition, useContext, useEffect, useState } from "react";
import { StoreContext } from "../Components/Data";
import FirebaseAuth from "../FirebaseAuth";
import FirebaseFirestore from "../FirebaseFirestore";

function Navbar() {
  const { searchFocusStore, userStore } = useContext(StoreContext);
  const setSearchFocus = searchFocusStore[1];
  const [user, setUser] = userStore;
  const dataHandler = {
    test: {
      channelName: "test",
      profilePicture: "srcPlaceholder",
      recentVideoID: "testid",
    },
    testid: {
      videoName: "testName",
      thumbnail: "test",
      timeUploaded: 1000000,
    },
  };
  const notificationList = [
    { channelID: "test" },
    { channelID: "test" },
    { channelID: "test" },
    { channelID: "test" },
    { channelID: "test" },
  ];
  const [loggedIn, setLoggedIn] = useState(false);
  const [uploadClick, setUploadClick] = useState(false);
  const [notificationClick, setNotificationClick] = useState(false);
  const [elipsisClick, setElipsisClick] = useState(-1);
  const [profileClick, setProfileClick] = useState(false);

  useEffect(() => {
    document.addEventListener("click", (e) => {
      if (!e.target.classList.contains("upload") && uploadClick) {
        startTransition(() => setUploadClick(false));
      }
      if (!e.target.classList.contains("notification") && notificationClick) {
        startTransition(() => setNotificationClick(false));
        startTransition(() => setElipsisClick(false));
      }
      if (!e.target.classList.contains("profile") && profileClick) {
        startTransition(() => setProfileClick(false));
      }
    });
  });

  useEffect(() => {
    if (loggedIn) {
      handleUserInfo();
    }
  }, [user]);

  async function handleLogin() {
    try {
      await FirebaseAuth.login();
      startTransition(() => setLoggedIn(true));
    } catch (error) {
      console.log(error);
    }
  }

  async function handleUserInfo() {
    try {
      let tempID;
      const queries = [{ field: "uid", condition: "==", value: user.uid }];
      const isCurrentUser = await FirebaseFirestore.readDocuments({
        collectionType: "users",
        queries: queries,
      });
      const userData = isCurrentUser.docs.map((doc) => {
        tempID = doc.id;
        return doc.data();
      });

      if (userData[0]) {
        console.log(userData);
        if (
          user.photoURL !== userData[0].photoURL ||
          user.displayName !== userData[0].displayName ||
          user.email !== userData[0].email
        ) {
          FirebaseFirestore.updateDocument("users", tempID, {
            uid: user.uid,
            photoURL: user.photoURL,
            displayName: user.displayName,
            email: user.email,
            videos: [],
          });
        }
      } else {
        await FirebaseFirestore.createDocument("users", {
          uid: user.uid,
          photoURL: user.photoURL,
          displayName: user.displayName,
          email: user.email,
          videos: [],
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function handleLogout() {
    startTransition(() => setLoggedIn(false));
    await FirebaseAuth.logoutUser();
  }

  const handleElipsisClick = (element, bool) => {
    startTransition(() => setElipsisClick(bool ? element : -1));
  };

  return (
    <div id="navbarContainer" className="navbar">
      <div id="container">
        <div id="start">
          <button className="navButtons">
            <div className="svgContainer">
              <Menu />
            </div>
          </button>
          <a id="logo" href="/" title="YouTube Home">
            test
          </a>
        </div>
        <div id="center">
          <div id="centerContainer">
            <form id="searchForm" action="/results">
              <div id="container">
                <input
                  id="search"
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect="off"
                  tabIndex="0"
                  type="text"
                  placeholder="Search"
                  onFocus={startTransition(() => setSearchFocus(true))}
                  onBlur={startTransition(() => setSearchFocus(false))}
                />
                <div id="searchIcon" className="svgContainer">
                  <SearchIcon />
                </div>
              </div>
            </form>
            <button type="button" id="searchButton">
              <div className="svgContainer">
                <SearchIcon />
              </div>
            </button>
            <button id="microphone" className="navButtons">
              <div className="svgContainer">
                <Microphone />
              </div>
            </button>
          </div>
        </div>
        <div id="end">
          {loggedIn && (
            <div id="loggedInButtons">
              <div id="upload" className="upload">
                <button
                  className="navButtons upload"
                  onClick={() => {
                    uploadClick
                      ? startTransition(() => setUploadClick(false))
                      : startTransition(() => setUploadClick(true));
                  }}
                >
                  <div className="svgContainer upload">
                    {uploadClick ? (
                      <UploadActive className="upload" />
                    ) : (
                      <Upload className="upload" />
                    )}
                  </div>
                </button>
                {uploadClick && (
                  <div
                    className="dropdown upload"
                    onClick={() => (window.location.href = "/channel")}
                  >
                    <div className="dropdownButton">
                      <div className="svgContainer">
                        <UploadVideo />
                      </div>
                      <span>Upload video</span>
                    </div>
                    <div className="dropdownButton">
                      <div className="svgContainer">
                        <CreatePost />
                      </div>
                      <span>Create post</span>
                    </div>
                  </div>
                )}
              </div>
              <div id="notification" className="notification">
                <button
                  className="navButtons notification"
                  onClick={() => {
                    notificationClick
                      ? startTransition(() => setNotificationClick(false))
                      : startTransition(() => setNotificationClick(true));
                  }}
                >
                  <div className="svgContainer notification">
                    {notificationClick ? (
                      <NotificationActive className="notification" />
                    ) : (
                      <Notification className="notification" />
                    )}
                  </div>
                </button>
                {notificationClick && (
                  <div className="dropdown notification">
                    <div className="notificationHeader notification">
                      <div className="notification">Notifications</div>
                      <div>cogwheel svg</div>
                    </div>
                    {notificationList.map((val, index) => {
                      let channelName,
                        profilePicture,
                        recentVideoID,
                        thumbnail,
                        timeUploaded,
                        videoName;
                      if (val.channelID in dataHandler) {
                        ({ channelName, profilePicture, recentVideoID } =
                          dataHandler[val.channelID]);
                        if (recentVideoID in dataHandler) {
                          ({ thumbnail, timeUploaded, videoName } =
                            dataHandler[recentVideoID]);
                        } else {
                          //video api call here
                        }
                      } else {
                        //channel api call here
                      }
                      return (
                        <div className="dropdownButton" key={"100" + index}>
                          <div className="blueDot"></div>
                          <div
                            className="profile notification"
                            src={profilePicture}
                          ></div>
                          <div className="titleAndTime">
                            <p className="videoTitle">
                              {channelName} uploaded: {videoName}
                            </p>
                            <p className="time">{timeUploaded}</p>
                          </div>
                          <div className="notificationThumbnail">
                            <img src={test} alt="thumbnail"></img>
                          </div>
                          <div>
                            <button
                              className="navButtons notification"
                              onClick={() => {
                                handleElipsisClick(
                                  index,
                                  elipsisClick === index ? false : true
                                );
                              }}
                            >
                              <div className="svgContainer notification elipsis">
                                <Elipsis className="notification" />
                              </div>
                            </button>
                            {elipsisClick === index && (
                              <div className="dropdown notification elipsis">
                                <div className="dropdownButton">
                                  <div className="svgContainer">
                                    <Hide />
                                  </div>
                                  <div className="hideNotification">
                                    <span>Hide this notification</span>
                                  </div>
                                </div>
                                <div className="dropdownButton hideAll">
                                  <span>Turn off all from channel</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
          <button
            className="navButtons profilePic profile"
            onClick={() =>
              startTransition(() => {
                const clickBool = profileClick ? false : true;
                setProfileClick(clickBool);
              })
            }
          >
            <div className="svgContainer">
              {loggedIn ? (
                <img
                  src={user.photoURL}
                  alt="profile"
                  referrerpolicy="no-referrer"
                  className="profile"
                ></img>
              ) : (
                <Elipsis />
              )}
            </div>
          </button>
          {profileClick && (
            <div className="dropdown profile">
              {loggedIn && (
                <div>
                  <div className="profileHeader">
                    <img
                      src={user.photoURL}
                      alt="profile"
                      referrerpolicy="no-referrer"
                      className="profile profilePic"
                    />
                    <div>{user.displayName}</div>
                  </div>
                  <div
                    className="dropdownButton profile"
                    onClick={() => (window.location.href = "/channel")}
                  >
                    <div className="svgContainer profile">
                      <ChannelSVG />
                    </div>
                    <div>Your channel</div>
                  </div>
                  <div
                    className="dropdownButton profile"
                    onClick={() => handleLogout()}
                  >
                    <div className="svgContainer profile">
                      <SignOutSVG />
                    </div>
                    <div>Sign out</div>
                  </div>
                </div>
              )}
            </div>
          )}
          {!loggedIn && (
            <div
              id="signIn"
              onClick={() => {
                handleLogin();
              }}
            >
              <div className="svgContainer">
                <SignIn />
              </div>
              <div>
                <span>Sign in</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
