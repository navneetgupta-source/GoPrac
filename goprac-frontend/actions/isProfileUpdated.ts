"use server";

import { cookies } from 'next/headers';

export async function userProfileUpdateStatus() {
  const cookieStore = await cookies();
  const userId = cookieStore.get?.('pracUser')?.value;

  if (!userId) return true; // Not logged in, allow access

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php?isProfileUpdated`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId }),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error("Failed to fetch profile update status:", res.status);
      return true;
    }
    const text = await res.text();

    try {
      const data = JSON.parse(text);
      // console.log("Profile update check response:", data);
      return data?.data?.profile_updated || 'Y'
    } catch (err) {
      console.error("Expected JSON but got:", text);
      return true;
    }

  } catch (error) {
    console.error("Error checking profile update status:", error);
    return true;
  }
}
