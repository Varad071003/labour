import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Phone, ShieldCheck, Building2, HardHat } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { sendOtp, verifyOtp, setSession, type Role } from "@/lib/auth";

type LoginSearch = { role?: Role; redirect?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): LoginSearch => ({
    role: s.role === "employer" ? "employer" : "worker",
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const { t } = useI18n();
  const { role = "worker", redirect } = useSearch({ from: "/login" });
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState("");
  const [demoCode, setDemoCode] = useState<string | null>(null);

  const validPhone = /^[6-9]\d{9}$/.test(phone);

  const handleSend = () => {
    if (!validPhone) { toast.error(t("invalidPhone")); return; }
    const code = sendOtp(phone);
    setDemoCode(code);
    setStep("otp");
    toast.success(t("otpSent").replace("{phone}", `+91 ${phone}`));
  };

  const handleVerify = () => {
    if (!verifyOtp(phone, otp)) { toast.error(t("otpInvalid")); return; }
    setSession({ phone, role, loggedInAt: Date.now() });
    toast.success(role === "worker" ? t("workerLogin") : t("employerLogin"));
    navigate({ to: redirect ?? (role === "worker" ? "/worker" : "/employer") });
  };

  const RoleIcon = role === "worker" ? HardHat : Building2;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-md px-4 pt-6">
        <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> {t("back")}
        </Link>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-elevated sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-hero text-primary-foreground shadow-soft">
              <RoleIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                {role === "worker" ? t("workerLogin") : t("employerLogin")}
              </h1>
              <p className="text-sm text-muted-foreground">{t("signupLogin")}</p>
            </div>
          </div>

          {step === "phone" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">{t("phone")}</Label>
                <div className="flex h-12 items-stretch overflow-hidden rounded-md border border-input bg-transparent shadow-sm focus-within:ring-1 focus-within:ring-ring">
                  <span className="flex items-center gap-1 border-r border-input bg-secondary px-3 text-sm font-semibold text-secondary-foreground">
                    <Phone className="h-4 w-4" /> +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="9876543210"
                    className="flex-1 bg-transparent px-3 text-base outline-none"
                  />
                </div>
                <p className="text-xs text-muted-foreground">{t("phoneHint")}</p>
              </div>
              <Button
                onClick={handleSend}
                disabled={!validPhone}
                className="h-12 w-full rounded-full bg-gradient-accent text-base font-bold text-accent-foreground shadow-soft hover:opacity-95"
              >
                {t("sendOtp")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">{t("enterOtp")}</Label>
                <Input
                  type="tel"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="h-14 rounded-xl text-center text-2xl font-bold tracking-[0.6em]"
                  placeholder="••••••"
                />
                <p className="text-xs text-muted-foreground">
                  +91 {phone} · <button type="button" className="font-semibold text-primary underline-offset-2 hover:underline" onClick={() => { setStep("phone"); setOtp(""); }}>change</button>
                </p>
              </div>

              {demoCode && (
                <div className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-warning-foreground" />
                  <p className="text-warning-foreground">
                    {t("demoOtpNote")} <span className="font-mono font-bold">{demoCode}</span>
                  </p>
                </div>
              )}

              <Button
                onClick={handleVerify}
                disabled={otp.length !== 6}
                className="h-12 w-full rounded-full bg-gradient-accent text-base font-bold text-accent-foreground shadow-soft hover:opacity-95"
              >
                {t("verifyOtp")}
              </Button>
              <Button variant="ghost" onClick={handleSend} className="h-10 w-full rounded-full text-sm">
                {t("resend")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
