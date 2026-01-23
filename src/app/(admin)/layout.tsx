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
        <main className="flex-1 ml-64 min-h-screen">
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

