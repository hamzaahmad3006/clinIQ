"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "cliniq_auth";

export function getAuth(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function setAuth(loggedIn: boolean) {
  if (typeof window === "undefined") return;
  if (loggedIn) {
    localStorage.setItem(STORAGE_KEY, "true");
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    if (!getAuth()) {
      router.replace("/login");
    }
  }, [router]);
}
