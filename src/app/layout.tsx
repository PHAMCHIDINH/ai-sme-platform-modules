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
  title: "VnSMEMatch | Thu hẹp khoảng cách giữa đào tạo và nhu cầu thị trường",
  description: "Nền tảng biến nhu cầu SME thành dự án thực chiến cho sinh viên.",
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
