import { limit, orderBy, startAfter } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import FirebaseFirestore from "../FirebaseFirestore";
import CommentInput from "./CommentInput";
import utilities from "../UtilityFunctions";
import { ReactComponent as ThumbsUp } from "../SVGs/thumbsUp.svg";
import { ReactComponent as ThumbsDown } from "../SVGs/thumbsDown.svg";
import { ReactComponent as DirectionalArrow } from "../SVGs/directionalArrow.svg";
import { ReactComponent as Return } from "../SVGs/return.svg";

function Comment({ startingComment, commentInfo, id, currentUser }) {
  const [replies, setReplies] = useState([]);
  const [repliesLength, setRepliesLength] = useState(0);
  const [currentReplies, setCurrentReplies] = useState(0);
  const [repliesExist, setRepliesExist] = useState(false);
  const [repliesBool, setRepliesBool] = useState(false);
  const [user, setUser] = useState({ displayName: "" });
  const [replyBool, setReplyBool] = useState(false);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [lastVisible, setLastVisible] = useState();
  const arrowRef = useRef(null);

  // used to get the comments user data
  async function lookupUser(userID) {
    try {
      const queries = [{ field: "uid", condition: "==", value: userID }];
      const isCurrentUser = await FirebaseFirestore.readDocuments({
        collectionType: "users",
        queries: queries,
      });
      const userData = isCurrentUser.docs.map((doc) => {
        return doc.data();
      });
      setUser(userData[0]);
    } catch (error) {
      console.log(error);
    }
  }

  // used to check if how many replies there are if any
  async function repliesCheck(repliesId) {
    if (!repliesId) return;
    const count = await FirebaseFirestore.count(repliesId);
    const parsedCount = count.data().count;
    setRepliesExist(true);
    setRepliesLength(parsedCount);
  }

  // used to get the first set of 5 max replies to the most recent comment
  async function getReplies() {
    try {
      const commentCollection = await FirebaseFirestore.readDocuments({
        collectionType: `${commentInfo.commentId}replies`,
        orderBy: orderBy("time", "asc"),
        limits: limit(5),
      });
      const tempComments = commentCollection.docs.map((doc) => {
        const commentData = doc.data();
        commentData.commentId = doc.id;
        return commentData;
      });
      setLastVisible(commentCollection.docs[commentCollection.docs.length - 1]);
      setReplies(
        tempComments.map((info, i) => {
          return (
            <div key={Number(`${Date.now()}${i}`)} className="replyComment">
              <Comment
                startingComment={false}
                commentInfo={info}
                id={commentInfo.commentId}
              />
            </div>
          );
        })
      );
      setRepliesBool(true);
      setCurrentReplies(tempComments.length + currentReplies);
      setRepliesLoaded(true);
    } catch (error) {
      console.log(error);
    }
  }

  // get more replies if show more replies is clicked
  async function getMoreReplies() {
    try {
      const previousReplies = replies;
      const previousLength = currentReplies;
      const commentCollection = await FirebaseFirestore.readDocuments({
        collectionType: `${commentInfo.commentId}replies`,
        orderBy: orderBy("time", "asc"),
        startAfter: startAfter(lastVisible),
        limits: limit(5),
      });
      const tempComments = commentCollection.docs.map((doc) => {
        const commentData = doc.data();
        commentData.commentId = doc.id;
        return commentData;
      });
      setLastVisible(commentCollection.docs[commentCollection.docs.length - 1]);
      setReplies([
        ...previousReplies,
        ...tempComments.map((info, i) => {
          return (
            <div key={Number(`${Date.now()}${i}`)} className="replyComment">
              <Comment
                startingComment={false}
                commentInfo={info}
                id={commentInfo.commentId}
              />
            </div>
          );
        }),
      ]);
      setCurrentReplies(tempComments.length + previousLength);
    } catch (error) {
      console.log(error);
    }
  }

  // flips replies arrow
  useEffect(() => {
    if (repliesBool && !arrowRef.current?.className.includes("flip")) {
      arrowRef.current?.classList.toggle("flip");
    }
    if (!repliesBool && arrowRef.current?.className.includes("flip")) {
      arrowRef.current?.classList.toggle("flip");
    }
  }, [repliesBool]);

  // run functions on page start
  useEffect(() => {
    lookupUser(commentInfo.userID);
    repliesCheck(commentInfo.replies);
  }, []);

  return (
    <div>
      {user && (
        <div className="comment">
          <img src={user.photoURL} alt="profile" />
          <div className="commentBody">
            <div>
              <span className="commentUser">{user.displayName}</span>
              <span className="commentTime">
                {utilities.generateUploadDate(commentInfo.time)}
              </span>
            </div>
            <div className="commentText">{commentInfo.text}</div>
            <div className="commentBottom">
              <div className="svgContainer navButtons thumbsUp">
                <ThumbsUp />
              </div>
              <div className="commentLikes">{commentInfo.likes}</div>
              <div className="svgContainer navButtons thumbsDown">
                <ThumbsDown />
              </div>
              {startingComment && (
                <div
                  onClick={() => {
                    const tempBool = replyBool ? false : true;
                    setReplyBool(tempBool);
                  }}
                  className="navButtons reply"
                >
                  Reply
                </div>
              )}
            </div>
            {replyBool && (
              <CommentInput
                id={commentInfo.commentId}
                user={user}
                startingComment={false}
                repliesId={commentInfo.replies}
                videoId={id}
                parsedComments={replies}
                setParsedComments={setReplies}
                neededForReplies={{
                  repliesLength: repliesLength,
                  setRepliesLength: setRepliesLength,
                  setRepliesBool: setRepliesBool,
                  currentReplies: currentReplies,
                  setCurrentReplies: setCurrentReplies,
                  setRepliesExist: setRepliesExist,
                }}
              />
            )}
            {startingComment && repliesExist && (
              <div>
                {repliesLength && (
                  <div>
                    <div
                      className="svgContainer navButtons commentReply"
                      onClick={() => {
                        if (repliesBool) {
                          setRepliesBool(false);
                          return;
                        }
                        if (repliesLoaded) {
                          setRepliesBool(true);
                          return;
                        }
                        getReplies();
                      }}
                    >
                      <div ref={arrowRef}>
                        <DirectionalArrow />
                      </div>
                      {repliesLength} repl
                      {repliesLength > 1 ? "ies" : "y"}
                    </div>
                  </div>
                )}
                {repliesBool ? replies : null}
                {repliesBool && repliesLength - currentReplies > 0 && (
                  <div
                    className="svgContainer navButtons commentMoreReplies"
                    onClick={() => getMoreReplies()}
                  >
                    <Return />
                    <span>Show more replies</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default Comment;
