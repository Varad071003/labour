import { MapPin, Clock, Users, IndianRupee, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { SKILLS, type Job } from "@/lib/data";

export function JobCard({ job, applied, onApply }: {
  job: Job; applied: boolean; onApply: () => void;
}) {
  const { t } = useI18n();
  const skill = SKILLS.find((s) => s.key === job.skill)!;
  const Icon = skill.icon;
  return (
    <article className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold leading-tight">{job.title}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{t(job.skill)}</p>
          </div>
        </div>
        <Badge variant="secondary" className="shrink-0 rounded-full bg-success/15 text-success hover:bg-success/15">
          {t(job.duration)}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" /> <span className="truncate">{job.location}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <IndianRupee className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">₹{job.wage}</span>
          <span>{t(job.wageUnit)}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4 text-primary" /> {job.experience === "any" ? t("any") : t(job.experience)}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4 text-primary" /> {job.workersNeeded}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{t("postedBy")}</p>
          <p className="truncate text-sm font-medium">{job.employerName}</p>
        </div>
        <Button
          size="lg"
          onClick={onApply}
          disabled={applied}
          className={`h-11 rounded-full px-6 font-semibold ${
            applied
              ? "bg-success text-success-foreground hover:bg-success"
              : "bg-gradient-accent text-accent-foreground shadow-soft hover:opacity-95"
          }`}
        >
          {applied ? (<><CheckCircle2 className="mr-1.5 h-4 w-4" />{t("applied")}</>) : t("apply")}
        </Button>
      </div>
    </article>
  );
}
