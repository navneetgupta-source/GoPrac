import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  try {
    const [rows] = await db.query(
      `
      SELECT
         jml.instituteCode,
         u.instituteCode AS userInstituteCode,
         jml.name AS instituteName,
         jml.mobileNumber AS instituteMobileNumber,
         jml.emailId AS instituteEmailId,
         jml.contactType,
         pr.interviewName as jobName,
         pr.id AS preInterviewId,
         pr.createdAt AS jobPostDate,
         CASE 
          WHEN pr.interviewExpireDate IS NULL THEN 'Inactive'
          WHEN DATE(NOW()) > DATE(pr.interviewExpireDate) THEN 'Inactive'
          ELSE 'Active'
         END AS jobStatus,
         u.firstName,
         u.mobileNumber,
         u.emailId,
         u.id AS candidateId,
         isc.candidateStatus,
         CASE 
         	WHEN fr.review_status = 2 
         	THEN 'Y'
         	ELSE 'N'
         END AS aiInterview,
         CASE 
         	WHEN isc.candidateStatus IN('Client Shortlisted')
         	THEN 'Y'
         	ELSE 'N'
         END AS shortlisted,
         CASE 
         	WHEN isc.candidateStatus IN('Offered','Offer Accepted','Offer Drop','No Show','Joined')
         	THEN 'Y'
         	ELSE 'N'
         END AS offered,
         fr.review_status,
        fr.intScore AS intScore,
        fr.suitability AS applicantSuitability
       --  (SELECT applicantPercentile(fr.intScore,pr.id)) AS percentile
       FROM interviewSchedule isc
       LEFT JOIN users u ON u.id = isc.candidate_id
       LEFT JOIN JobMailList jml ON jml.instituteCode = u.instituteCode
       LEFT JOIN preInterview pr ON pr.id = isc.preInterviewId
       LEFT JOIN feedback_request fr  ON fr.interviewId = isc.interviewId
       WHERE u.instituteCode IS NOT NULL AND u.instituteCode <> ""
       ORDER BY pr.createdAt DESC;
      `
    );

    // console.log("rows",rows)

    return NextResponse.json(rows || {});
  } catch (err) {
    console.error("Error in institute-angagament/data:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
