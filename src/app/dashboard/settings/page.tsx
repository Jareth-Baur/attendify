import Link from "next/link";

export default function SettingsPage() {
  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>

        <p className="mt-1 text-gray-500">Configure your attendance system.</p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link
          href="/dashboard/settings/calendar"
          className="rounded-xl border bg-white p-6 transition hover:bg-gray-50"
        >
          <h2 className="font-semibold">School Calendar</h2>

          <p className="mt-2 text-sm text-gray-500">
            Manage holidays, class suspensions, and non-school days.
          </p>
        </Link>
      </div>
    </div>
  );
}
