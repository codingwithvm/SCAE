import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Questionário — SCAE",
};

export default function QuizLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
