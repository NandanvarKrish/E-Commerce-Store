import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default async function TodosPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: todos, error } = await supabase.from("todos").select();

  return (
    <Container className="py-12">
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-brand-forest">
            Supabase Connection Test (Todos)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Demonstrating server-side querying with <code>@/utils/supabase/server</code>.
          </p>
        </div>

        {error ? (
          <div className="rounded-md border border-brand-clay/30 bg-brand-clay/10 p-4 text-xs font-mono">
            <p className="font-semibold text-brand-forest">Supabase Response:</p>
            <p className="text-muted-foreground mt-1">
              Table &apos;todos&apos; not found yet or RLS policy active ({error.message}). This is normal until the table is created in your Supabase SQL editor.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-brand-forest/10 border border-brand-forest/10 rounded-md bg-card p-4">
            {todos && todos.length > 0 ? (
              todos.map((todo: { id: string | number; name?: string; title?: string }) => (
                <li key={todo.id} className="py-2 text-sm font-mono">
                  {todo.name || todo.title || JSON.stringify(todo)}
                </li>
              ))
            ) : (
              <li className="py-4 text-sm text-center text-muted-foreground">
                No items found in &apos;todos&apos; table.
              </li>
            )}
          </ul>
        )}

        <div className="pt-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              ← Return to Storefront
            </Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
