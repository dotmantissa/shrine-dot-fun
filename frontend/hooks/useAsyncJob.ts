import { useEffect, useState } from "react";

export type AsyncStatus = "Submitted" | "Committed" | "Processing" | "Ready" | "Settled" | "Failed" | "Expired";

export function useAsyncJob() {
  const [status, setStatus] = useState<AsyncStatus>("Submitted");
  const [jobId, setJobId] = useState<string>("");
  const [result, setResult] = useState<string>("");

  useEffect(() => {
    setStatus("Processing");
    const t = setTimeout(() => setStatus("Settled"), 3000);
    return () => clearTimeout(t);
  }, []);

  return { status, jobId, result, setJobId, setResult };
}
