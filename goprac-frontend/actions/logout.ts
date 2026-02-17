// app/actions/logout.ts
"use server";

import { cookies } from "next/headers";

export async function logout() {
  const cookieStore = cookies();

  cookieStore.set("PracIsLoggedin", false, { path: "/", expires: 60 });
  cookieStore.set("PracLoggedInRoute", "", { path: "/", maxAge: 0 });
  cookieStore.set("pracUser", "", { path: "/", maxAge: 0 });
  cookieStore.set("loggedInPanelId", "", { path: "/", maxAge: 0 });
  cookieStore.set("userRole", "", { path: "/", maxAge: 0 });
  cookieStore.set("navigatedFromHomePage", "", { path: "/", maxAge: 0 });
  cookieStore.set("checkBandwidth", "", { path: "/", maxAge: 0 });
  cookieStore.set("pracUserType", "", { path: "/", maxAge: 0 });
  cookieStore.set("pracUserName", "", { path: "/", maxAge: 0 });
  cookieStore.set("_GP_", "", { path: "/", maxAge: 0 });

}
