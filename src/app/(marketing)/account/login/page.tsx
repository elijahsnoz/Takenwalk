import { LoginForm } from "./LoginForm";

export default async function CustomerLoginPage({ searchParams }: PageProps<"/account/login">) {
  const params = await searchParams;
  const callbackUrl = typeof params.callbackUrl === "string" ? params.callbackUrl : "/account";

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-cream px-4 py-16">
      <LoginForm callbackUrl={callbackUrl} />
    </main>
  );
}
