// app/actions/updatePdfStatus.ts
'use server';

import connection from '@/lib/db'; // mysql2/promise

export async function markPDFAsPending(interviewSessionId: number) {
  try {
    const [rows] = await connection.execute(
      `UPDATE feedback_request SET reportpdf1 = ? WHERE interviewSessionId = ?`,
      ['0', interviewSessionId]
    );

    return { success: true };
  } catch (error) {
    console.error("❌ Failed to mark PDF as pending:", error);
    return { success: false, error: "Something went wrong" };
  }
}