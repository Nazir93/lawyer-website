import { Sidebar } from "@/components/admin/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Добавить проверку авторизации через Supabase
  // const supabase = await createClient();
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) redirect('/admin/login');

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

