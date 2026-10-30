import type { Metadata } from "next";

import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: {
    default: "ScopeSignal",
    template: "%s · ScopeSignal",
  },
  description:
    "Analyze project scope descriptions for delivery risks, ambiguities, and clarifying questions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">{children}</main>
      </body>
    </html>
  );
}
