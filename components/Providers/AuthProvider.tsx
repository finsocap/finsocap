"use client";

import { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { initMockApi } from "@/lib/mockApi";
import { mockCurrentUser } from "@/lib/mockData";

export const defaultMockSession = {
  user: {
    id: mockCurrentUser.id,
    name: mockCurrentUser.name,
    email: mockCurrentUser.email,
    role: mockCurrentUser.role,
    image: mockCurrentUser.image,
    status: mockCurrentUser.status,
  },
  expires: "2099-01-01T00:00:00.000Z",
};

export function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: any;
}) {
  const [activeSession, setActiveSession] = useState(session || defaultMockSession);

  useEffect(() => {
    initMockApi();

    // Check if custom session is saved in localStorage (e.g. from custom login)
    try {
      const saved = localStorage.getItem("finsocap_user_session");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.user) {
          setActiveSession(parsed);
        }
      }
    } catch (e) {}
  }, []);

  return (
    <SessionProvider
      session={activeSession}
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {children}
    </SessionProvider>
  );
}
