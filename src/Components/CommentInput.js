import { serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import FirebaseFirestore from "../FirebaseFirestore";

function CommentInput({ id, user }) {
  const [commentInput, setCommentInput] = useState("");

  async function uploadComment() {
    try {
      await FirebaseFirestore.createDocument(`${id}startingComments`, {
        text: commentInput,
        time: serverTimestamp(),
        userID: user.uid,
        likes: 0,
        replies: "",
      });
      setCommentInput("");
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
