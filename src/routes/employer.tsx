import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Briefcase, Check, MapPin, Plus, Users, X, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
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
  SKILLS, getJobs, addJob, setApplicantStatus,
  type Job, type SkillKey, type Experience, type Duration, type WageUnit,
} from "@/lib/data";
import { getSession, clearSession } from "@/lib/auth";

export const Route = createFileRoute("/employer")({
  component: EmployerPage,
});

function EmployerPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [session, setSess] = useState(getSession());
  const refresh = () => setJobs(getJobs());
  useEffect(() => {
    refresh();
    const s = getSession();
    setSess(s);
    if (!s || s.role !== "employer") {
      navigate({ to: "/login", search: { role: "employer", redirect: "/employer" } });
    }
  }, [navigate]);

  const handleLogout = () => {
    clearSession();
    setSess(null);
    toast.success("Logged out");
    navigate({ to: "/" });
  };

  if (!session || session.role !== "employer") return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <div className="mb-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> {t("back")}
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="hidden sm:inline">+91 {session.phone}</span>
            <Button size="sm" variant="ghost" onClick={handleLogout} className="h-8 gap-1 rounded-full">
              <LogOut className="h-3.5 w-3.5" /> {t("logout")}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="post" className="w-full">
          <TabsList className="grid h-12 w-full grid-cols-2 rounded-full bg-secondary p-1">
            <TabsTrigger value="post" className="h-10 rounded-full text-base font-semibold data-[state=active]:bg-card data-[state=active]:shadow-soft">
              {t("postJob")}
            </TabsTrigger>
            <TabsTrigger value="mine" className="h-10 rounded-full text-base font-semibold data-[state=active]:bg-card data-[state=active]:shadow-soft">
              {t("myJobs")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="post" className="mt-6">
            <PostJobForm onPosted={refresh} />
          </TabsContent>

          <TabsContent value="mine" className="mt-6 space-y-4">
            <MyJobs jobs={jobs} onChange={refresh} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

const initialForm = {
  title: "", skill: "Mason" as SkillKey, location: "", wage: "", wageUnit: "perDay" as WageUnit,
  duration: "daily" as Duration, experience: "any" as Experience, workersNeeded: "1",
  employerName: "", contact: "",
};

function PostJobForm({ onPosted }: { onPosted: () => void }) {
  const { t } = useI18n();
  const [form, setForm] = useState(initialForm);

  const submit = () => {
    if (!form.title || !form.location || !form.wage || !form.employerName) {
      toast.error("Please fill required fields");
      return;
    }
    addJob({
      id: crypto.randomUUID(),
      title: form.title, skill: form.skill, location: form.location,
      wage: Number(form.wage), wageUnit: form.wageUnit, duration: form.duration,
      experience: form.experience, workersNeeded: Number(form.workersNeeded || 1),
      employerName: form.employerName, contact: form.contact,
      postedAt: Date.now(), applicants: [],
    });
    toast.success(t("jobPosted"));
    setForm(initialForm);
    onPosted();
  };

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-soft">
      <Field label={t("jobTitle")}>
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-12 text-base" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("laborType")}>
          <Select value={form.skill} onValueChange={(v) => setForm({ ...form, skill: v as SkillKey })}>
            <SelectTrigger className="h-12 text-base"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SKILLS.map(({ key }) => <SelectItem key={key} value={key}>{t(key)}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label={t("location")}>
          <LocationAutocomplete value={form.location} onChange={(v) => setForm({ ...form, location: v })} placeholder="Area, City" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={t("wage")}>
          <Input type="number" inputMode="numeric" value={form.wage} onChange={(e) => setForm({ ...form, wage: e.target.value })} className="h-12 text-base" />
        </Field>
        <Field label="">
          <Select value={form.wageUnit} onValueChange={(v) => setForm({ ...form, wageUnit: v as WageUnit })}>
            <SelectTrigger className="h-12 text-base"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="perDay">{t("perDay")}</SelectItem>
              <SelectItem value="perHour">{t("perHour")}</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label={t("duration")}>
          <Select value={form.duration} onValueChange={(v) => setForm({ ...form, duration: v as Duration })}>
            <SelectTrigger className="h-12 text-base"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">{t("daily")}</SelectItem>
              <SelectItem value="weekly">{t("weekly")}</SelectItem>
              <SelectItem value="monthly">{t("monthly")}</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("expRequired")}>
          <Select value={form.experience} onValueChange={(v) => setForm({ ...form, experience: v as Experience })}>
            <SelectTrigger className="h-12 text-base"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">{t("any")}</SelectItem>
              <SelectItem value="fresher">{t("fresher")}</SelectItem>
              <SelectItem value="exp1">{t("exp1")}</SelectItem>
              <SelectItem value="exp3">{t("exp3")}</SelectItem>
              <SelectItem value="exp5">{t("exp5")}</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label={t("workersNeeded")}>
          <Input type="number" inputMode="numeric" min={1} value={form.workersNeeded} onChange={(e) => setForm({ ...form, workersNeeded: e.target.value })} className="h-12 text-base" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("postedBy")}>
          <Input value={form.employerName} onChange={(e) => setForm({ ...form, employerName: e.target.value })} className="h-12 text-base" />
        </Field>
        <Field label={t("contact")}>
          <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="h-12 text-base" placeholder="+91 ..." />
        </Field>
      </div>

      <Button onClick={submit} className="h-12 w-full rounded-full bg-gradient-accent text-base font-bold text-accent-foreground shadow-soft hover:opacity-95">
        <Plus className="mr-1.5 h-5 w-5" /> {t("publish")}
      </Button>
    </div>
  );
}

function MyJobs({ jobs, onChange }: { jobs: Job[]; onChange: () => void }) {
  const { t } = useI18n();
  if (jobs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
        <Briefcase className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-3">{t("noPosts")}</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {jobs.map((j) => (
        <div key={j.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold">{j.title}</h3>
              <p className="text-sm text-muted-foreground">{t(j.skill)}</p>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {j.location}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">₹{j.wage}</p>
              <p className="text-xs text-muted-foreground">{t(j.wageUnit)}</p>
            </div>
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <Users className="h-4 w-4 text-primary" /> {t("applicants")} ({j.applicants.length})
            </p>
            {j.applicants.length === 0 ? (
              <p className="text-sm text-muted-foreground">—</p>
            ) : (
              <ul className="space-y-2">
                {j.applicants.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 rounded-xl bg-secondary/60 px-3 py-2">
                    <span className="text-sm font-medium">{a.name}</span>
                    {a.status === "pending" ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => { setApplicantStatus(j.id, a.id, "accepted"); onChange(); }}
                          className="h-9 rounded-full bg-success text-success-foreground hover:bg-success/90">
                          <Check className="mr-1 h-4 w-4" />{t("accept")}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setApplicantStatus(j.id, a.id, "rejected"); onChange(); }}
                          className="h-9 rounded-full">
                          <X className="mr-1 h-4 w-4" />{t("reject")}
                        </Button>
                      </div>
                    ) : (
                      <span className={`text-xs font-semibold uppercase ${a.status === "accepted" ? "text-success" : "text-destructive"}`}>
                        {a.status}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      {label && <Label className="text-sm font-semibold text-foreground">{label}</Label>}
      {children}
    </div>
  );
}
