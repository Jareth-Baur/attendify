import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
  },
  {
    name: "Students",
    href: "/dashboard/students",
  },
  {
    name: "Scan Attendance",
    href: "/dashboard/scanner",
  },
  {
    name: "Attendance",
    href: "/dashboard/attendance",
  },
  {
    name: "QR Cards",
    href: "/dashboard/qr-cards",
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
  },
];

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 border-r bg-white">
        <div className="border-b p-6">
          <h1 className="text-xl font-bold">
            SPED Attendance
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Attendance Management
          </p>
        </div>

        <nav className="space-y-1 p-4">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="border-t p-4">
          <p className="text-sm font-medium">
            {profile?.full_name ?? user.email}
          </p>

          <p className="text-xs capitalize text-gray-500">
            {profile?.role ?? "teacher"}
          </p>
        </div>
      </aside>

      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}