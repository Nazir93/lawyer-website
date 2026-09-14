"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { LawyerSidebar } from "@/components/lawyer/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function LawyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLoggedIn, isLoading, profile } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn) {
      router.push("/login?callbackUrl=/lawyer");
      return;
    }
    if (profile && profile.role !== "LAWYER" && profile.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [isLoading, isLoggedIn, profile, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isLoggedIn) return null;
  if (profile && profile.role !== "LAWYER" && profile.role !== "ADMIN") {
    return null;
  }

  return (
    <>
      <Header />
      <div className="flex min-h-screen pt-14">
        <LawyerSidebar />
        <main className="flex-1 lg:ml-64">
          <div className="container mx-auto px-4 lg:px-8 py-8">{children}</div>
        </main>
      </div>
    </>
  );
}
