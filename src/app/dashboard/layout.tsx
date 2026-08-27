import Link from "next/link";
import { redirect } from "next/navigation";

import LogoutButton from "@/components/auth/LogoutButton";
import { getAuthorizedUser } from "@/lib/auth-server";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "DB",
  },
  {
    name: "Students",
    href: "/dashboard/students",
    icon: "ST",
  },
  {
    name: "Scan Attendance",
    href: "/dashboard/scanner",
    icon: "QR",
  },
  {
    name: "Attendance",
    href: "/dashboard/attendance",
    icon: "AT",
  },
  {
    name: "QR Cards",
    href: "/dashboard/qr-cards",
    icon: "CR",
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: "RP",
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: "SE",
  },
];

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getAuthorizedUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-slate-950 md:flex md:flex-col">
        {/* Brand */}
        <div className="border-b border-white/10 px-6 py-6">
          <Link href="/dashboard" className="block">
            <h1 className="text-xl font-bold tracking-tight">
              Attendify
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              Attendance Management
            </p>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-600">
            Menu
          </p>

          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 text-[10px] font-bold text-slate-500 transition group-hover:bg-blue-500/10 group-hover:text-blue-400">
                {item.icon}
              </span>

              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-white/10 p-4">
          <div className="rounded-xl bg-slate-900 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-sm font-bold text-blue-400">
                {(user.name ?? user.email ?? "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-200">
                  {user.name ?? user.email}
                </p>

                <p className="mt-0.5 text-xs capitalize text-slate-500">
                  {user.role}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <LogoutButton />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-slate-950 px-5 md:hidden">
        <Link
          href="/dashboard"
          className="text-lg font-bold"
        >
          Attendify
        </Link>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10 text-sm font-bold text-blue-400">
          {(user.name ?? user.email ?? "U")
            .charAt(0)
            .toUpperCase()}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-slate-950 md:hidden">
        <nav className="flex items-center justify-around px-2 py-2">
          {navigation.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-[10px] font-medium text-slate-500 transition hover:text-blue-400"
            >
              <span className="text-xs font-bold">
                {item.icon}
              </span>

              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <main className="min-w-0 flex-1 overflow-x-hidden pb-20 md:pb-0">
        <div className="min-h-screen pt-16 md:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
