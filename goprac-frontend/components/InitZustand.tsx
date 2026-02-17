"use client";

import { useEffect } from "react";
import { useUserStore } from "@/stores/userStore";

export default function InitZustand({ user }: { user: any }) {
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    setUser(user);
  }, [user]);

  return null;
}
