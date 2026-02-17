//viewedStatus: "Viewed" | "download" | "pay"
// const allowedStatuses = ["Viewed", "download", "pay"];
//   const payload = {
//     userId,
//     candidateId,
//     userType,
//     url: window.location.href,
//     interviewId,
//     interviewSessionId,
//     viewedStatus,
//   };

interface Payload {
  userId: any;
  candidateId: any;
  userType: any;
  url: any;
  interviewId: any;
  interviewSessionId: any;
  viewedStatus: any;
}

export async function reviewLog(payload: Payload) {
  // allowed values
  try {
    // console.log("reviewLog payload",payload)
    // return true ;
    // validate
    if (!payload) {
      console.error(`Invalid data passed`);
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/index.php?assessmentReport_visit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (data.result === "Success") {
      console.log("done");
      return true
    } else {
      console.log("error");
      return false
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}
