import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import {
  useState,
  startTransition,
  useContext,
  useRef,
  useEffect,
} from "react";
import FirebaseFirestore from "../FirebaseFirestore";
import FirebaseAuth from "../FirebaseAuth";
import { db } from "../FirebaseConfig";
import { StoreContext } from "../Components/Data";

function CommentInput({ id, user, startingComment, repliesId, videoId }) {
  const { inputFocusStore, userStore } = useContext(StoreContext);
  const setInputFocus = inputFocusStore[1];
  const [userData] = userStore;
  const [commentInput, setCommentInput] = useState("");
  const [showButtons, setShowButtons] = useState(false);
  const confirmRef = useRef(null);
  const buttonsRef = useRef(null);

  async function uploadComment() {
    try {
      const collectionString = startingComment
        ? `${id}startingComments`
        : `${id}replies`;
      await FirebaseFirestore.createDocument(collectionString, {
        text: commentInput,
        time: serverTimestamp(),
        userID: user.uid,
        likes: 0,
        replies: "",
      });
      if (!startingComment && !repliesId)
        await updateDoc(doc(db, `${videoId}startingComments`, id), {
          replies: collectionString,
        });
      setCommentInput("");
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (commentInput && !confirmRef.current?.className.includes("active")) {
      confirmRef.current?.classList.toggle("active");
    }
    if (!commentInput && confirmRef.current?.className.includes("active")) {
      confirmRef.current?.classList.toggle("active");
    }
  }, [commentInput]);

  return (
    <div className="commentInput">
      {userData?.photoURL ? (
        <img src={userData.photoURL} alt="profile" />
      ) : (
        <img
          src="https://yt3.ggpht.com/a/default-user=s48-c-k-c0x00ffffff-no-rj"
          alt="default profile"
        />
      )}
      <div className="commentInputBody">
        <textarea
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          placeholder="Add a comment..."
          onBlur={() => {
            startTransition(() => setInputFocus(false));
          }}
          onFocus={(e) => {
            startTransition(() => {
              setShowButtons(true);
              setInputFocus(true);
            });
            if (!userData) {
              FirebaseAuth.login();
              e.target.blur();
            }
          }}
        ></textarea>
        {showButtons && (
          <div className="commentInputButtons" ref={buttonsRef}>
            <div
              className="navButtons commentCancel"
              onClick={() =>
                startTransition(() => {
                  setCommentInput("");
                  setShowButtons(false);
                })
              }
            >
              Cancel
            </div>
            <div
              ref={confirmRef}
              onClick={() => {
                if (commentInput) {
                  uploadComment();
                }
              }}
              className="navButtons commentConfirm"
            >
              {startingComment ? "Comment" : "Reply"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default CommentInput;
