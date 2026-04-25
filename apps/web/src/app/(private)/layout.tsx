import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Dashboard — SCAE",
};

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
