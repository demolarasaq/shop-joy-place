export function formatNaira(n: number): string {
  return "₦" + n.toLocaleString("en-NG");
}

export function timeLeft(iso: string, now = Date.now()): {
  ms: number;
  label: string;
  urgent: boolean;
  ended: boolean;
} {
  const ms = new Date(iso).getTime() - now;
  if (ms <= 0) return { ms: 0, label: "Ended", urgent: false, ended: true };
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const label =
    d > 0 ? `${d}d ${h}h ${m}m` : h > 0 ? `${h}h ${m}m ${String(sec).padStart(2, "0")}s` : `${m}m ${String(sec).padStart(2, "0")}s`;
  return { ms, label, urgent: ms < 60 * 60 * 1000, ended: false };
}
