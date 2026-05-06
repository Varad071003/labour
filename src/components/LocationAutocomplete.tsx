import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { LOCATIONS } from "@/lib/locations";
import { cn } from "@/lib/utils";

export function LocationAutocomplete({
  value, onChange, placeholder, className,
}: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return LOCATIONS.filter((l) => l.toLowerCase().includes(q)).slice(0, 6);
  }, [value]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <Input
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={cn("h-12 text-base", className)}
        autoComplete="off"
      />
      {open && matches.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-border bg-popover p-1 shadow-elevated">
          {matches.map((m) => (
            <li key={m}>
              <button
                type="button"
                onClick={() => { onChange(m); setOpen(false); }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary"
              >
                {m}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
