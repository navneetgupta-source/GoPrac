import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const preInterviewId = searchParams.get("preInterviewId");

  if (!preInterviewId) {
    return NextResponse.json({ error: "Missing preInterviewId" }, { status: 400 });
  }

  try {
    const [rows] = await db.query(
      `
      SELECT
        (SELECT COUNT(DISTINCT emailId)
         FROM interviewSchedule
         WHERE preInterviewId = ?) AS total_applicants,
        (SELECT COUNT(DISTINCT isc.emailId)
         FROM interviewSchedule isc
         JOIN feedback_request fr ON fr.interviewId = isc.interviewId
         WHERE fr.review_status = 2
           AND isc.preInterviewId = ?) AS screened_via_ai,
(SELECT GROUP_CONCAT(
           CONCAT(
             u.firstName, ' (', 
             COALESCE(ROUND(sub.dk_score * 10, 0), 0), 
             '%)'
           )
           ORDER BY sub.dk_score DESC
           SEPARATOR ', '
       )
         FROM (
           SELECT isc.emailId, fr.dk_score
           FROM interviewSchedule isc
           JOIN feedback_request fr ON fr.interviewId = isc.interviewId
           WHERE isc.candidateStatus NOT IN ('Interview Scheduled', 'Profile Match')
             AND isc.preInterviewId = ?
             LIMIT 3
         ) AS sub
         LEFT JOIN users u ON u.emailId = sub.emailId
         WHERE sub.dk_score IS NOT NULL
         ORDER BY sub.dk_score DESC
         LIMIT 1) AS top_shortlisted
      `,
      [preInterviewId, preInterviewId, preInterviewId]
    );

    // console.log("rows[0]",rows[0])

    return NextResponse.json(rows[0] || {});
  } catch (err) {
    console.error("Error in getInterviewAnalytics:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
