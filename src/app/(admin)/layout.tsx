import { Sidebar } from "@/components/admin/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Добавить проверку авторизации через NextAuth
  // const session = await auth();
  // if (!session) redirect('/login');

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

