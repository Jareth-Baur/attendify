import { createClient } from "@/lib/supabase/server";

export default async function TestDatabasePage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("school_years")
    .select("*");

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">
        Supabase Connection Test
      </h1>

      {error ? (
        <pre className="mt-4 text-red-500">
          {JSON.stringify(error, null, 2)}
        </pre>
      ) : (
        <pre className="mt-4">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </main>
  );
}