"use client";
import { ReactNode, useEffect, useState } from "react";
import { enableMocking } from "../lib/mocks";

export function Providers({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    enableMocking().then(() => setReady(true));
  }, []);

  if (!ready) return null; // モックが立ち上がるまでレンダリングしない

  return <>{children}</>;
}
