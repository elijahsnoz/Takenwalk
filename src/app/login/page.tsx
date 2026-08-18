import { LoginForm } from "./LoginForm";

// Server Component reading searchParams directly — no client-side
// useSearchParams()/Suspense bailout, so the form renders in the very first
// HTML response instead of appearing only after JS hydrates. Matters on the
// slow mobile connections this admin tool gets used on out in the field.
export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const callbackUrl = typeof params.callbackUrl === "string" ? params.callbackUrl : "/admin/piwoyi";

  return (
    <main className="min-h-screen flex items-center justify-center bg-cream px-4 py-16">
      <LoginForm callbackUrl={callbackUrl} />
    </main>
  );
}
