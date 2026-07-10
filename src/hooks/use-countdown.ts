import { useEffect, useState } from "react";
import { timeLeft } from "@/lib/format";

export function useCountdown(iso: string) {
  const [tick, setTick] = useState(() => timeLeft(iso));
  useEffect(() => {
    setTick(timeLeft(iso));
    const id = setInterval(() => setTick(timeLeft(iso)), 1000);
    return () => clearInterval(id);
  }, [iso]);
  return tick;
}
