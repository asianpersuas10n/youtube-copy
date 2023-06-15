import { useEffect, useState } from "react";
import CommentInput from "./CommentInput";
import Comment from "./Comment";
import FirebaseFirestore from "../FirebaseFirestore";
import { limit, orderBy } from "firebase/firestore";

function CommentSection({ id, user }) {
  const [comments, setComments] = useState();
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [parsedComment, setParsedComments] = useState();

  async function lookupComments(videoID) {
    try {
      const commentCollection = await FirebaseFirestore.readDocuments({
        collectionType: `${videoID}startingComments`,
        orderBy: orderBy("time", "asc"),
        limits: limit(5),
      });
      const tempComments = commentCollection.docs.map((doc) => {
        const commentData = doc.data();
        commentData.commentId = doc.id;
        return commentData;
      });
      setComments(tempComments);
      setParsedComments(
        tempComments.map((info, i) => {
          return (
            <div key={Number(`${Date.now()}${i}`)} className="commentContent">
              <Comment
                startingComment={true}
                commentInfo={info}
                id={id}
                currentUser={user}
              />
            </div>
          );
        })
      );
      setCommentsLoaded(true);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    lookupComments(id);
  }, []);

  return (
    <div id="commentSection">
      <CommentInput id={id} user={user} startingComment={true} />
      <div id="commentPreview">{parsedComment}</div>
    </div>
  );
}
export default CommentSection;
