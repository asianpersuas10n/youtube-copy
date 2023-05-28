import { limit } from "firebase/firestore";
import { useEffect, useState } from "react";
import FirebaseFirestore from "../FirebaseFirestore";
import CommentInput from "./CommentInput";

function Comment({ startingComment, commentInfo, id, currentUser }) {
  const [replies, setReplies] = useState();
  const [repliesLength, setRepliesLength] = useState(0);
  const [currentReplies, setCurrentReplies] = useState(0);
  const [repliesBool, setRepliesBool] = useState(false);
  const [user, setUser] = useState({ displayName: "test" });
  const [replyBool, setReplyBool] = useState(false);

  async function lookupUser(userID) {
    try {
      console.log(commentInfo, userID);
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

  async function repliesCheck(repliesId) {
    if (!repliesId) return;
    const count = await FirebaseFirestore.count(repliesId);
    const parsedCount = count.data().count;
    setReplies(true);
    setRepliesLength(parsedCount);
  }

  async function getReplies() {
    try {
      const commentCollection = await FirebaseFirestore.readDocuments({
        collectionType: `${commentInfo.commentId}replies`,
        limits: limit(5),
      });
      const tempComments = commentCollection.docs.map((doc) => {
        const commentData = doc.data();
        commentData.commentId = doc.id;
        return commentData;
      });
      setReplies(tempComments);
      setRepliesBool(true);
      setCurrentReplies(tempComments.length + currentReplies);
      alert("replies get");
      console.log(tempComments);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    lookupUser(commentInfo.userID);
    repliesCheck(commentInfo.replies);
  }, []);

  return (
    <div>
      {user && (
        <div>
          <img src={user.photoURL} alt="profile" />
          <div>
            <div>
              <span>{user.displayName}</span>
              <span>{commentInfo.time.toString()}</span>
            </div>
            <div>{commentInfo.text}</div>
            <div>
              <button>thumbs up svg</button>
              <div>{commentInfo.likes}</div>
              <button>thumbs down svg</button>
              <button
                onClick={() => {
                  const tempBool = replyBool ? false : true;
                  setReplyBool(tempBool);
                }}
              >
                Reply
              </button>
            </div>
            {replyBool && (
              <CommentInput
                id={commentInfo.commentId}
                user={user}
                startingComment={false}
                repliesId={commentInfo.replies}
                videoId={id}
              />
            )}
            {startingComment && replies && (
              <div>
                {repliesBool
                  ? replies.map((info, i) => {
                      return (
                        <div key={Number(`${Date.now()}${i}`)}>
                          <Comment
                            startingComment={false}
                            commentInfo={info}
                            id={commentInfo.commentId}
                          />
                        </div>
                      );
                    })
                  : null}
                {repliesLength !== currentReplies && (
                  <div>
                    <button onClick={() => getReplies()}>
                      {repliesLength - currentReplies} repl
                      {repliesLength - currentReplies > 1 ? "ies" : "y"}
                    </button>
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
