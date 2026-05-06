import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, HardHat, Building2, MapPin, Languages, Zap } from "lucide-react";
import { Header } from "@/components/Header";
import { useI18n } from "@/lib/i18n";
import { getSession, type Role } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const goRole = (role: Role) => {
    const sess = getSession();
    if (sess && sess.role === role) navigate({ to: role === "worker" ? "/worker" : "/employer" });
    else navigate({ to: "/login", search: { role, redirect: role === "worker" ? "/worker" : "/employer" } });
  };
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero opacity-[0.97]" />
          <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />
          <div className="absolute -top-20 -left-16 h-72 w-72 rounded-full bg-primary/40 blur-3xl" />
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24 md:py-28">
            <div className="max-w-2xl text-primary-foreground">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
                <Zap className="h-3.5 w-3.5" /> {t("near")} • EN / हिन्दी / मराठी
              </span>
              <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.05] sm:text-5xl md:text-6xl">
                {t("tagline")}
              </h1>
              <p className="mt-5 max-w-xl text-balance text-base text-primary-foreground/85 sm:text-lg">
                {t("heroSub")}
              </p>
            </div>

            {/* Role choice */}
            <div className="relative mt-10 grid gap-4 sm:grid-cols-2">
              <RoleCard
                onClick={() => goRole("worker")}
                icon={<HardHat className="h-7 w-7" />}
                title={t("iAmWorker")}
                sub={t("workerSub")}
                accent
              />
              <RoleCard
                onClick={() => goRole("employer")}
                icon={<Building2 className="h-7 w-7" />}
                title={t("iAmEmployer")}
                sub={t("employerSub")}
              />
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-5 sm:grid-cols-3">
            <Feature icon={<MapPin />} title="Nearby first" text="Jobs ranked by your location so you don't waste time travelling." />
            <Feature icon={<Languages />} title="Your language" text="Switch instantly between English, हिन्दी and मराठी." />
            <Feature icon={<Zap />} title="One-tap apply" text="Big buttons, simple flow — designed for fast hiring on the go." />
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {t("appName")} — built for real workers, real jobs.
        </div>
      </footer>
    </div>
  );
}

function RoleCard({ onClick, icon, title, sub, accent }: {
  onClick: () => void; icon: React.ReactNode; title: string; sub: string; accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full items-center gap-4 rounded-3xl border p-6 text-left shadow-elevated transition-all hover:-translate-y-1 ${
        accent
          ? "border-transparent bg-gradient-accent text-accent-foreground"
          : "border-border bg-card text-card-foreground"
      }`}
    >
      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
        accent ? "bg-white/25 text-accent-foreground" : "bg-secondary text-primary"
      }`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xl font-bold leading-tight">{title}</p>
        <p className={`text-sm ${accent ? "text-accent-foreground/85" : "text-muted-foreground"}`}>{sub}</p>
      </div>
      <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
    </button>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">{icon}</div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
