const currentTime = new Date();

function reduceTime(totalTime, time) {
  return (totalTime - (totalTime % time)) / time;
}

function generateUploadDate(previousDate) {
  const difference = currentTime.getTime() - previousDate.toDate().getTime();
  let generatedTime;
  switch (true) {
    case difference <= 120000:
      generatedTime = "just now";
      break;
    case difference > 120000 && difference <= 3600000:
      generatedTime = `${reduceTime(difference, 60000)} minutes ago`;
      break;
    case difference > 3600000 && difference <= 86400000:
      generatedTime = `${reduceTime(difference, 3600000)} hours ago`;
      break;
    case difference > 86400000 && difference <= 604800000:
      generatedTime = `${reduceTime(difference, 86400000)} days ago`;
      break;
    case difference > 604800000 && difference <= 2628000000:
      generatedTime = `${reduceTime(difference, 6048000000)} weeks ago`;
      break;
    case difference > 2628000000 && difference <= 31540000000:
      generatedTime = `${reduceTime(difference, 2628000000)} months ago`;
      break;
    case difference > 31540000000:
      generatedTime = `${reduceTime(difference, 31540000000)} years ago`;
      break;
    default:
      generatedTime = "time unknown";
      break;
  }
  return generatedTime;
}

const utilities = {
  generateUploadDate,
};

export default utilities;
