import { useEffect, useRef, useState } from "react";
import CommentInput from "./CommentInput";
import Comment from "./Comment";
import FirebaseFirestore from "../FirebaseFirestore";
import { limit, orderBy, startAfter } from "firebase/firestore";

function CommentSection({ id, user }) {
  const [lastVisible, setLastVisible] = useState();
  const [parsedComment, setParsedComments] = useState();
  const [commentCount, setCommentCount] = useState(0);
  const [currentCount, setCurrentCount] = useState(0);
  const [scrollCheck, setScrollCheck] = useState(true);
  const bottomRef = useRef(null);

  // gets the five most recent comments
  async function lookupComments(videoID) {
    try {
      const commentCollection = await FirebaseFirestore.readDocuments({
        collectionType: `${videoID}startingComments`,
        orderBy: orderBy("time", "desc"),
        limits: limit(5),
      });
      const tempComments = commentCollection.docs.map((doc) => {
        const commentData = doc.data();
        commentData.commentId = doc.id;
        return commentData;
      });
      const tempParsedComments = tempComments.map((info, i) => {
        return (
          <div key={Number(`${Date.now()}${i}`)} className="commentContent">
            <Comment
              startingComment={true}
              commentInfo={info}
              id={videoID}
              currentUser={user}
            />
          </div>
        );
      });
      setLastVisible(commentCollection.docs[commentCollection.docs.length - 1]);
      setParsedComments(tempParsedComments);
      setCurrentCount(tempParsedComments.length);
    } catch (error) {
      console.log(error);
    }
  }

  // load five more commments
  async function loadMoreComments(videoID) {
    try {
      const previousCount = currentCount;
      const previousComments = parsedComment;
      const commentCollection = await FirebaseFirestore.readDocuments({
        collectionType: `${videoID}startingComments`,
        orderBy: orderBy("time", "desc"),
        startAfter: startAfter(lastVisible),
        limits: limit(5),
      });
      const tempComments = commentCollection.docs.map((doc) => {
        const commentData = doc.data();
        commentData.commentId = doc.id;
        return commentData;
      });
      const tempParsedComments = tempComments.map((info, i) => {
        return (
          <div key={Number(`${Date.now()}${i}`)} className="commentContent">
            <Comment
              startingComment={true}
              commentInfo={info}
              id={videoID}
              currentUser={user}
            />
          </div>
        );
      });
      setLastVisible(commentCollection.docs[commentCollection.docs.length - 1]);
      setParsedComments([...previousComments, ...tempParsedComments]);
      setCurrentCount(tempComments.length + previousCount);
      setScrollCheck(true);
    } catch (error) {
      console.log(error);
    }
  }

  // checks total number of comments
  async function commentTotalCheck(videoID) {
    const count = await FirebaseFirestore.count(`${videoID}startingComments`);
    const parsedCount = count.data().count;
    setCommentCount(parsedCount);
  }

  // checks if bottomPage div is fully visible in height on the viewport
  function infiniteScroll() {
    if (scrollCheck && commentCount > 5 && commentCount - currentCount !== 0) {
      window.requestAnimationFrame(() => {
        setScrollCheck(false);
        const rect = bottomRef.current.getBoundingClientRect();
        const elemTop = rect.top;
        const elemBottom = rect.bottom;
        if (elemTop >= 0 && elemBottom <= window.innerHeight) {
          loadMoreComments(id);
        } else {
          setScrollCheck(true);
        }
      });
    }
  }

  // sets up event listeners
  useEffect(() => {
    document.addEventListener("scroll", infiniteScroll);
    return () => document.removeEventListener("scroll", infiniteScroll);
  }, [commentCount, currentCount, scrollCheck]);

  // runs functions on mount
  useEffect(() => {
    lookupComments(id);
    commentTotalCheck(id);
  }, []);

  return (
    <div id="commentSection">
      <div id="commentCount">
        {commentCount} {`Comment${commentCount === 1 ? "" : "s"}`}
      </div>
      <CommentInput id={id} user={user} startingComment={true} />
      <div id="commentPreview">{parsedComment}</div>
      {commentCount - currentCount > 0 ? (
        <div id="bottomPage" ref={bottomRef}></div>
      ) : (
        <div>You've reached the bottom :)</div>
      )}
    </div>
  );
}
export default CommentSection;
