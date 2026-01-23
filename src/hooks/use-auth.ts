"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  image: string | null;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true);
      return;
    }

    if (session?.user) {
      setProfile({
        id: session.user.id,
        name: session.user.name || null,
        email: session.user.email || null,
        phone: session.user.phone || null,
        role: session.user.role,
        image: session.user.image || null,
      });
    } else {
      setProfile(null);
    }
    
    setIsLoading(false);
  }, [session, status]);

  const logout = useCallback(async () => {
    try {
      await signOut({ redirect: false });
      setProfile(null);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [router]);

  return {
    user: session?.user || null,
    profile,
    isLoggedIn: !!session?.user,
    isLoading,
    logout,
  };
}
