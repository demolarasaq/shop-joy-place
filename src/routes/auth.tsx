import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { lovable } from "@/integrations/lovable";
import { SiteHeader } from "@/components/site-header";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Sabihub" },
      { name: "description", content: "Sign in or create your Sabihub account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: searchSchema,
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        await api.auth.signUp(email.trim(), password, displayName.trim() || "Sabihub user");
        toast.success("Account created", { description: "Welcome to Sabihub." });
      } else {
        await api.auth.signIn(email.trim(), password);
        toast.success("Signed in");
      }
      navigate({ to: redirect ?? "/dashboard" });
    } catch (err) {
      toast.error(mode === "signup" ? "Could not create account" : "Could not sign in", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    try {
      await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
    } catch (err) {
      toast.error("Google sign-in failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-md px-4 py-16">
        <div className="text-xs font-medium tracking-[0.2em] text-primary-glow uppercase">
          {mode === "signup" ? "Create account" : "Welcome back"}
        </div>
        <h1 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
          {mode === "signup" ? "Join Sabihub." : "Sign in to Sabihub."}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Every purchase is protected by bank-held escrow and a 24-hour inspection window.
        </p>

        <form onSubmit={submit} className="surface-glass mt-8 space-y-4 rounded-2xl p-6">
          {mode === "signup" && (
            <div>
              <label className="text-sm font-medium" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="Adaeze Okafor"
                required
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              className="mt-1 w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="At least 6 characters"
              required
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="bg-gradient-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signup" ? "Create account" : "Sign in"}
          </button>

          <div className="relative py-1 text-center text-xs text-muted-foreground">
            <span className="bg-transparent px-2">or</span>
          </div>

          <button
            type="button"
            onClick={google}
            className="surface-glass w-full rounded-xl px-5 py-2.5 text-sm font-medium hover:text-primary-glow"
          >
            Continue with Google
          </button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          {mode === "signup" ? "Already have an account?" : "New to Sabihub?"}{" "}
          <button
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            className="text-primary-glow hover:underline"
          >
            {mode === "signup" ? "Sign in" : "Create one"}
          </button>
        </p>

        <p className="mt-8 inline-flex items-start gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 text-trust" />
          New accounts start as buyers. You can switch on selling from your dashboard, then
          complete verification before your first listing goes live.
        </p>
      </section>
    </div>
  );
}
