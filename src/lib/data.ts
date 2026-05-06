import {
  Hammer, Wrench, Zap, Droplet, Paintbrush, Flame, HandHelping,
  HardHat, Truck, Sparkles, ShieldCheck, Sprout, MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

export type SkillKey =
  | "Mason" | "Carpenter" | "Electrician" | "Plumber" | "Painter" | "Welder"
  | "Helper" | "ConstructionWorker" | "Driver" | "Cleaner" | "SecurityGuard"
  | "FarmWorker" | "Other";

export const SKILLS: { key: SkillKey; icon: LucideIcon }[] = [
  { key: "Mason", icon: Hammer },
  { key: "Carpenter", icon: Wrench },
  { key: "Electrician", icon: Zap },
  { key: "Plumber", icon: Droplet },
  { key: "Painter", icon: Paintbrush },
  { key: "Welder", icon: Flame },
  { key: "Helper", icon: HandHelping },
  { key: "ConstructionWorker", icon: HardHat },
  { key: "Driver", icon: Truck },
  { key: "Cleaner", icon: Sparkles },
  { key: "SecurityGuard", icon: ShieldCheck },
  { key: "FarmWorker", icon: Sprout },
  { key: "Other", icon: MoreHorizontal },
];

export type Experience = "fresher" | "exp1" | "exp3" | "exp5" | "any";
export type Duration = "daily" | "weekly" | "monthly";
export type WageUnit = "perDay" | "perHour";

export type Job = {
  id: string;
  title: string;
  skill: SkillKey;
  location: string;
  wage: number;
  wageUnit: WageUnit;
  duration: Duration;
  experience: Experience;
  workersNeeded: number;
  employerName: string;
  contact: string;
  postedAt: number;
  applicants: { id: string; name: string; status: "pending" | "accepted" | "rejected" }[];
};

const SEED: Job[] = [
  {
    id: "seed-1", title: "House wiring work", skill: "Electrician",
    location: "Kothrud, Pune", wage: 900, wageUnit: "perDay", duration: "daily",
    experience: "exp3", workersNeeded: 2, employerName: "Sharma Constructions",
    contact: "+91 98xxxxxx12", postedAt: Date.now() - 1000 * 60 * 60 * 3, applicants: [],
  },
  {
    id: "seed-2", title: "Plastering — 2BHK", skill: "Mason",
    location: "Hinjewadi, Pune", wage: 750, wageUnit: "perDay", duration: "weekly",
    experience: "exp1", workersNeeded: 4, employerName: "BuildRight Pvt Ltd",
    contact: "+91 99xxxxxx08", postedAt: Date.now() - 1000 * 60 * 60 * 8, applicants: [],
  },
  {
    id: "seed-3", title: "Office cleaning staff", skill: "Cleaner",
    location: "Baner, Pune", wage: 600, wageUnit: "perDay", duration: "monthly",
    experience: "fresher", workersNeeded: 3, employerName: "GreenSpace Facility",
    contact: "+91 97xxxxxx55", postedAt: Date.now() - 1000 * 60 * 60 * 24, applicants: [],
  },
  {
    id: "seed-4", title: "Tempo driver — local routes", skill: "Driver",
    location: "Wakad, Pune", wage: 110, wageUnit: "perHour", duration: "daily",
    experience: "exp3", workersNeeded: 1, employerName: "QuickHaul Logistics",
    contact: "+91 96xxxxxx21", postedAt: Date.now() - 1000 * 60 * 60 * 30, applicants: [],
  },
  {
    id: "seed-5", title: "Wall painting — bungalow", skill: "Painter",
    location: "Aundh, Pune", wage: 850, wageUnit: "perDay", duration: "weekly",
    experience: "exp1", workersNeeded: 2, employerName: "Patil Interiors",
    contact: "+91 98xxxxxx77", postedAt: Date.now() - 1000 * 60 * 60 * 50, applicants: [],
  },
];

const JOBS_KEY = "wl_jobs_v1";
const PROFILE_KEY = "wl_profile_v1";
const APPLIED_KEY = "wl_applied_v1";

export function getJobs(): Job[] {
  if (typeof window === "undefined") return SEED;
  const raw = localStorage.getItem(JOBS_KEY);
  if (!raw) {
    localStorage.setItem(JOBS_KEY, JSON.stringify(SEED));
    return SEED;
  }
  try { return JSON.parse(raw); } catch { return SEED; }
}
export function saveJobs(jobs: Job[]) {
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
}
export function addJob(job: Job) {
  const jobs = getJobs();
  jobs.unshift(job);
  saveJobs(jobs);
}

export type Profile = {
  name: string;
  age: string;
  location: string;
  skills: SkillKey[];
  experience: Experience;
};
export function getProfile(): Profile {
  if (typeof window === "undefined")
    return { name: "", age: "", location: "", skills: [], experience: "fresher" };
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return { name: "", age: "", location: "", skills: [], experience: "fresher" };
  try { return JSON.parse(raw); } catch {
    return { name: "", age: "", location: "", skills: [], experience: "fresher" };
  }
}
export function saveProfile(p: Profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

export function getApplied(): string[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(APPLIED_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}
export function applyToJob(jobId: string, applicantName: string) {
  const applied = getApplied();
  if (!applied.includes(jobId)) {
    applied.push(jobId);
    localStorage.setItem(APPLIED_KEY, JSON.stringify(applied));
  }
  const jobs = getJobs();
  const j = jobs.find((x) => x.id === jobId);
  if (j && !j.applicants.find((a) => a.name === applicantName)) {
    j.applicants.push({ id: crypto.randomUUID(), name: applicantName || "Worker", status: "pending" });
    saveJobs(jobs);
  }
}
export function setApplicantStatus(jobId: string, applicantId: string, status: "accepted" | "rejected") {
  const jobs = getJobs();
  const j = jobs.find((x) => x.id === jobId);
  if (!j) return;
  const a = j.applicants.find((x) => x.id === applicantId);
  if (a) { a.status = status; saveJobs(jobs); }
}
