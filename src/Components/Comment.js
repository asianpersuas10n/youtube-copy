import { useEffect, useState } from "react";
import FirebaseFirestore from "../FirebaseFirestore";
import CommentInput from "./CommentInput";

function Comment({ startingComment, commentInfo, id, currentUser }) {
  const [replies, setReplies] = useState(false);
  const [repliesLength, setRepliesLength] = useState(0);
  const [currentReplies, setCurrentReplies] = useState(0);
  const [repliesBool, setRepliesBool] = useState(false);
  const [user, setUser] = useState({ displayName: "" });
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
              <button>Reply</button>
            </div>
            {replyBool && <CommentInput id={id} user={user} />}
            {startingComment && replies && (
              <div>
                <button>Replies</button>
                <div>
                  {repliesBool &&
                    replies.map(() => {
                      return (
                        <Comment
                          startingComment={false}
                          key={Math.random() * 1000}
                        />
                      );
                    })}
                  {repliesLength !== currentReplies && (
                    <div>
                      <button>Show more replies</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default Comment;
