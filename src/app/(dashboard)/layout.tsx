"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // Редирект произойдет через useEffect
  }

  return (
    <>
      <Header />
      <div className="flex min-h-screen pt-14">
        <DashboardSidebar />
        <main className="flex-1 lg:ml-64">
          <div className="container mx-auto px-4 lg:px-8 py-8">{children}</div>
        </main>
      </div>
    </>
  );
}

