import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Attendify
          </Link>

          <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <Link href="#features" className="transition hover:text-white">
              Features
            </Link>
            <Link href="#about" className="transition hover:text-white">
              About
            </Link>
            <Link href="#contact" className="transition hover:text-white">
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-24 text-center sm:py-32">
          <div className="mx-auto mb-6 inline-flex items-center rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm text-blue-300">
            Smart Attendance Management
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Attendance made
            <span className="text-blue-400"> simple.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Attendify is a modern QR-based attendance management system that
            helps schools track student attendance quickly, accurately, and
            efficiently.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="flex h-12 items-center justify-center rounded-lg bg-blue-500 px-7 font-semibold text-white transition hover:bg-blue-400"
            >
              Get Started
            </Link>

            <Link
              href="/login"
              className="flex h-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-7 font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-blue-950/30">
            {/* Browser Header */}
            <div className="flex items-center gap-2 border-b border-white/10 bg-slate-900 px-5 py-4">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
            </div>

            {/* Fake Dashboard */}
            <div className="grid min-h-[420px] md:grid-cols-[220px_1fr]">
              {/* Sidebar */}
              <aside className="hidden border-r border-white/10 bg-slate-950 p-5 md:block">
                <div className="mb-8 text-lg font-bold">Attendify</div>

                <div className="space-y-2 text-sm">
                  <div className="rounded-lg bg-blue-500/10 px-4 py-3 text-blue-400">
                    Dashboard
                  </div>
                  <div className="px-4 py-3 text-slate-500">Students</div>
                  <div className="px-4 py-3 text-slate-500">Attendance</div>
                  <div className="px-4 py-3 text-slate-500">Reports</div>
                </div>
              </aside>

              {/* Dashboard */}
              <div className="p-6 sm:p-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div>
                    <p className="text-sm text-slate-500">Overview</p>
                    <h2 className="mt-1 text-2xl font-bold">
                      Attendance Dashboard
                    </h2>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                    School Year 2026–2027
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <StatCard
                    title="Total Students"
                    value="120"
                    description="Registered students"
                  />

                  <StatCard
                    title="Present Today"
                    value="112"
                    description="93.3% attendance"
                  />

                  <StatCard
                    title="Absent Today"
                    value="8"
                    description="6.7% absence"
                  />
                </div>

                {/* Attendance */}
                <div className="mt-6 rounded-xl border border-white/10 bg-slate-950 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Today's Attendance</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Recent attendance activity
                      </p>
                    </div>

                    <div className="rounded-lg bg-blue-500/10 px-3 py-2 text-sm text-blue-400">
                      QR Scanner
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <AttendanceRow
                      name="Juan Dela Cruz"
                      section="Grade 7 - Rizal"
                      time="7:42 AM"
                    />

                    <AttendanceRow
                      name="Maria Santos"
                      section="Grade 7 - Rizal"
                      time="7:45 AM"
                    />

                    <AttendanceRow
                      name="Mark Reyes"
                      section="Grade 7 - Bonifacio"
                      time="7:48 AM"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-t border-white/10 bg-slate-900/50"
      >
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              Features
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to manage attendance
            </h2>

            <p className="mt-4 text-slate-400">
              Built to make daily attendance faster for teachers and easier to
              manage for administrators.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon="QR"
              title="QR-Based Attendance"
              description="Students can quickly record their attendance by scanning their assigned QR code."
            />

            <FeatureCard
              icon="ST"
              title="Student Management"
              description="Register, organize, and manage student records by grade level and section."
            />

            <FeatureCard
              icon="AT"
              title="Attendance Tracking"
              description="Monitor daily attendance and keep accurate records of student presence and absence."
            />

            <FeatureCard
              icon="RP"
              title="Attendance Reports"
              description="Generate organized attendance reports for teachers and school administrators."
            />

            <FeatureCard
              icon="CA"
              title="Attendance Calendar"
              description="Review attendance history and quickly identify patterns throughout the school year."
            />

            <FeatureCard
              icon="SC"
              title="Secure Access"
              description="Role-based authentication keeps student and attendance information protected."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="about" className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
                How it works
              </p>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Attendance in three simple steps
              </h2>

              <p className="mt-5 leading-7 text-slate-400">
                Attendify replaces manual attendance processes with a faster
                digital workflow.
              </p>
            </div>

            <div className="space-y-5">
              <Step
                number="01"
                title="Create an attendance session"
                description="Teachers create a session for their class and schedule."
              />

              <Step
                number="02"
                title="Students scan their QR code"
                description="Students scan their personal QR code using the attendance scanner."
              />

              <Step
                number="03"
                title="Attendance is recorded"
                description="The system validates the student and automatically records the attendance."
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="border-t border-white/10">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to simplify attendance?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Start managing student attendance with a faster and more reliable
            digital system.
          </p>

          <Link
            href="/register"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-blue-500 px-7 font-semibold transition hover:bg-blue-400"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Attendify. All rights reserved.</p>

          <p>QR-Based Attendance Management System</p>
        </div>
      </footer>
    </main>
  );
}

/* Components */

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950 p-5">
      <p className="text-sm text-slate-500">{title}</p>

      <p className="mt-2 text-3xl font-bold">{value}</p>

      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function AttendanceRow({
  name,
  section,
  time,
}: {
  name: string;
  section: string;
  time: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="mt-1 text-xs text-slate-500">{section}</p>
      </div>

      <div className="text-right">
        <p className="text-sm font-medium text-green-400">Present</p>
        <p className="mt-1 text-xs text-slate-500">{time}</p>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950 p-6 transition hover:-translate-y-1 hover:border-blue-400/30">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/10 text-sm font-bold text-blue-400">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-semibold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-5 rounded-xl border border-white/10 bg-slate-900/50 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-sm font-bold text-blue-400">
        {number}
      </div>

      <div>
        <h3 className="font-semibold">{title}</h3>

        <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
      </div>
    </div>
  );
}
