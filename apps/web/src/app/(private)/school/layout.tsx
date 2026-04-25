import type { Metadata } from "next";
import SchoolLayoutClient from "./layout-client";

export const metadata: Metadata = {
  title: "Gestão Escolar — SCAE",
};

export default function SchoolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolLayoutClient>{children}</SchoolLayoutClient>;
}
