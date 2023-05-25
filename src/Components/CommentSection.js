import { useEffect, useState } from "react";
import CommentInput from "./CommentInput";
import Comment from "./Comment";
import FirebaseFirestore from "../FirebaseFirestore";
import { limit } from "firebase/firestore";

function CommentSection({ id, user }) {
  const [comments, setComments] = useState();
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  async function lookupComments(videoID) {
    try {
      const commentCollection = await FirebaseFirestore.readDocuments({
        collectionType: `${videoID}startingComments`,
        limits: limit(5),
      });
      const tempComments = commentCollection.docs.map((doc) => {
        const commentData = doc.data();
        commentData.commentId = doc.id;
        return commentData;
      });
      setComments(tempComments);
      setCommentsLoaded(true);
      console.log(tempComments);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    lookupComments(id);
  }, []);

  return (
    <div>
      <CommentInput id={id} user={user} startingComment={true} />
      {commentsLoaded &&
        comments.map((info, i) => {
          console.log("test" + `${i}`);
          return (
            <Comment
              startingComment={true}
              commentInfo={info}
              key={Number(`${Date.now()}${i}`)}
              id={id}
              currentUser={user}
            />
          );
        })}
    </div>
  );
}
export default CommentSection;
