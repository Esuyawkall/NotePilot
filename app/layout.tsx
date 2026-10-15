
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import RootBody from "./rootBody";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: "NotePilot | AI Meeting Summarizer and Scheduler",
  description:
    "Summarize meetings, capture action items, track decisions, and schedule follow-up tasks with AI.",
  keywords: [
    "AI meeting summarizer",
    "meeting scheduler",
    "meeting notes",
    "task automation",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <RootBody>{children}</RootBody>
    </html>
  );
}
