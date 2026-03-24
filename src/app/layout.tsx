import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/modules/shared";
import { AppProviders } from "@/components/providers/app-providers";

const geist = Inter({subsets:['latin'],variable:'--font-sans'});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "VnSMEMatch | Career Portal for Real SME Projects",
  description:
    "Nền tảng marketplace kết nối SME và sinh viên qua các dự án thực chiến, với discovery, matching, và execution flow nhất quán.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body className={cn(geist.variable, spaceGrotesk.variable, "antialiased")}>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
