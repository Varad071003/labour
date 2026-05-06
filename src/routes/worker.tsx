import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, MapPin, Search, UserCircle2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { JobCard } from "@/components/JobCard";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import {
  SKILLS, type SkillKey, type Experience,
  getJobs, getProfile, saveProfile, getApplied, applyToJob, type Job, type Profile,
} from "@/lib/data";
import { getSession, clearSession } from "@/lib/auth";

export const Route = createFileRoute("/worker")({
  component: WorkerPage,
});

function WorkerPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applied, setApplied] = useState<string[]>([]);
  const [profile, setProfile] = useState<Profile>({ name: "", age: "", location: "", skills: [], experience: "fresher" });
  const [query, setQuery] = useState("");
  const [session, setSess] = useState(getSession());

  useEffect(() => {
    setJobs(getJobs());
    setApplied(getApplied());
    setProfile(getProfile());
    setSess(getSession());
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((j) => {
      if (profile.skills.length && !profile.skills.includes(j.skill) && !q) return true;
      if (!q) return true;
      return (
        j.title.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        t(j.skill).toLowerCase().includes(q)
      );
    });
  }, [jobs, query, profile.skills, t]);

  const handleApply = (jobId: string) => {
    const sess = getSession();
    const prof = getProfile();
    if (!sess || sess.role !== "worker") {
      toast.error(t("loginToApply"));
      navigate({ to: "/login", search: { role: "worker", redirect: "/worker" } });
      return;
    }
    if (!prof.name || !prof.age || !prof.location || prof.skills.length === 0) {
      toast.error(t("completeProfile"));
      return;
    }
    applyToJob(jobId, prof.name);
    setApplied(getApplied());
    toast.success(t("applied"));
  };

  const handleLogout = () => {
    clearSession();
    setSess(null);
    toast.success("Logged out");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <div className="mb-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> {t("back")}
          </Link>
          {session ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="hidden sm:inline">+91 {session.phone}</span>
              <Button size="sm" variant="ghost" onClick={handleLogout} className="h-8 gap-1 rounded-full">
                <LogOut className="h-3.5 w-3.5" /> {t("logout")}
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => navigate({ to: "/login", search: { role: "worker", redirect: "/worker" } })}
              className="h-8 rounded-full">{t("login")}</Button>
          )}
        </div>

        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="grid h-12 w-full grid-cols-2 rounded-full bg-secondary p-1">
            <TabsTrigger value="jobs" className="h-10 rounded-full text-base font-semibold data-[state=active]:bg-card data-[state=active]:shadow-soft">
              {t("jobs")}
            </TabsTrigger>
            <TabsTrigger value="profile" className="h-10 rounded-full text-base font-semibold data-[state=active]:bg-card data-[state=active]:shadow-soft">
              {t("profile")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="mt-6 space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-12 rounded-full border-border bg-card pl-11 text-base shadow-soft"
              />
            </div>

            {filtered.length === 0 ? (
              <EmptyState text={t("noJobs")} />
            ) : (
              <div className="grid gap-4">
                {filtered.map((j) => (
                  <JobCard key={j.id} job={j} applied={applied.includes(j.id)} onApply={() => handleApply(j.id)} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <ProfileForm
              profile={profile}
              onChange={setProfile}
              onSave={() => {
                if (!profile.age || Number(profile.age) < 18) {
                  toast.error(t("ageMin"));
                  return;
                }
                saveProfile(profile);
                toast.success(t("saved"));
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
      <UserCircle2 className="mx-auto h-10 w-10 text-muted-foreground/50" />
      <p className="mt-3">{text}</p>
    </div>
  );
}

function ProfileForm({
  profile, onChange, onSave,
}: { profile: Profile; onChange: (p: Profile) => void; onSave: () => void }) {
  const { t } = useI18n();

  const toggleSkill = (s: SkillKey) => {
    const has = profile.skills.includes(s);
    onChange({ ...profile, skills: has ? profile.skills.filter((x) => x !== s) : [...profile.skills, s] });
  };

  const detect = () => {
    if (!navigator.geolocation) { toast.error("Geolocation not available"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => onChange({ ...profile, location: `Lat ${pos.coords.latitude.toFixed(3)}, Lng ${pos.coords.longitude.toFixed(3)}` }),
      () => toast.error("Could not detect location"),
    );
  };

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("name")}>
          <Input value={profile.name} onChange={(e) => onChange({ ...profile, name: e.target.value })} className="h-12 text-base" />
        </Field>
        <Field label={t("age")}>
          <Input
            type="number"
            inputMode="numeric"
            min={18}
            max={80}
            value={profile.age}
            onChange={(e) => onChange({ ...profile, age: e.target.value })}
            className="h-12 text-base"
            placeholder="18+"
          />
        </Field>
      </div>

      <Field label={t("location")}>
        <div className="flex gap-2">
          <div className="flex-1">
            <LocationAutocomplete
              value={profile.location}
              onChange={(v) => onChange({ ...profile, location: v })}
              placeholder="Start typing your area…"
            />
          </div>
          <Button type="button" variant="outline" onClick={detect} className="h-12 shrink-0 rounded-xl px-3 sm:px-4">
            <MapPin className="h-4 w-4 sm:mr-1.5" /><span className="hidden sm:inline">{t("detect")}</span>
          </Button>
        </div>
      </Field>

      <Field label={t("experience")}>
        <Select value={profile.experience} onValueChange={(v) => onChange({ ...profile, experience: v as Experience })}>
          <SelectTrigger className="h-12 text-base"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="fresher">{t("fresher")}</SelectItem>
            <SelectItem value="exp1">{t("exp1")}</SelectItem>
            <SelectItem value="exp3">{t("exp3")}</SelectItem>
            <SelectItem value="exp5">{t("exp5")}</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field label={t("skills")}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SKILLS.map(({ key, icon: Icon }) => {
            const active = profile.skills.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleSkill(key)}
                className={`flex items-center gap-2 rounded-xl border-2 px-3 py-3 text-left text-sm font-medium transition-all ${
                  active
                    ? "border-primary bg-primary/10 text-primary shadow-soft"
                    : "border-border bg-surface text-foreground hover:border-primary/40"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{t(key)}</span>
              </button>
            );
          })}
        </div>
      </Field>

      <Button onClick={onSave} className="h-12 w-full rounded-full bg-gradient-accent text-base font-bold text-accent-foreground shadow-soft hover:opacity-95">
        {t("save")}
      </Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-foreground">{label}</Label>
      {children}
    </div>
  );
}
