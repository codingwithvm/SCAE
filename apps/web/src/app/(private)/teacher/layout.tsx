import { type ReactNode } from "react";
import TeacherLayoutClient from "./layout-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Professor — SCAE",
};

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return <TeacherLayoutClient>{children}</TeacherLayoutClient>;
}
