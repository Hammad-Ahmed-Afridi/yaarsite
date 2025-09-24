"use client";

import { MadeWithDyad } from "@/components/made-with-dyad";
import { useSession } from "@/components/session-context-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-background text-foreground">
      <main className="flex flex-col gap-8 row-start-1 items-center sm:items-start">
        <h1 className="text-3xl font-bold">Welcome, {user.email}!</h1>
        <p className="text-lg">Your tenant slug is: <span className="font-mono bg-muted px-2 py-1 rounded">{user.user_metadata?.tenant_slug || 'N/A'}</span></p>
        <p>This is your main application page. More content will go here.</p>
        <Button onClick={async () => {
          await supabase.auth.signOut();
          router.push('/login');
        }}>Sign Out</Button>
      </main>
      <MadeWithDyad />
    </div>
  );
}