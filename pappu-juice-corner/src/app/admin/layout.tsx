import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "admin") {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 md:ml-[280px] p-4 pt-16 sm:p-6 sm:pt-16 md:p-8 md:pt-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
