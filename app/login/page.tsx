"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Unable to sign in. Please check your email and password.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong while signing you in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="pointer-events-none absolute -left-48 -top-48 h-[520px] w-[520px] rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-56 right-0 h-[620px] w-[620px] rounded-full bg-sky-500/[0.08] blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 lg:px-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="group inline-flex items-center gap-3" aria-label="Back to AI Lead Machine home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400 text-[#07111f] shadow-[0_0_28px_rgba(52,211,153,0.24)] transition-transform group-hover:scale-105">
              <Sparkles size={19} strokeWidth={2.5} />
            </span>
            <span className="text-[15px] font-semibold tracking-tight sm:text-base">AI Lead Machine</span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white">
            <ArrowLeft size={15} /> Back to home
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-16 py-14 lg:grid-cols-[1fr_0.82fr] lg:gap-24 lg:py-20">
          <section className="hidden max-w-xl lg:block">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3.5 py-2 text-xs font-medium text-emerald-200">
              <ShieldCheck size={14} /> AI Lead Machine
            </div>
            <p className="text-lg font-medium text-emerald-200">Your real estate pipeline, in one place.</p>
            <h1 className="mt-4 max-w-lg text-5xl font-semibold leading-[1.06] tracking-[-0.04em] xl:text-6xl">
              Turn every opportunity into your next closing.
            </h1>
            <p className="mt-7 max-w-md text-lg leading-8 text-slate-300">
              Sign in to manage leads, follow-ups, appointments, properties, and your sales pipeline from one intelligent workspace.
            </p>
            <div className="mt-10 space-y-4 text-sm text-slate-300">
              {[
                "One clear view of every active opportunity",
                "AI-powered lead prioritisation",
                "Organized follow-ups and appointments",
                "Real-time visibility into your sales pipeline",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-300/15 text-emerald-300"><Check size={13} strokeWidth={3} /></span>
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto w-full max-w-[460px]">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-2 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-3">
              <div className="rounded-[21px] bg-[#f8fafc] px-6 py-8 text-slate-900 shadow-inner sm:px-9 sm:py-10">
                <div className="mb-8">
                  <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#07111f] text-emerald-300 shadow-lg shadow-slate-900/10"><LockKeyhole size={20} /></div>
                  <h2 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950">Welcome back.</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-500">Sign in to continue managing your real estate pipeline.</p>
                </div>

                {error && (
                  <div id="login-error" role="alert" aria-live="polite" className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
                    <TriangleAlert size={17} className="mt-0.5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Work email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@company.com"
                      required
                      disabled={isLoading}
                      spellCheck={false}
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? "login-error" : undefined}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                      <span className="text-xs text-slate-400">Min. 8 characters</span>
                    </div>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter your password"
                        minLength={8}
                        required
                        disabled={isLoading}
                        aria-invalid={Boolean(error)}
                        aria-describedby={error ? "login-error" : undefined}
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((visible) => !visible)}
                        className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-slate-400 transition-colors hover:text-slate-700"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#07111f] px-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition-all hover:-translate-y-0.5 hover:bg-[#10243a] hover:shadow-xl disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
                  >
                    {isLoading ? <><LoaderCircle size={17} className="animate-spin" /> Signing you in...</> : <>Sign In <ArrowRight size={17} /></>}
                  </button>
                </form>
                <p className="mt-7 text-center text-sm text-slate-500">New to AI Lead Machine? <Link href="/signup" className="font-semibold text-emerald-700 hover:text-emerald-800">Create your workspace</Link></p>
              </div>
            </div>
            <p className="mt-5 text-center text-xs leading-5 text-slate-500">By continuing, you agree to use this workspace responsibly and keep your account secure.</p>
          </section>
        </div>

        <footer className="flex items-center justify-between border-t border-white/10 pt-5 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} AI Lead Machine</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck size={13} className="text-emerald-300" /> Secure workspace · AI Lead Machine</span>
        </footer>
      </div>
    </main>
  );
}
