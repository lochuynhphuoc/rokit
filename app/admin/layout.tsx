import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoKit Admin",
  description: "Admin dashboard for managing RoKit tools",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
