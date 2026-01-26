import { redirect } from "next/navigation";
import { Sidebar } from "@/components/gasanov/sidebar";
import { auth } from "@/lib/auth/auth";

export default async function GasanovLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Проверка авторизации
  const session = await auth();
  
  if (!session) {
    redirect('/login?callbackUrl=/gasanov');
  }
  
  // Проверка роли - только ADMIN или LAWYER
  if (session.user.role !== 'ADMIN' && session.user.role !== 'LAWYER') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        <Sidebar />
        {/* Mobile: pt-14 для хедера, Desktop: ml-64 для сайдбара */}
        <main className="flex-1 min-h-screen pt-14 lg:pt-0 lg:ml-64">
          <div className="p-4 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

