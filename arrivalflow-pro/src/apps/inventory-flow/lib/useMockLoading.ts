import { useEffect, useState } from "react";

/** Simulates enterprise data-fetch latency so skeleton states are exercised. */
export function useMockLoading(delay = 550) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return loading;
}
