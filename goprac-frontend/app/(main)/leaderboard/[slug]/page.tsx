import Component from "../_components/leaderboard";
import connection from "@/lib/db";

interface BlogPageProps {
  params: {
    slug: string;
  };
}

export default async function Page({ params }: BlogPageProps) {

  const { slug } = params;


  const query = `
    SELECT
  u.firstName AS candidateName,
  MAX(fr.intScore) AS topScore,
  pr.id,
  ac.name AS company_name,
  fs.favourite_subject AS subject,
  u.id AS userId
FROM feedback_request fr
JOIN users u ON u.id = fr.candidateId
JOIN preInterview pr ON pr.id = fr.preInterviewId
LEFT JOIN aspiration_company ac ON ac.id = pr.company_id
LEFT JOIN scps_transaction st ON st.preInterviewId = pr.id
LEFT JOIN favourite_subject fs ON fs.id = st.subject
WHERE st.subject = ?
AND fr.intScore IS NOT NULL
GROUP BY fr.candidateId
ORDER BY topScore DESC
LIMIT 100;
  `;

  // Execute the query with slug as both parameters
  const [rows] = await connection.query(query, [slug]);

  console.log("rows", rows);

  return <Component data={rows} />;
}
