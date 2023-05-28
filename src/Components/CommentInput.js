import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useState, startTransition, useContext } from "react";
import FirebaseFirestore from "../FirebaseFirestore";
import { db } from "../FirebaseConfig";
import { StoreContext } from "../Components/Data";

function CommentInput({ id, user, startingComment, repliesId, videoId }) {
  const { inputFocusStore } = useContext(StoreContext);
  const setInputFocus = inputFocusStore[1];
  const [commentInput, setCommentInput] = useState("");

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
      alert("message sent");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      <img alt="profile" />
      <div>
        <textarea
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          placeholder="Add a comment..."
          onBlur={() => startTransition(() => setInputFocus(false))}
          onFocus={() => startTransition(() => setInputFocus(true))}
        ></textarea>
        <div>
          <button>Cancel</button>
          <button onClick={() => uploadComment()}>Comment</button>
        </div>
      </div>
    </div>
  );
}
export default CommentInput;
