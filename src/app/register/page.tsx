"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { registrationSchema } from "@/lib/validation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const validation = registrationSchema.safeParse({ name, email, password });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Invalid registration details.");
      return;
    }

    setLoading(true);
    const response = await authClient.signUp.email(validation.data);

    if (response.error) {
      setError(response.error.message ?? "Unable to create your account.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold">Attendance System</h1>
        <p className="mt-2 text-gray-600">Create your teacher account.</p>

        <form onSubmit={handleRegister} className="mt-8 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">Full name</label>
            <input id="name" type="text" required value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-lg border p-3" placeholder="Maria Santos" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border p-3" placeholder="teacher@example.com" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">Password</label>
            <input id="password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-lg border p-3" placeholder="At least 8 characters" />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button type="submit" disabled={loading} className="w-full rounded-lg bg-black p-3 text-white disabled:opacity-50">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link href="/login" className="font-medium text-black underline">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
