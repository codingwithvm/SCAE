import type { Metadata } from "next";
import MunicipalLayoutClient from "./layout-client";

export const metadata: Metadata = {
  title: "Gestor Municipal — SCAE",
};

export default function MunicipalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MunicipalLayoutClient>{children}</MunicipalLayoutClient>;
}
